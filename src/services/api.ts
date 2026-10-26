import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { getToken } from "../auth/tokenStorage";

export const API_BASE_URL = "http://localhost:8080";

export const publicApi = axios.create({ baseURL: API_BASE_URL });
export const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  } else {
    config.headers.delete("Authorization");
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const config = error.config;

    // Keep AxiosError logs from exposing the JWT through error.config.headers.
    config?.headers?.delete("Authorization");
    error.response?.config.headers.delete("Authorization");

    return Promise.reject(error);
  }
);

type ApiFetchResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  data: any;
  json: <T = any>() => Promise<T>;
  text: () => Promise<string>;
};

/** Adapts legacy fetch call sites to the authenticated Axios instance. */
export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<ApiFetchResponse> {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  const headers: Record<string, string> = {};
  new Headers(init.headers).forEach((value, key) => { headers[key] = value; });

  let data: unknown = init.body;
  const contentType = Object.entries(headers).find(([key]) => key.toLowerCase() === "content-type")?.[1];
  if (typeof data === "string" && contentType?.includes("application/json")) {
    try { data = JSON.parse(data); } catch { /* preserve non-JSON text payloads */ }
  }

  const config: AxiosRequestConfig = {
    url,
    method: init.method || "GET",
    headers,
    data,
    signal: init.signal || undefined,
  };

  let response: AxiosResponse;
  try {
    response = await api.request(config);
  } catch (error) {
    const axiosError = error as AxiosError;
    if (!axiosError.response) throw error;
    response = axiosError.response;
  }

  const responseData: unknown = response.data;
  return {
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    statusText: response.statusText,
    data: responseData,
    json: async <T = any>() => responseData as T,
    text: async () => typeof responseData === "string" ? responseData : JSON.stringify(responseData ?? ""),
  };
}
