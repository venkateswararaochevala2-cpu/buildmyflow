import { describe, it, expect } from 'vitest';
import { validateWorkflow } from '../services/validationService';
import { WorkflowData } from '../types/workflow';

function buildMockWorkflow(nodes: any[], edges: any[]): WorkflowData {
  return {
    metadata: {
      id: 'wf_mock',
      name: 'Mock Flow',
      description: '',
      category: 'General',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    nodes,
    edges,
    viewport: { x: 0, y: 0, zoom: 1 },
    settings: {
      defaultZoom: 1,
      snapToGrid: true,
      gridSize: 20,
      showMinimap: true,
      showGrid: true,
    },
    schemaVersion: 1,
  };
}

describe('Workflow Validation Service', () => {
  it('flags missing Start node', () => {
    const wf = buildMockWorkflow(
      [{ id: 'node_1', type: 'text', data: { type: 'text', content: 'Hello' } }],
      []
    );
    const report = validateWorkflow(wf);
    expect(report.isValid).toBe(false);
    expect(report.issues.some((i) => i.id === 'val_start_missing')).toBe(true);
  });

  it('flags multiple Start nodes', () => {
    const wf = buildMockWorkflow(
      [
        { id: 'start_1', type: 'start', data: { type: 'start' } },
        { id: 'start_2', type: 'start', data: { type: 'start' } },
      ],
      []
    );
    const report = validateWorkflow(wf);
    expect(report.isValid).toBe(false);
    expect(report.issues.some((i) => i.title.includes('Multiple Start Blocks'))).toBe(true);
  });

  it('warns about disconnected nodes', () => {
    const wf = buildMockWorkflow(
      [
        { id: 'start_1', type: 'start', data: { type: 'start' } },
        { id: 'text_isolated', type: 'text', data: { type: 'text', content: 'Isolated' } },
      ],
      []
    );
    const report = validateWorkflow(wf);
    expect(report.issues.some((i) => i.category === 'connectivity')).toBe(true);
  });

  it('flags empty properties in text and user input blocks', () => {
    const wf = buildMockWorkflow(
      [
        { id: 'start_1', type: 'start', data: { type: 'start' } },
        { id: 'text_1', type: 'text', data: { type: 'text', content: '' } },
        { id: 'input_1', type: 'userInput', data: { type: 'userInput', fieldLabel: '' } },
      ],
      [
        { id: 'e1', source: 'start_1', target: 'text_1' },
        { id: 'e2', source: 'text_1', target: 'input_1' },
      ]
    );

    const report = validateWorkflow(wf);
    expect(report.isValid).toBe(false);
    expect(report.issues.some((i) => i.id.includes('val_text_empty'))).toBe(true);
    expect(report.issues.some((i) => i.id.includes('val_inp_lbl'))).toBe(true);
  });

  it('passes validation when workflow has proper start, connections, and valid node properties', () => {
    const wf = buildMockWorkflow(
      [
        { id: 'start_1', type: 'start', data: { type: 'start', label: 'Start' } },
        { id: 'text_1', type: 'text', data: { type: 'text', label: 'Greeting', content: 'Hello user' } },
        { id: 'end_1', type: 'end', data: { type: 'end', label: 'Done', endMessage: 'Finished' } },
      ],
      [
        { id: 'e1', source: 'start_1', target: 'text_1' },
        { id: 'e2', source: 'text_1', target: 'end_1' },
      ]
    );

    const report = validateWorkflow(wf);
    expect(report.isValid).toBe(true);
    expect(report.errorsCount).toBe(0);
  });
});
