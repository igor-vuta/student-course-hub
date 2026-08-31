import type { User } from "../types.ts";
import { escape as escapeHtml } from "@std/html";

export function pageLayout(options: {
  title: string;
  body: string;
  currentUser?: User;
}): string {
  const userLine = options.currentUser
    ? `<span class="user-chip">Signed in as ${escapeHtml(options.currentUser.username)} (${options.currentUser.role})</span>
       <form action="/logout" method="post" class="inline-form"><button type="submit">Logout</button></form>
       <a href="/admin">Admin</a>`
    : `<a href="/login">Admin login</a>`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(options.title)}</title>
    <link rel="stylesheet" href="/public/css/styles.css" />
  </head>
  <body>
    <header class="site-header">
      <a class="brand" href="/programmes">Student Course Hub</a>
      <nav>${userLine}</nav>
    </header>
    <main class="container">
      ${options.body}
    </main>
    <script src="/public/js/programmes.js" defer></script>
  </body>
</html>`;
}

export function esc(input: string): string {
  return escapeHtml(input);
}
