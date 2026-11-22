import { describe, it, expect, beforeEach } from 'vitest';
import {
  createInitialWorkflowData,
  createNewWorkflow,
  getAllWorkflows,
  getWorkflowById,
  duplicateWorkflow,
  renameWorkflow,
  deleteWorkflow,
  exportWorkflowToJson,
  importWorkflowFromJson,
} from '../services/workflowStorage';
import { db } from '../db/database';

describe('Workflow Storage and Persistence Service', () => {
  beforeEach(async () => {
    await db.workflows.clear();
  });

  it('initializes default workflow data correctly', () => {
    const data = createInitialWorkflowData('wf_test_1', 'Onboarding Test', 'Test description', 'Chatbot');
    expect(data.metadata.id).toBe('wf_test_1');
    expect(data.metadata.name).toBe('Onboarding Test');
    expect(data.metadata.category).toBe('Chatbot');
    expect(data.nodes.length).toBe(2);
    expect(data.nodes[0].type).toBe('start');
    expect(data.edges.length).toBe(1);
    expect(data.schemaVersion).toBe(1);
  });

  it('creates, saves, retrieves, and updates workflow in IndexedDB', async () => {
    const created = await createNewWorkflow('User Registration Flow', 'Handles signup', 'Onboarding');
    expect(created.metadata.name).toBe('User Registration Flow');

    const retrieved = await getWorkflowById(created.metadata.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.metadata.id).toBe(created.metadata.id);
    expect(retrieved?.nodes.length).toBe(2);

    const all = await getAllWorkflows();
    expect(all.length).toBe(1);
  });

  it('duplicates an existing workflow with copy suffix and new id', async () => {
    const original = await createNewWorkflow('Base Template');
    const duplicated = await duplicateWorkflow(original.metadata.id);

    expect(duplicated).not.toBeNull();
    expect(duplicated?.metadata.id).not.toBe(original.metadata.id);
    expect(duplicated?.metadata.name).toBe('Base Template (Copy)');

    const all = await getAllWorkflows();
    expect(all.length).toBe(2);
  });

  it('renames and deletes workflows properly', async () => {
    const wf = await createNewWorkflow('Initial Name');
    await renameWorkflow(wf.metadata.id, 'Renamed Workflow');

    const updated = await getWorkflowById(wf.metadata.id);
    expect(updated?.metadata.name).toBe('Renamed Workflow');

    await deleteWorkflow(wf.metadata.id);
    const afterDelete = await getWorkflowById(wf.metadata.id);
    expect(afterDelete).toBeNull();
  });

  it('exports and imports workflow JSON with validation', async () => {
    const wf = await createNewWorkflow('Exportable Workflow');
    const exportedJson = exportWorkflowToJson(wf);

    expect(exportedJson).toContain('Exportable Workflow');
    expect(exportedJson).toContain('schemaVersion');

    const imported = await importWorkflowFromJson(exportedJson);
    expect(imported.metadata.name).toContain('Exportable Workflow (Imported)');
    expect(imported.nodes.length).toBe(wf.nodes.length);
  });

  it('rejects invalid JSON import safely', async () => {
    await expect(importWorkflowFromJson('not valid json')).rejects.toThrow('Invalid JSON format.');
    await expect(importWorkflowFromJson('{"invalid": true}')).rejects.toThrow('Missing required workflow properties');
  });
});
