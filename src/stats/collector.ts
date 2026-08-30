import type {
  ApolloBaselineCustomizationReport,
  ApolloStatsReport,
} from './types';
import { buildApolloAgentReport } from './agentReport';
import type { ApolloPredicateStatsReport } from '../predicate/predicateValidation';

const DEFAULT_COLLECTOR_URL =
  'https://dwjnndpxzqizrcwpasrs.supabase.co/functions/v1/apollo-stats';
const MAX_UPLOAD_ATTEMPTS = 4;
const UPLOAD_RETRY_DELAY_MS = 1_000;
const UPLOAD_TIMEOUT_MS = 45_000;

let statsUploadQueue: Promise<void> = Promise.resolve();

export type ApolloStatsReportKind =
  | 'full'
  | 'agent'
  | 'customizations-wip'
  | 'predicates';

export type ApolloStatsUploadReport =
  | ApolloStatsReport
  | ReturnType<typeof buildApolloAgentReport>
  | ApolloBaselineCustomizationReport
  | ApolloPredicateStatsReport;

export type ApolloStatsUploadItem = {
  report: ApolloStatsUploadReport;
  reportKind: ApolloStatsReportKind;
  collectorUrl: string;
};

export type ApolloStatsUploadResult = {
  path: string | null;
  commitUrl: string | null;
};

export function buildApolloStatsUploadItems(
  report: ApolloStatsReport,
  baselineCustomizationReport?: ApolloBaselineCustomizationReport,
  collectorUrl = DEFAULT_COLLECTOR_URL,
): ApolloStatsUploadItem[] {
  const items: ApolloStatsUploadItem[] = [
    {
      report,
      reportKind: 'full',
      collectorUrl,
    },
    {
      report: buildApolloAgentReport(report),
      reportKind: 'agent',
      collectorUrl,
    },
  ];
  if (baselineCustomizationReport) {
    items.push({
      report: baselineCustomizationReport,
      reportKind: 'customizations-wip',
      collectorUrl,
    });
  }
  return items;
}

export function buildApolloPredicateStatsUploadItem(
  report: ApolloPredicateStatsReport,
  collectorUrl = DEFAULT_COLLECTOR_URL,
): ApolloStatsUploadItem {
  return {
    report,
    reportKind: 'predicates',
    collectorUrl,
  };
}

export async function submitApolloStatsReport(
  report: ApolloStatsReport,
  baselineCustomizationReport?: ApolloBaselineCustomizationReport,
  collectorUrl = DEFAULT_COLLECTOR_URL,
): Promise<void> {
  const items = buildApolloStatsUploadItems(
    report,
    baselineCustomizationReport,
    collectorUrl,
  );
  for (const item of items) {
    await submitSingleStatsReport(item);
  }
}

export async function submitApolloPredicateStatsReport(
  report: ApolloPredicateStatsReport,
  collectorUrl = DEFAULT_COLLECTOR_URL,
): Promise<void> {
  await submitSingleStatsReport(
    buildApolloPredicateStatsUploadItem(report, collectorUrl),
  );
}

async function submitSingleStatsReport(
  item: ApolloStatsUploadItem,
): Promise<void> {
  const upload = statsUploadQueue.then(() =>
    uploadApolloStatsReport(item).then(() => undefined),
  );
  statsUploadQueue = upload.catch(() => undefined);
  return upload;
}

export async function uploadApolloStatsReport(
  item: ApolloStatsUploadItem,
): Promise<ApolloStatsUploadResult> {
  for (let attempt = 1; attempt <= MAX_UPLOAD_ATTEMPTS; attempt += 1) {
    let response: Response;
    try {
      response = await fetchWithTimeout(
        item.collectorUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item.report),
        },
        UPLOAD_TIMEOUT_MS,
      );
    } catch (error) {
      if (attempt < MAX_UPLOAD_ATTEMPTS) {
        console.warn('[Apollo] stats upload retry', {
          reportId: item.report.reportId,
          reportKind: item.reportKind,
          status: null,
          attempt,
          error,
        });
        await delay(UPLOAD_RETRY_DELAY_MS * attempt);
        continue;
      }
      throw error;
    }
    const responseText = await response.text();

    if (!response.ok) {
      const retryable = response.status === 408 ||
        response.status === 409 ||
        response.status === 425 ||
        response.status === 429 ||
        response.status >= 500;
      if (retryable && attempt < MAX_UPLOAD_ATTEMPTS) {
        console.warn('[Apollo] stats upload retry', {
          reportId: item.report.reportId,
          reportKind: item.reportKind,
          status: response.status,
          attempt,
        });
        await delay(UPLOAD_RETRY_DELAY_MS * attempt);
        continue;
      }
      throw new Error(
        `HTTP ${response.status}${responseText ? `: ${responseText}` : ''}`,
      );
    }

    const result = responseText
      ? JSON.parse(responseText) as {
          path?: string;
          commitUrl?: string | null;
        }
      : {};
    const uploadResult: ApolloStatsUploadResult = {
      path: result.path ?? null,
      commitUrl: result.commitUrl ?? null,
    };
    console.log('[Apollo] stats report uploaded', {
      reportId: item.report.reportId,
      reportKind: item.reportKind,
      path: uploadResult.path,
      commitUrl: uploadResult.commitUrl,
    });
    return uploadResult;
  }
  throw new Error('Apollo stats upload exhausted all attempts.');
}

function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const timeout = new Promise<Response>((_resolve, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Apollo stats upload timed out after ${timeoutMs} ms.`));
    }, timeoutMs);
  });
  return Promise.race([fetch(url, options), timeout]).then(
    (response) => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      return response;
    },
    (error) => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      throw error;
    },
  );
}

function delay(durationMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}
