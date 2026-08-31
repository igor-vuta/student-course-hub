export function renderBreadcrumbs(links: Array<{ href: string; label: string }>): string {
  return `<nav aria-label="Breadcrumb" class="breadcrumbs">
    <ol>
      ${links.map((l, i) => `<li>${i < links.length - 1 ? `<a href='${l.href}'>${l.label}</a>` : `<span aria-current='page'>${l.label}</span>`}</li>`).join("<span class='crumb-sep'>/</span>")}
    </ol>
  </nav>`;
}
