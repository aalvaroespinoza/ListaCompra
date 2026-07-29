import { db } from "@/lib/db";

export class OfflineQueue {
  static isOnline() {
    return typeof window !== 'undefined' ? navigator.onLine : true;
  }

  static async enqueue(action: 'insert' | 'update', table: string, payload: Record<string, unknown>) {
    await db.syncQueue.add({
      action,
      table,
      payload,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Intenta ejecutar una operación remota. Si la red falla o está offline,
   * encola la mutación localmente y devuelve el fallback.
   */
  static async executeSafe<T>(
    action: 'insert' | 'update',
    table: string,
    payload: Record<string, unknown>,
    remoteOp: () => Promise<T>,
    fallbackResult: T
  ): Promise<T> {
    if (!this.isOnline()) {
      await this.enqueue(action, table, payload);
      return fallbackResult;
    }

    try {
      return await remoteOp();
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message?.includes('fetch') || !this.isOnline()) {
        await this.enqueue(action, table, payload);
        return fallbackResult;
      }
      throw error; // Es un error real (ej. permisos), que lo maneje React Query
    }
  }
}
