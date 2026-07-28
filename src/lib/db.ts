import Dexie, { type EntityTable } from 'dexie';

export type SyncAction = 'insert' | 'update' | 'delete';

export interface SyncOperation {
  id?: number; // Auto-incrementado por Dexie
  action: SyncAction;
  table: string;
  payload: Record<string, unknown>;
  timestamp: string;
  retryCount?: number;
}

export interface DeadLetterOperation extends SyncOperation {
  errorReason: string;
  failedAt: string;
}

const db = new Dexie('ListaCompraDB') as Dexie & {
  syncQueue: EntityTable<SyncOperation, 'id'>;
  deadLetterQueue: EntityTable<DeadLetterOperation, 'id'>;
};

db.version(1).stores({
  syncQueue: '++id, action, table, timestamp'
});

db.version(2).stores({
  syncQueue: '++id, action, table, timestamp',
  deadLetterQueue: '++id, action, table, timestamp'
});

export { db };
