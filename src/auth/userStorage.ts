const USER_STORAGE_KEY = "usuarioLogado";

export const getStoredUser = <T,>(): T | null => {
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as T;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: unknown): void => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const removeStoredUser = (): void => {
  localStorage.removeItem(USER_STORAGE_KEY);
};
