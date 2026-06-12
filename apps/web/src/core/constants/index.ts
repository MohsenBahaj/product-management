export const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  "https://product-management-production-0052.up.railway.app/api";
export const ACCESS_TOKEN_KEY = "sf_access_token";
export const REFRESH_TOKEN_KEY = "sf_refresh_token";
export const THEME_MODE_KEY = "sf_theme_mode";
export const LANGUAGE_KEY = "i18nextLng";
