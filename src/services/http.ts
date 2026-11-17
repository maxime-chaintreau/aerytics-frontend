const BASE_URL = import.meta.env.VITE_API_URL;
const TIMEOUT_MS = 8000;

export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export function isNotFound(error: unknown): boolean {
  return error instanceof HttpError && error.status === 404;
}

/** GET a full URL (e.g. Data Dragon) and parse the JSON. */
export async function fetchJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });

  if (!response.ok) throw new HttpError(response.status, `${response.status} ${response.statusText}`);
  return (await response.json()) as T;
}

/** GET a path on OUR backend (/api/...). */
export function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  return fetchJson<T>(`${BASE_URL}${path}`, signal);
}
