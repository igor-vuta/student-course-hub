import type { Programme } from "../types.ts";
import { esc } from "../views/layout.ts";

export function renderProgrammeCard(programme: Programme): string {
  return `<a href="/programmes/${programme.id}" class="card card-link" data-programme-id="${programme.id}">
    <div class="card-img-wrap">
      <img src="${esc(programme.image_url)}" alt="${esc(programme.title)}" loading="lazy" onerror="this.onerror=null;this.src='/public/img/fallback.svg';this.classList.add('img-fallback');" />
    </div>
    <div class="card-content flex-col">
      <span class="badge badge-${esc(programme.level.toLowerCase())}">${esc(programme.level)}</span>
      <h3 class="card-title">${esc(programme.title)}</h3>
      <p class="card-desc">${esc(programme.description)}</p>
    </div>
  </a>`;
}
