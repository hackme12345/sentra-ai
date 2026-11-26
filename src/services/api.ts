import type {
  AnalysisResult,
  JobOfferScanRequest,
  MessageScanRequest,
  ScreenshotScanRequest,
  UrlScanRequest,
} from '../../shared/types';

export class ApiClientError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code = 'API_ERROR') {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
  }
}

async function postJson<TReq, TRes>(endpoint: string, payload: TReq): Promise<TRes> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 90_000);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const msg =
        (data && typeof data.message === 'string' && data.message) ||
        `Request failed with status ${response.status}.`;
      const code = (data && typeof data.error === 'string' && data.error) || 'REQUEST_FAILED';
      throw new ApiClientError(msg, response.status, code);
    }

    return data as TRes;
  } catch (error: unknown) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiClientError(
        'The analysis request timed out. Please check your connection and retry.',
        408,
        'TIMEOUT'
      );
    }
    throw new ApiClientError(
      'Unable to reach the Sentra AI analysis server. Please retry in a moment.',
      0,
      'NETWORK_ERROR'
    );
  } finally {
    window.clearTimeout(timeout);
  }
}

export function analyzeMessage(payload: MessageScanRequest): Promise<AnalysisResult> {
  return postJson('/api/analyze/message', payload);
}

export function analyzeUrl(payload: UrlScanRequest): Promise<AnalysisResult> {
  return postJson('/api/analyze/url', payload);
}

export function analyzeScreenshot(payload: ScreenshotScanRequest): Promise<AnalysisResult> {
  return postJson('/api/analyze/screenshot', payload);
}

export function analyzeJobOffer(payload: JobOfferScanRequest): Promise<AnalysisResult> {
  return postJson('/api/analyze/job-offer', payload);
}
