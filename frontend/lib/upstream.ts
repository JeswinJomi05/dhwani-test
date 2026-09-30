export class UpstreamError extends Error {
  constructor(message: string, public status: number, public code: string) { super(message); }
}

export async function fetchUpstream(url: string, options: RequestInit): Promise<{ status: number; ok: boolean; result: Record<string, any> }> {
  let response: Response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    const failure = error as { name?: string; cause?: { code?: string } };
    const code = failure.cause?.code;
    if (code === 'ENOTFOUND' || code === 'EAI_AGAIN') {
      throw new UpstreamError('Cannot resolve the booking API address. Please contact the stay team.', 502, 'API_DNS_ERROR');
    }
    if (failure.name === 'TimeoutError' || code === 'UND_ERR_CONNECT_TIMEOUT') {
      throw new UpstreamError('The booking API timed out. Please try again shortly.', 504, 'API_TIMEOUT');
    }
    if (code === 'ECONNREFUSED') {
      throw new UpstreamError('The booking API is not accepting connections. Please try again shortly.', 502, 'API_CONNECTION_REFUSED');
    }
    throw new UpstreamError('Unable to connect to the booking API. Please try again shortly.', 502, 'API_CONNECTION_ERROR');
  }
  let result;
  try { result = await response.json(); } catch {
    throw new UpstreamError('The booking API returned an invalid response. Please contact the stay team.', 502, 'API_INVALID_RESPONSE');
  }
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    throw new UpstreamError('The booking API returned an invalid response. Please contact the stay team.', 502, 'API_INVALID_RESPONSE');
  }
  return { status: response.status, ok: response.ok, result };
}
