import type { Context, Middleware, Next } from "@oak/oak";
import type { AuthenticatedState } from "./session.ts";

export function requireAuth(): Middleware<AuthenticatedState> {
  return async (ctx: Context<AuthenticatedState>, next: Next): Promise<void> => {
    if (!ctx.state.currentUser) {
      ctx.response.redirect("/login");
      return;
    }

    await next();
  };
}

export function requireRole(roles: Array<"admin" | "editor">): Middleware<AuthenticatedState> {
  return async (ctx: Context<AuthenticatedState>, next: Next): Promise<void> => {
    const user = ctx.state.currentUser;

    if (!user) {
      ctx.response.redirect("/login");
      return;
    }

    if (!roles.includes(user.role)) {
      ctx.response.status = 403;
      ctx.response.body = "Forbidden: You do not have permission to access this page.";
      return;
    }

    await next();
  };
}
