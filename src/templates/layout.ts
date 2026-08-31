import type { User } from "../types.ts";

export function renderLayout({
  title,
  content,
  currentUser,
  nav,
  footer,
}: {
  title: string;
  content: string;
  currentUser?: User;
  nav?: string;
  footer?: string;
}): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title} | Student Course Hub</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/public/css/styles.css" />
    <link rel="icon" type="image/png" href="/public/img/favicon/favicon-96x96.png" sizes="96x96" />
    <link rel="icon" type="image/svg+xml" href="/public/img/favicon/favicon.svg" />
    <link rel="shortcut icon" href="/public/img/favicon/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="/public/img/favicon/apple-touch-icon.png" />
    <meta name="apple-mobile-web-app-title" content="Student Course Hub" />
    <link rel="manifest" href="/public/img/favicon/site.webmanifest" />
  </head>
  <body>
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <div class="background-blur"></div>
    ${nav || ""}
    <main id="main-content" class="container glass-panel" tabindex="-1">
      ${content}
    </main>
    ${footer || ""}
    <script src="/public/js/programmes.js" defer></script>
  </body>
</html>`;
}
