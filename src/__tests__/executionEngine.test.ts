import { describe, it, expect } from 'vitest';
import { ExecutionEngine } from '../services/executionEngine';
import { FlowNode, FlowEdge } from '../types/workflow';

describe('Workflow Execution Engine and Simulation', () => {
  it('navigates from start node to text step and waits for user input', () => {
    const nodes: FlowNode[] = [
      { id: 'start_1', type: 'start', position: { x: 0, y: 0 }, data: { type: 'start', label: 'Start' } },
      { id: 'text_1', type: 'text', position: { x: 0, y: 100 }, data: { type: 'text', label: 'Welcome', content: 'Hello World' } as any },
    ];
    const edges: FlowEdge[] = [
      { id: 'e1', source: 'start_1', sourceHandle: 'output', target: 'text_1', targetHandle: 'input' },
    ];

    const engine = new ExecutionEngine(nodes, edges);
    const context = engine.start();

    expect(context.status).toBe('waiting_for_input');
    expect(context.currentNodeId).toBe('text_1');
    expect(context.stepCount).toBe(2);
    expect(context.logs.length).toBeGreaterThanOrEqual(2);
  });

  it('evaluates condition block branching correctly (TRUE path vs FALSE path)', () => {
    const nodes: FlowNode[] = [
      { id: 'start_1', type: 'start', position: { x: 0, y: 0 }, data: { type: 'start', label: 'Start' } },
      {
        id: 'input_age',
        type: 'userInput',
        position: { x: 0, y: 50 },
        data: {
          type: 'userInput',
          label: 'Age Input',
          fieldLabel: 'Enter Age',
          variableName: 'age',
          inputType: 'number',
        } as any,
      },
      {
        id: 'cond_1',
        type: 'condition',
        position: { x: 0, y: 100 },
        data: {
          type: 'condition',
          label: 'Age Check',
          variable: 'age',
          operator: 'greaterThan',
          comparisonValue: '18',
        } as any,
      },
      { id: 'text_adult', type: 'text', position: { x: -100, y: 200 }, data: { type: 'text', label: 'Adult Message', content: 'Welcome adult' } as any },
      { id: 'text_minor', type: 'text', position: { x: 100, y: 200 }, data: { type: 'text', label: 'Minor Message', content: 'Parent consent required' } as any },
    ];

    const edges: FlowEdge[] = [
      { id: 'e_start', source: 'start_1', target: 'input_age' },
      { id: 'e_in_cond', source: 'input_age', target: 'cond_1' },
      { id: 'e_true', source: 'cond_1', sourceHandle: 'true', target: 'text_adult' },
      { id: 'e_false', source: 'cond_1', sourceHandle: 'false', target: 'text_minor' },
    ];

    // Test with age = 25 -> Should land on text_adult
    const engine1 = new ExecutionEngine(nodes, edges);
    engine1.start();
    const ctxAdult = engine1.submitInput({ age: 25 });
    expect(ctxAdult.currentNodeId).toBe('text_adult');

    // Test with age = 12 -> Should land on text_minor
    const engine2 = new ExecutionEngine(nodes, edges);
    engine2.start();
    const ctxMinor = engine2.submitInput({ age: 12 });
    expect(ctxMinor.currentNodeId).toBe('text_minor');
  });

  it('performs calculations and stores mathematical results into variables', () => {
    const nodes: FlowNode[] = [
      { id: 'start_1', type: 'start', position: { x: 0, y: 0 }, data: { type: 'start', label: 'Start' } },
      {
        id: 'form_1',
        type: 'form',
        position: { x: 0, y: 50 },
        data: {
          type: 'form',
          label: 'Order Details',
          formTitle: 'Order Details',
          fields: [],
        } as any,
      },
      {
        id: 'calc_1',
        type: 'calculation',
        position: { x: 0, y: 100 },
        data: {
          type: 'calculation',
          label: 'Multiply Price',
          targetVariable: 'totalAmount',
          firstOperand: 'itemPrice',
          operator: 'multiply',
          secondOperand: 'quantity',
        } as any,
      },
      { id: 'end_1', type: 'end', position: { x: 0, y: 200 }, data: { type: 'end', label: 'Completed', endMessage: 'Done' } as any },
    ];

    const edges: FlowEdge[] = [
      { id: 'e1', source: 'start_1', target: 'form_1' },
      { id: 'e2', source: 'form_1', target: 'calc_1' },
      { id: 'e3', source: 'calc_1', target: 'end_1' },
    ];

    const engine = new ExecutionEngine(nodes, edges);
    engine.start();
    // Inject itemPrice = 15 and quantity = 4 via form submit
    const res = engine.submitInput({ itemPrice: 15, quantity: 4 });

    expect(res.variables['totalAmount']).toBe(60);
    expect(res.status).toBe('completed');
  });

  it('supports stepping back to previous block', () => {
    const nodes: FlowNode[] = [
      { id: 'start_1', type: 'start', position: { x: 0, y: 0 }, data: { type: 'start', label: 'Start' } },
      { id: 'text_1', type: 'text', position: { x: 0, y: 100 }, data: { type: 'text', label: 'Step 1', content: 'Step 1' } as any },
      { id: 'text_2', type: 'text', position: { x: 0, y: 200 }, data: { type: 'text', label: 'Step 2', content: 'Step 2' } as any },
    ];

    const edges: FlowEdge[] = [
      { id: 'e1', source: 'start_1', target: 'text_1' },
      { id: 'e2', source: 'text_1', target: 'text_2' },
    ];

    const engine = new ExecutionEngine(nodes, edges);
    engine.start(); // Lands at text_1
    expect(engine.getContext().currentNodeId).toBe('text_1');

    engine.submitInput({}); // Advances to text_2
    expect(engine.getContext().currentNodeId).toBe('text_2');

    const steppedBack = engine.stepPrevious(); // Steps back to text_1
    expect(steppedBack.currentNodeId).toBe('text_1');
  });
});
