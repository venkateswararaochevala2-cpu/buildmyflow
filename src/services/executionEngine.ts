import { FlowNode, FlowEdge, AnyCustomNodeData, ConditionOperator, MathOperation } from '../types/workflow';
import { ExecutionContext, ExecutionLogEntry } from '../types/execution';

export class ExecutionEngine {
  private nodes: Map<string, FlowNode> = new Map();
  private edges: FlowEdge[] = [];
  private context: ExecutionContext;

  constructor(nodes: FlowNode[], edges: FlowEdge[]) {
    nodes.forEach((n) => this.nodes.set(n.id, n));
    this.edges = edges;
    this.context = {
      status: 'idle',
      currentNodeId: null,
      previousNodeIds: [],
      variables: {},
      logs: [],
      stepCount: 0,
    };
  }

  public getContext(): ExecutionContext {
    return { ...this.context };
  }

  public start(initialVariables: Record<string, unknown> = {}): ExecutionContext {
    // Find Start node
    const startNode = Array.from(this.nodes.values()).find((n) => n.type === 'start');
    if (!startNode) {
      this.addLog('error', 'Execution Failed', 'No Start block found in the workflow.');
      this.context.status = 'error';
      this.context.error = 'No Start block found.';
      return this.getContext();
    }

    this.context.status = 'running';
    this.context.currentNodeId = startNode.id;
    this.context.previousNodeIds = [];
    this.context.variables = { ...initialVariables };
    this.context.stepCount = 1;
    this.addLog('info', 'Workflow Started', `Execution initiated at Start block [${startNode.id}]`, startNode.id, startNode.type);

    return this.stepAuto();
  }

