import type { Context } from "@oak/oak";
import { verifyCredentials } from "../models/userModel.ts";
import { clearSession, createSession } from "../middleware/session.ts";
import { renderLoginPage } from "../views/authViews.ts";
import type { AuthenticatedState } from "../middleware/session.ts";

export async function loginPageHandler(ctx: Context<AuthenticatedState>): Promise<void> {
  if (ctx.state.currentUser) {
    ctx.response.redirect(ctx.state.currentUser.role === "admin" ? "/admin" : "/editor");
    return;
  }

  if (!ctx.state.csrfToken) {
    ctx.response.redirect(ctx.request.url.pathname);
    return;
  }

  ctx.response.body = renderLoginPage({ csrfToken: ctx.state.csrfToken });
}

export async function loginHandler(ctx: Context<AuthenticatedState>): Promise<void> {

  let submitted: string | undefined = undefined;
  let username: string = "";
  let password: string = "";
  const body = await ctx.request.body();
  const bodyType = body.type;
  let bodyValue;
  if (bodyType === "form" || bodyType === "json") {
    bodyValue = await body.value;
  } else {
    bodyValue = body.value;
  }
  if (bodyType === "form") {
    if (!bodyValue) {
    } else {
      submitted = bodyValue.get("_csrf") || undefined;
      username = (bodyValue.get("username") || "").toString().trim();
      password = (bodyValue.get("password") || "").toString();
    }
  } else if (bodyType === "json") {
    submitted = bodyValue?._csrf;
    username = (bodyValue?.username || "").toString().trim();
    password = (bodyValue?.password || "").toString();
  }

  if (!submitted || submitted !== ctx.state.csrfToken) {
    console.error("[LOGIN] Invalid CSRF token");
    ctx.response.body = renderLoginPage({ error: "Invalid CSRF token.", csrfToken: ctx.state.csrfToken });
    return;
  }
  if (!username || !password) {
    console.error("[LOGIN] Missing username or password", { username });
    ctx.response.body = renderLoginPage({ error: "Username and password are required.", csrfToken: ctx.state.csrfToken });
    return;
  }

  if (!username || !password) {
    console.error("[LOGIN] Missing username or password", { username });
    ctx.response.body = renderLoginPage({ error: "Username and password are required.", csrfToken: ctx.state.csrfToken });
    return;
  }

  const user = await verifyCredentials(username, password);
  if (!user) {
    console.error("[LOGIN] Invalid credentials for user", { username });
    ctx.response.body = renderLoginPage({ error: "Invalid credentials.", csrfToken: ctx.state.csrfToken });
    return;
  }

  await createSession(ctx, user);
  ctx.response.redirect(user.role === "admin" ? "/admin" : "/editor");
}

export async function logoutHandler(ctx: Context<AuthenticatedState>): Promise<void> {
  await clearSession(ctx);
  ctx.response.redirect("/programmes");
}
