import {
  buildApolloPredicateStatsUploadItem,
  buildApolloStatsUploadItems,
  uploadApolloStatsReport,
  type ApolloStatsReportKind,
  type ApolloStatsUploadItem,
  type ApolloStatsUploadReport,
} from './collector';
import type {
  ApolloBaselineCustomizationReport,
  ApolloStatsReport,
} from './types';
import type { ApolloPredicateStatsReport } from '../predicate/predicateValidation';

export const APOLLO_STATS_OUTBOX_STORAGE_KEY = 'apollo.stats.outbox.v1';

const OUTBOX_SCHEMA_VERSION = 1;

export type ApolloStatsDeliveryStatus = {
  phase: 'idle' | 'uploading' | 'success' | 'failed';
  pendingCount: number;
  uploadedCount: number;
  message: string;
  lastError: string | null;
};

export type ApolloStatsDeliveryStorage = {
  getAsync(key: string): Promise<unknown>;
  setAsync(key: string, value: unknown): Promise<void>;
};

export type ApolloStatsDelivery = {
  enqueueAuditReports(
    report: ApolloStatsReport,
    baselineCustomizationReport?: ApolloBaselineCustomizationReport,
  ): Promise<void>;
  enqueuePredicateReport(report: ApolloPredicateStatsReport): Promise<void>;
  flush(): Promise<void>;
};

type ApolloStatsOutboxEntry = {
  schemaVersion: 1;
  id: string;
  reportKind: ApolloStatsReportKind;
  collectorUrl: string;
  report: ApolloStatsUploadReport;
  createdAt: string;
  attempts: number;
  lastError: string | null;
};

type ApolloStatsDeliveryOptions = {
  storage: ApolloStatsDeliveryStorage;
  onStatus?: (status: ApolloStatsDeliveryStatus) => void;
  upload?: typeof uploadApolloStatsReport;
  now?: () => Date;
};

