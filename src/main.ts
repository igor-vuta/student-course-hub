import { Application, send } from "@oak/oak";
import { initializeDatabase } from "./db/init.ts";
import { router } from "./routes/router.ts";
import { sessionMiddleware } from "./middleware/session.ts";
import { csrfMiddleware } from "./middleware/csrf.ts";

await initializeDatabase();

const app = new Application();

app.use(sessionMiddleware);
app.use(csrfMiddleware);

app.use(async (ctx, next) => {
  if (ctx.request.url.pathname.startsWith("/public/")) {
    await send(ctx, ctx.request.url.pathname, {
      root: Deno.cwd(),
    });
    return;
  }

  await next();
});

app.use(router.routes());
app.use(router.allowedMethods());

const PORT = Number(Deno.env.get("PORT") ?? 8000);
console.log(`Student Course Hub running at http://localhost:${PORT}`);
await app.listen({ port: PORT });
