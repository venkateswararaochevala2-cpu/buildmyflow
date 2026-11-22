import Dexie, { Table } from 'dexie';
import { WorkflowData } from '../types/workflow';

export interface StoredWorkflowRecord {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  data: WorkflowData;
}

export interface StoredAssetRecord {
  id: string;
  fileName: string;
  fileType: string;
  data: Blob;
  size: number;
  createdAt: string;
}

export class FlowBuilderDatabase extends Dexie {
  workflows!: Table<StoredWorkflowRecord, string>;
  assets!: Table<StoredAssetRecord, string>;

  constructor() {
    super('FlowBuilderDB');
    this.version(1).stores({
      workflows: 'id, name, category, status, createdAt, updatedAt',
      assets: 'id, fileName, fileType, createdAt',
    });
  }
}

export const db = new FlowBuilderDatabase();
