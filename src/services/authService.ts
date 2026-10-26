import { publicApi } from "./api";

const JWT_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

const findJwt = (value: unknown, visited = new Set<unknown>()): string | null => {
  if (typeof value === "string") {
    const candidate = value.trim().replace(/^Bearer\s+/i, "");
    return JWT_PATTERN.test(candidate) ? candidate : null;
  }
  if (!value || typeof value !== "object" || visited.has(value)) return null;
  visited.add(value);

  const values = Array.isArray(value) ? value : Object.values(value as Record<string, unknown>);
  for (const item of values) {
    const token = findJwt(item, visited);
    if (token) return token;
  }
  return null;
};

export const authenticate = async (email: string, senha: string): Promise<string> => {
  const response = await publicApi.post("/api/auth/login", { email, senha });
  const token = findJwt(response.data);

  if (!token) {
    throw new Error("O servidor não retornou um JWT válido no login.");
  }

  return token;
};
