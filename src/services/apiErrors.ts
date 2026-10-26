import { API_BASE_URL } from "./api";

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  const apiError = error as {
    isAxiosError?: boolean;
    response?: { data?: unknown };
    message?: string;
  } | null;

  if (apiError?.isAxiosError) {
    const responseData = apiError.response?.data;
    if (typeof responseData === "string" && responseData.trim()) return responseData;

    if (responseData && typeof responseData === "object") {
      const data = responseData as {
        message?: unknown;
        detail?: unknown;
        error?: unknown;
        msg?: unknown;
        error_description?: unknown;
      };
      for (const candidate of [data.message, data.detail, data.error, data.msg, data.error_description]) {
        if (typeof candidate === "string" && candidate.trim()) return candidate;
      }
    }

    if (apiError.message === "Network Error") {
      return `Não foi possível conectar ao backend. Confirme se ele está rodando em ${API_BASE_URL}.`;
    }
  }

  return fallback;
};
