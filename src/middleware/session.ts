import type { Context, Middleware, Next } from "@oak/oak";
import type { SessionData, User } from "../types.ts";

const SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const sessions = new Map<string, SessionData>();

function makeToken(): string {
  return crypto.randomUUID().replaceAll("-", "") + crypto.randomUUID().replaceAll("-", "");
}

export async function createSession(ctx: Context, user: User): Promise<void> {
  const token = makeToken();
  sessions.set(token, {
    userId: user.id,
    username: user.username,
    role: user.role,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });

  await ctx.cookies.set("session_token", token, {
    httpOnly: true,   // prevents JavaScript access to the cookie
    sameSite: "lax",  // stops cross-site request forgery
    secure: (Deno.env.get("APP_ENV") ?? "dev") === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function clearSession(ctx: Context): Promise<void> {
  const token = await ctx.cookies.get("session_token");
  if (token) {
    sessions.delete(token);
  }

  await ctx.cookies.delete("session_token", { path: "/" });
}

export interface AuthenticatedState {
  currentUser?: User;
  csrfToken?: string;
}

export const sessionMiddleware: Middleware<AuthenticatedState> = async (
  ctx: Context<AuthenticatedState>,
  next: Next,
): Promise<void> => {
  const token = await ctx.cookies.get("session_token");
  if (!token) {
    ctx.state.currentUser = undefined;
    await next();
    return;
  }

  const data = sessions.get(token);
  if (!data || data.expiresAt < Date.now()) {
    sessions.delete(token);
    await ctx.cookies.delete("session_token", { path: "/" });
    ctx.state.currentUser = undefined;
    await next();
    return;
  }

  ctx.state.currentUser = {
    id: data.userId,
    username: data.username,
    role: data.role,
  };

  await next();
};
