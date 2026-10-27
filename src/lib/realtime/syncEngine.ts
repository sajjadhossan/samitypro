/**
 * Real-time Multi-Device Synchronization & Conflict Resolution Engine
 * Conforms to Section 5: Offline-First & Shared Architecture Rules
 */

export interface PendingSyncItem {
  idempotencyKey: string;
  tenantId: string;
  entity: 'MEMBER' | 'DEPOSIT' | 'LOAN_REPAYMENT' | 'VOUCHER' | 'ATTENDANCE';
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  payload: Record<string, unknown>;
  createdAt: string;
  retryCount: number;
  status: 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED';
  error?: string;
}

export interface RealtimeSyncEvent {
  eventId: string;
  tenantId: string;
  eventType: 'COLLECTION_RECORDED' | 'PAYMENT_VERIFIED' | 'LOAN_APPROVED' | 'MEMBER_REGISTERED';
  data: Record<string, unknown>;
  timestamp: string;
}

const STORAGE_KEY = 'samitypro_offline_sync_queue_v1';

export class SyncEngine {
  /**
   * Retrieves pending sync queue from localStorage
   */
  public static getQueue(): PendingSyncItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Enqueues an offline action with a client-generated UUID idempotency key
   */
  public static enqueueAction(
    tenantId: string,
    entity: PendingSyncItem['entity'],
    action: PendingSyncItem['action'],
    payload: Record<string, unknown>
  ): PendingSyncItem {
    const item: PendingSyncItem = {
      idempotencyKey: `IDEM-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      tenantId,
      entity,
      action,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
      status: 'PENDING'
    };

    if (typeof window !== 'undefined') {
      const queue = this.getQueue();
      queue.push(item);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    }

    return item;
  }

  /**
   * Automatically process pending queue when online
   */
  public static async processQueue(): Promise<{
    processed: number;
    failed: number;
    remaining: number;
  }> {
    if (typeof window === 'undefined' || !navigator.onLine) {
      return { processed: 0, failed: 0, remaining: this.getQueue().length };
    }

    const queue = this.getQueue();
    if (queue.length === 0) return { processed: 0, failed: 0, remaining: 0 };

    let processed = 0;
    let failed = 0;
    const remainingQueue: PendingSyncItem[] = [];

    for (const item of queue) {
      if (item.status === 'SYNCED') continue;

      try {
        item.status = 'SYNCING';
        
        // Dispatch to server sync API
        const res = await fetch('/api/realtime', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idempotencyKey: item.idempotencyKey,
            tenantId: item.tenantId,
            entity: item.entity,
            action: item.action,
            payload: item.payload
          })
        });

        if (res.ok) {
          processed++;
          item.status = 'SYNCED';
        } else {
          item.retryCount++;
          item.status = item.retryCount > 5 ? 'FAILED' : 'PENDING';
          remainingQueue.push(item);
          failed++;
        }
      } catch (err: unknown) {
        item.retryCount++;
        item.error = err instanceof Error ? err.message : String(err);
        item.status = item.retryCount > 5 ? 'FAILED' : 'PENDING';
        remainingQueue.push(item);
        failed++;
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(remainingQueue));
    return { processed, failed, remaining: remainingQueue.length };
  }

  /**
   * Conflict Resolution: Server authority check for financial balances
   */
  public static resolveBalanceConflict(
    localBalance: number,
    serverBalance: number,
    accountNo: string
  ): {
    authoritativeBalance: number;
    difference: number;
    hasConflict: boolean;
  } {
    const hasConflict = localBalance !== serverBalance;
    return {
      authoritativeBalance: serverBalance, // Server data is authoritative for financial records (Rule Section 5 #4)
      difference: serverBalance - localBalance,
      hasConflict
    };
  }
}
