export function isAuthConfigured(): boolean {
  return !!(
    process.env.AUTH_SECRET &&
    process.env.AUTH_GITHUB_ID &&
    process.env.AUTH_GITHUB_SECRET
  );
}

export function getAuthSecret(): string | undefined {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "development") {
    return "dev-only-auth-secret-do-not-use-in-production";
  }
  return undefined;
}
