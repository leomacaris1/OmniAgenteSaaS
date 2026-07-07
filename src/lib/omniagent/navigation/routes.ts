export const appRoutes = {
  marketing: "/",
  login: "/login",
  commandCenter: "/app",
} as const;

const publicRoutes = new Set<string>([appRoutes.marketing, appRoutes.login]);

export function isPublicRoute(pathname: string) {
  return publicRoutes.has(pathname);
}