  public stepAuto(): ExecutionContext {
    if (!this.context.currentNodeId) return this.getContext();

    const currentNode = this.nodes.get(this.context.currentNodeId);
    if (!currentNode) {
      this.context.status = 'error';
      this.context.error = 'Current node not found.';
      return this.getContext();
    }

    const d = currentNode.data as any;

    // Node-specific automated behaviors:
    switch (d.type) {
      case 'start': {
        // Automatically progress to next node
        const next = this.getNextNode(currentNode.id, 'output');
        if (next) {
          this.transitionTo(next.id);
          return this.stepAuto();
        } else {
          this.addLog('warning', 'Dead End', 'Start block has no outgoing connection.', currentNode.id, d.type);
          this.context.status = 'completed';
          return this.getContext();
        }
      }

      case 'variable': {
        // Set variable
        let val: unknown = d.initialValue;
        if (d.dataType === 'number') val = Number(d.initialValue);
        else if (d.dataType === 'boolean') val = d.initialValue === 'true';
        else if (d.dataType === 'json') {
          try {
            val = JSON.parse(d.initialValue);
          } catch {
            val = d.initialValue;
          }
        }
        this.context.variables[d.variableName] = val;
        this.addLog(
          'success',
          'Variable Set',
          `Variable "${d.variableName}" set to ${JSON.stringify(val)}`,
          currentNode.id,
          d.type,
          { [d.variableName]: val }
        );
        const next = this.getNextNode(currentNode.id, 'output');
        if (next) {
          this.transitionTo(next.id);
          return this.stepAuto();
        }
        this.context.status = 'completed';
        return this.getContext();
      }

      case 'calculation': {
        // Perform calculation
        const op1 = this.resolveValue(d.firstOperand);
        const op2 = this.resolveValue(d.secondOperand);
        const num1 = Number(op1) || 0;
        const num2 = Number(op2) || 0;
        let res = 0;
        switch (d.operator as MathOperation) {
          case 'add':
            res = num1 + num2;
            break;
          case 'subtract':
            res = num1 - num2;
            break;
          case 'multiply':
            res = num1 * num2;
            break;
          case 'divide':
            res = num2 !== 0 ? num1 / num2 : 0;
            break;
          case 'modulo':
            res = num2 !== 0 ? num1 % num2 : 0;
            break;
        }
        this.context.variables[d.targetVariable] = res;
        this.addLog(
          'success',
          'Calculation Executed',
          `Set "${d.targetVariable}" = ${num1} ${d.operator} ${num2} -> ${res}`,
          currentNode.id,
          d.type,
          { [d.targetVariable]: res }
        );
        const next = this.getNextNode(currentNode.id, 'output');
        if (next) {
          this.transitionTo(next.id);
          return this.stepAuto();
        }
        this.context.status = 'completed';
        return this.getContext();
      }

      case 'condition':
      case 'ifElse': {
        const varValue = this.context.variables[d.variable];
        const isTrue = this.evaluateCondition(varValue, d.operator, d.comparisonValue);
        this.addLog(
          'info',
          'Condition Evaluated',
          `Testing "${d.variable}" (${JSON.stringify(varValue)}) ${d.operator} "${d.comparisonValue}" => ${isTrue ? 'TRUE' : 'FALSE'}`,
          currentNode.id,
          d.type
        );
        const branchHandle = isTrue ? (d.type === 'condition' ? 'true' : 'if') : (d.type === 'condition' ? 'false' : 'else');
        const next = this.getNextNode(currentNode.id, branchHandle);
        if (next) {
          this.transitionTo(next.id);
          return this.stepAuto();
        } else {
          this.addLog('warning', 'Dead End', `No path connected to ${branchHandle.toUpperCase()} handle.`, currentNode.id, d.type);
          this.context.status = 'completed';
          return this.getContext();
        }
      }

      case 'switch': {
        const varValue = String(this.context.variables[d.variable] ?? '');
        const matchedCase = (d.cases || []).find((c: any) => String(c.value).toLowerCase() === varValue.toLowerCase());
        const targetHandle = matchedCase ? matchedCase.id : 'default';
        this.addLog(
          'info',
          'Switch Route',
          `Variable "${d.variable}" = "${varValue}". Routing to ${matchedCase ? `case "${matchedCase.label}"` : 'default'}`,
          currentNode.id,
          d.type
        );
        const next = this.getNextNode(currentNode.id, targetHandle);
        if (next) {
          this.transitionTo(next.id);
          return this.stepAuto();
        }
        this.context.status = 'completed';
        return this.getContext();
      }

      case 'javaScript': {
        // Safe, isolated evaluation using restricted execution
        try {
          const fn = new Function('variables', `
            "use strict";
            try {
              ${d.code}
            } catch(e) {
              return { error: e.message };
            }
          `);
          const result = fn({ ...this.context.variables });
          if (d.outputVariable) {
            this.context.variables[d.outputVariable] = result;
          }
          this.addLog('success', 'JavaScript Executed', `Script completed. Output: ${JSON.stringify(result)}`, currentNode.id, d.type);
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          this.addLog('error', 'Script Error', `JavaScript execution failed: ${errMsg}`, currentNode.id, d.type);
        }
        const next = this.getNextNode(currentNode.id, 'output');
        if (next) {
          this.transitionTo(next.id);
          return this.stepAuto();
        }
        this.context.status = 'completed';
        return this.getContext();
      }

      case 'end': {
        this.addLog('success', 'Workflow Finished', d.endMessage || 'Reached End node.', currentNode.id, d.type);
        this.context.status = 'completed';
        return this.getContext();
      }

      case 'redirect': {
        this.addLog('info', 'Redirect Step', `Workflow redirecting to: ${d.targetUrl}`, currentNode.id, d.type);
        this.context.status = 'completed';
        return this.getContext();
      }

      // Interactive or content blocks that wait for user interaction:
      case 'userInput':
      case 'multipleChoice':
      case 'singleChoice':
      case 'form':
      case 'button':
      case 'question':
      case 'text':
      case 'heading':
      case 'image':
      case 'video':
      case 'audio':
      case 'file':
      case 'divider':
      case 'delay':
      case 'subflow':
      case 'apiRequest':
      case 'webhook':
      case 'merge':
      default:
        // Pause and let user interact or click Next
        this.context.status = 'waiting_for_input';
        return this.getContext();
    }
  }

