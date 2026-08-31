import type { ModuleRow, Programme, ProgrammeLevel, StaffRow, User } from "../types.ts";
import { esc } from "./layout.ts";
import { renderLayout } from "../templates/layout.ts";
import { renderNav } from "../templates/nav.ts";
import { renderProgrammeCard } from "../templates/card.ts";
import { renderFeedback } from "../templates/feedback.ts";


export function renderProgrammeListPage(options: {
  programmes: Programme[];
  search: string;
  level: ProgrammeLevel | "";
  message?: string;
  currentUser?: User;
}): string {

  const resultCount = options.programmes.length;
  const levelDisplay = options.level === "Undergraduate" ? "Undergraduate"
    : options.level === "Postgraduate" ? "Postgraduate"
    : "All";
  const cards = options.programmes.map(renderProgrammeCard).join("\n");
  const emptyState = `<div class="empty-state">
    <img src="/public/img/empty-state.svg" alt="No results" class="empty-img" />
    <h3>No programmes found</h3>
    <p>Try adjusting your filters or search keywords.</p>
  </div>`;

  const content = `
    <section class="hero">
      <h1>Find the right degree programme</h1>
      <p>Explore undergraduate and postgraduate pathways, modules, and teaching staff.</p>
    </section>

    ${options.message ? renderFeedback(options.message) : ""}

    <section class="toolbar filter-toolbar" aria-label="Programme filters">
      <form id="search-form" class="filters" action="/programmes" method="get">
      <div class="filter-group">
      <label for="search">Keyword</label>
      <input id="search" name="search" value="${esc(options.search)}" placeholder="e.g. security" />
      </div>
      
      <div class="filter-group">
      <label id="level-label">Level</label>
      <div class="custom-select" id="level-select" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-labelledby="level-label" tabindex="0">
        <span class="custom-select-value">${levelDisplay}</span>
        <svg class="custom-select-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 6l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <ul class="custom-select-options" role="listbox" aria-labelledby="level-label">
          <li class="custom-select-option${options.level === "" ? " is-selected" : ""}" role="option" data-value="" aria-selected="${options.level === "" ? "true" : "false"}">All</li>
          <li class="custom-select-option${options.level === "Undergraduate" ? " is-selected" : ""}" role="option" data-value="Undergraduate" aria-selected="${options.level === "Undergraduate" ? "true" : "false"}">Undergraduate</li>
          <li class="custom-select-option${options.level === "Postgraduate" ? " is-selected" : ""}" role="option" data-value="Postgraduate" aria-selected="${options.level === "Postgraduate" ? "true" : "false"}">Postgraduate</li>
        </ul>
        <input type="hidden" name="level" value="${esc(options.level)}" />
      </div>
      </div>
      <div class="filter-actions">
        <button type="submit" class="btn-primary">Apply filters</button>
      </div>
      
      </form>
      <div class="filter-result-row">
        <span class="result-count" id="result-count" role="status" aria-live="polite">Showing ${resultCount} programme${resultCount === 1 ? "" : "s"}</span>
      </div>
    </section>

    <section id="programme-results" class="programme-grid" aria-live="polite">
      ${cards || emptyState}
    </section>
  `;

  return renderLayout({
    title: "Programmes",
    content,
    currentUser: options.currentUser,
    nav: renderNav(options.currentUser),
  });
}

export function renderProgrammeDetailPage(options: {
  programme: Programme;
  modules: ModuleRow[];
  staff: StaffRow[];
  message?: string;
  currentUser?: User;
}): string {
    const modulesByYear = options.modules.reduce<Record<number, ModuleRow[]>>((acc, module) => {
      if (!acc[module.year]) {
        acc[module.year] = [];
      }
      acc[module.year].push(module);
      return acc;
    }, {});

    const yearSections = Object.keys(modulesByYear)
      .map((yearKey) => {
        const year = Number(yearKey);
        const items = modulesByYear[year]
          .map((module) => `<li><strong>${esc(module.name)}</strong> - ${esc(module.description)}<br /><span class="muted">Leader: ${esc(module.leader_name)}</span></li>`)
          .join("");
        return `<section class="panel"><h3>Year ${year}</h3><ul>${items}</ul></section>`;
      })
      .join("\n");

    const staffList = options.staff.length > 0
      ? `<ul>${options.staff.map((s) => `<li><strong>${esc(s.name)}</strong> - ${esc(s.responsibility)} (${esc(s.role_title)})</li>`).join("")}</ul>`
      : "<p>No staff currently assigned.</p>";

    const content = `
      <section class="hero detail-hero">
        <img src="${esc(options.programme.image_url)}" alt="${esc(options.programme.title)}" />
        <div>
          <p class="eyebrow">${esc(options.programme.level)}</p>
          <h1>${esc(options.programme.title)}</h1>
          <p>${esc(options.programme.description)}</p>
        </div>
      </section>

      ${options.message ? renderFeedback(options.message) : ""}

      <section class="layout-two">
        <div>
          <h2>Modules by year</h2>
          ${yearSections || "<p>No modules have been assigned yet.</p>"}
        </div>

        <aside>
          <h2>Teaching staff</h2>
          ${staffList}

          <h2>Register your interest</h2>
          <form action="/interests" method="post" class="interest-form">
            <input type="hidden" name="programmeId" value="${options.programme.id}" />
            <input type="hidden" name="_csrf" value="${(options as any).csrfToken || ''}" />

            <label for="studentName">Full name</label>
            <input id="studentName" name="studentName" required maxlength="80" />

            <label for="email">Email</label>
            <input id="email" name="email" type="email" required maxlength="120" />

            <button type="submit">Register interest</button>
          </form>

          <h3>Manage your updates</h3>
          <form action="/interests/withdraw" method="post" class="interest-form">
            <input type="hidden" name="programmeId" value="${options.programme.id}" />
            <input type="hidden" name="_csrf" value="${(options as any).csrfToken || ''}" />

            <label for="withdrawEmail">Email used for registration</label>
            <input id="withdrawEmail" name="email" type="email" required maxlength="120" />

            <button type="submit">Withdraw interest</button>
          </form>
        </aside>
      </section>
    `;

    return renderLayout({
      title: options.programme.title,
      content,
      currentUser: options.currentUser,
      nav: renderNav(options.currentUser),
    });
}

export function renderProgrammesJson(programmes: Programme[]): string {
  return JSON.stringify(
    programmes.map((p) => ({
      id: p.id,
      title: p.title,
      level: p.level,
      description: p.description,
      imageUrl: p.image_url,
    })),
  );
}
