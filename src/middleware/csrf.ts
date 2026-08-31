import type { Middleware } from "@oak/oak";

const TOKEN_KEY = "csrfToken";

export const csrfMiddleware: Middleware = async (ctx, next) => {
  let token = await ctx.cookies.get(TOKEN_KEY);
  if (!token) {
    token = crypto.randomUUID();
    await ctx.cookies.set(TOKEN_KEY, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: (Deno.env.get("APP_ENV") ?? "dev") === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
  }
  ctx.state.csrfToken = token;
  await next();
};