export function createApolloStatsDelivery(
  options: ApolloStatsDeliveryOptions,
): ApolloStatsDelivery {
  const upload = options.upload ?? uploadApolloStatsReport;
  const now = options.now ?? (() => new Date());
  let storageQueue: Promise<void> = Promise.resolve();
  let flushPromise: Promise<void> | null = null;

  function emitStatus(status: ApolloStatsDeliveryStatus): void {
    try {
      options.onStatus?.(status);
    } catch (error) {
      console.warn('[Apollo] stats delivery status handler failed', error);
    }
  }

  function readEntries(): Promise<ApolloStatsOutboxEntry[]> {
    const operation = storageQueue.then(async () => {
      const stored = await options.storage.getAsync(
        APOLLO_STATS_OUTBOX_STORAGE_KEY,
      );
      return normalizeEntries(stored);
    });
    storageQueue = operation.then(() => undefined, () => undefined);
    return operation;
  }

  function updateEntries(
    update: (
      entries: ApolloStatsOutboxEntry[],
    ) => ApolloStatsOutboxEntry[],
  ): Promise<ApolloStatsOutboxEntry[]> {
    const operation = storageQueue.then(async () => {
      const stored = await options.storage.getAsync(
        APOLLO_STATS_OUTBOX_STORAGE_KEY,
      );
      const entries = normalizeEntries(stored);
      const nextEntries = update(entries);
      await options.storage.setAsync(
        APOLLO_STATS_OUTBOX_STORAGE_KEY,
        nextEntries,
      );
      return nextEntries;
    });
    storageQueue = operation.then(() => undefined, () => undefined);
    return operation;
  }

  async function enqueueItems(items: ApolloStatsUploadItem[]): Promise<void> {
    if (items.length === 0) {
      return;
    }
    const createdAt = now().toISOString();
    const nextEntries = await updateEntries((entries) => {
      const knownIds = new Set(entries.map((entry) => entry.id));
      for (const item of items) {
        const id = item.report.reportId;
        if (knownIds.has(id)) {
          continue;
        }
        entries.push({
          schemaVersion: OUTBOX_SCHEMA_VERSION,
          id,
          reportKind: item.reportKind,
          collectorUrl: item.collectorUrl,
          report: item.report,
          createdAt,
          attempts: 0,
          lastError: null,
        });
        knownIds.add(id);
      }
      return entries;
    });
    emitStatus({
      phase: 'uploading',
      pendingCount: nextEntries.length,
      uploadedCount: 0,
      message: 'Отправляем отчёты…',
      lastError: null,
    });
    void flush().catch((error) => {
      console.warn('[Apollo] stats outbox flush failed', error);
    });
  }

  async function runFlush(): Promise<void> {
    let uploadedCount = 0;
    while (true) {
      const entries = await readEntries();
      const entry = entries[0];
      if (!entry) {
        emitStatus({
          phase: uploadedCount > 0 ? 'success' : 'idle',
          pendingCount: 0,
          uploadedCount,
          message:
            uploadedCount > 0 ? 'Отчёты отправлены' : 'Нет отчётов для отправки',
          lastError: null,
        });
        return;
      }
      emitStatus({
        phase: 'uploading',
        pendingCount: entries.length,
        uploadedCount,
        message: 'Отправляем отчёты…',
        lastError: null,
      });
      try {
        await upload({
          report: entry.report,
          reportKind: entry.reportKind,
          collectorUrl: entry.collectorUrl,
        });
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        const retainedEntries = await updateEntries((currentEntries) =>
          currentEntries.map((currentEntry) => {
            if (currentEntry.id !== entry.id) {
              return currentEntry;
            }
            return {
              schemaVersion: OUTBOX_SCHEMA_VERSION,
              id: currentEntry.id,
              reportKind: currentEntry.reportKind,
              collectorUrl: currentEntry.collectorUrl,
              report: currentEntry.report,
              createdAt: currentEntry.createdAt,
              attempts: currentEntry.attempts + 1,
              lastError: errorMessage,
            };
          }),
        );
        console.warn('[Apollo] stats upload retained in outbox', {
          reportId: entry.id,
          reportKind: entry.reportKind,
          pendingCount: retainedEntries.length,
          error,
        });
        emitStatus({
          phase: 'failed',
          pendingCount: retainedEntries.length,
          uploadedCount,
          message: `Не отправлено: ${retainedEntries.length}`,
          lastError: errorMessage,
        });
        return;
      }
      uploadedCount += 1;
      await updateEntries((currentEntries) =>
        currentEntries.filter((currentEntry) => currentEntry.id !== entry.id),
      );
    }
  }

  function flush(): Promise<void> {
    if (flushPromise) {
      return flushPromise;
    }
    const currentFlush = runFlush();
    flushPromise = currentFlush.then(
      () => {
        flushPromise = null;
      },
      (error) => {
        flushPromise = null;
        throw error;
      },
    );
    return flushPromise;
  }

  return {
    async enqueueAuditReports(
      report: ApolloStatsReport,
      baselineCustomizationReport?: ApolloBaselineCustomizationReport,
    ): Promise<void> {
      await enqueueItems(
        buildApolloStatsUploadItems(report, baselineCustomizationReport),
      );
    },
    async enqueuePredicateReport(
      report: ApolloPredicateStatsReport,
    ): Promise<void> {
      await enqueueItems([buildApolloPredicateStatsUploadItem(report)]);
    },
    flush,
  };
}

function normalizeEntries(value: unknown): ApolloStatsOutboxEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter(isOutboxEntry);
}

function isOutboxEntry(value: unknown): value is ApolloStatsOutboxEntry {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const entry = value as Partial<ApolloStatsOutboxEntry>;
  return entry.schemaVersion === OUTBOX_SCHEMA_VERSION &&
    typeof entry.id === 'string' &&
    isReportKind(entry.reportKind) &&
    typeof entry.collectorUrl === 'string' &&
    typeof entry.createdAt === 'string' &&
    typeof entry.attempts === 'number' &&
    (entry.lastError === null || typeof entry.lastError === 'string') &&
    Boolean(entry.report) &&
    typeof entry.report === 'object' &&
    (entry.report as { reportId?: unknown }).reportId === entry.id;
}

function isReportKind(value: unknown): value is ApolloStatsReportKind {
  return value === 'full' ||
    value === 'agent' ||
    value === 'customizations-wip' ||
    value === 'predicates';
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return String(error || 'Неизвестная ошибка отправки');
}
