import { esc } from "./layout.ts";
import { renderLayout } from "../templates/layout.ts";
import { renderNav } from "../templates/nav.ts";
import { renderFeedback } from "../templates/feedback.ts";
import type { User } from "../types.ts";

export function renderLoginPage(options: { error?: string; currentUser?: User; csrfToken?: string }): string {
  const content = `
    <section class="auth-card">
      <h1>Administrator sign in</h1>
      <p>Demo instance &mdash; sign in with <code>admin/admin123</code> or <code>editor/editor123</code>. All data resets nightly.</p>
      ${options.error ? renderFeedback(options.error, "error") : ""}

      <form action="/login" method="post">
        <input type="hidden" name="_csrf" value="${options.csrfToken || ''}" />
        <label for="username">Username</label>
        <input id="username" name="username" required />

        <label for="password">Password</label>
        <input id="password" name="password" type="password" required />

        <button type="submit">Sign in</button>
      </form>
    </section>
  `;

  return renderLayout({
    title: "Login",
    content,
    currentUser: options.currentUser,
    nav: renderNav(options.currentUser),
  });
}
