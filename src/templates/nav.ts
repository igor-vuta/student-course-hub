import type { User } from "../types.ts";

export function renderNav(currentUser?: User): string {
  return `<header class="site-header">
    <a class="brand" href="/programmes">Student Course Hub</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav-menu" aria-label="Toggle navigation menu">
      <span class="nav-toggle-bar"></span>
      <span class="nav-toggle-bar"></span>
      <span class="nav-toggle-bar"></span>
    </button>
    <nav aria-label="Primary navigation">
      <div id="primary-nav-menu" class="nav-menu">
      ${currentUser
        ? `<span class="user-chip">Signed in as ${currentUser.username} (${currentUser.role})</span>
           <form action="/logout" method="post" class="inline-form logout-form">
             <button type="submit" class="logout-btn" title="Logout" aria-label="Logout">
               <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;margin-right:0.4em;"><path d="M7.5 3.5V2.5C7.5 1.94772 7.94772 1.5 8.5 1.5H15.5C16.0523 1.5 16.5 1.94772 16.5 2.5V17.5C16.5 18.0523 16.0523 18.5 15.5 18.5H8.5C7.94772 18.5 7.5 18.0523 7.5 17.5V16.5" stroke="#0e6b4f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.5 10H3.5M3.5 10L6 7.5M3.5 10L6 12.5" stroke="#0e6b4f" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
               Logout
             </button>
           </form>
           <a href="${currentUser.role === "admin" ? "/admin" : "/editor"}">Dashboard</a>`
        : `<a href="/login">Admin login</a>`}
      </div>
    </nav>
  </header>`;
}