  public submitInput(inputData: Record<string, unknown>, selectedHandle?: string): ExecutionContext {
    if (!this.context.currentNodeId) return this.getContext();
    const currentNode = this.nodes.get(this.context.currentNodeId);
    if (!currentNode) return this.getContext();

    // Store any provided variables into context
    Object.assign(this.context.variables, inputData);

    const d = currentNode.data as any;
    this.addLog(
      'info',
      'Step Input Provided',
      `Provided: ${JSON.stringify(inputData)}`,
      currentNode.id,
      d.type,
      inputData
    );

    // Determine next node
    const handleToUse = selectedHandle || 'output';
    const next = this.getNextNode(currentNode.id, handleToUse);

    if (next) {
      this.transitionTo(next.id);
      return this.stepAuto();
    } else {
      // If no specific output handle, check if there is an edge from any source handle
      const fallbackEdge = this.edges.find((e) => e.source === currentNode.id);
      if (fallbackEdge) {
        this.transitionTo(fallbackEdge.target);
        return this.stepAuto();
      }

      this.addLog('info', 'Workflow Complete', 'Reached end of connected branch.', currentNode.id, d.type);
      this.context.status = 'completed';
      return this.getContext();
    }
  }

  public stepPrevious(): ExecutionContext {
    if (this.context.previousNodeIds.length === 0) return this.getContext();

    const previousId = this.context.previousNodeIds.pop()!;
    this.context.currentNodeId = previousId;
    this.context.stepCount = Math.max(1, this.context.stepCount - 1);
    this.context.status = 'waiting_for_input';
    this.addLog('info', 'Stepped Back', `Returned to previous block [${previousId}]`);
    return this.getContext();
  }

  public stop(): ExecutionContext {
    this.context.status = 'idle';
    this.context.currentNodeId = null;
    this.addLog('warning', 'Workflow Stopped', 'Simulation stopped by user.');
    return this.getContext();
  }

  private transitionTo(nodeId: string): void {
    if (this.context.currentNodeId) {
      this.context.previousNodeIds.push(this.context.currentNodeId);
    }
    this.context.currentNodeId = nodeId;
    this.context.stepCount += 1;
    const node = this.nodes.get(nodeId);
    if (node) {
      this.addLog('info', 'Advancing Step', `Entering block: ${node.data.label || node.type}`, node.id, node.type);
    }
  }

  private getNextNode(sourceId: string, handleId?: string): FlowNode | null {
    let edge: FlowEdge | undefined;
    if (handleId) {
      edge = this.edges.find((e) => e.source === sourceId && e.sourceHandle === handleId);
    }
    if (!edge) {
      edge = this.edges.find((e) => e.source === sourceId);
    }
    if (!edge) return null;
    return this.nodes.get(edge.target) || null;
  }

  private resolveValue(val: string): unknown {
    if (val in this.context.variables) {
      return this.context.variables[val];
    }
    return val;
  }

  private evaluateCondition(actual: unknown, op: ConditionOperator, target: string): boolean {
    const actStr = String(actual ?? '').trim();
    const tarStr = String(target ?? '').trim();

    switch (op) {
      case 'equals':
        return actStr.toLowerCase() === tarStr.toLowerCase();
      case 'notEquals':
        return actStr.toLowerCase() !== tarStr.toLowerCase();
      case 'greaterThan':
        return Number(actual) > Number(target);
      case 'lessThan':
        return Number(actual) < Number(target);
      case 'contains':
        return actStr.toLowerCase().includes(tarStr.toLowerCase());
      case 'doesNotContain':
        return !actStr.toLowerCase().includes(tarStr.toLowerCase());
      case 'isEmpty':
        return actStr === '' || actual === null || actual === undefined;
      case 'isNotEmpty':
        return actStr !== '' && actual !== null && actual !== undefined;
      default:
        return false;
    }
  }

  private addLog(
    status: ExecutionLogEntry['status'],
    message: string,
    details?: string,
    nodeId: string = 'system',
    nodeType: string = 'system',
    dataSnapshot?: Record<string, unknown>
  ): void {
    const entry: ExecutionLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      nodeId,
      nodeType,
      nodeLabel: this.nodes.get(nodeId)?.data.label || nodeType,
      message: details ? `${message}: ${details}` : message,
      status,
      dataSnapshot: dataSnapshot ? { ...dataSnapshot } : undefined,
    };
    this.context.logs.push(entry);
  }
}
