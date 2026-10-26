const TOKEN_STORAGE_KEY = "auth_token";

export const getToken = (): string | null => localStorage.getItem(TOKEN_STORAGE_KEY);

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};
