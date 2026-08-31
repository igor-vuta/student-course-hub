export function renderEditModulesForm(options: {
  programme: Programme & { csrfToken?: string };
  modules: ModuleRow[];
  currentUser: User;
  message?: string;
}): string {
  const { programme, modules, currentUser, message } = options;
  return renderLayout({
    title: `Edit Modules for ${esc(programme.title)}`,
    currentUser,
    nav: renderNav(currentUser),
    content: `
      <section class="panel">
        <h2>Edit Modules by Year</h2>
        ${message ? renderFeedback(message) : ""}
        <form action="/admin/programmes/${programme.id}/modules/edit" method="post" class="edit-modules-form">
          <input type="hidden" name="_csrf" value="${programme.csrfToken || ''}" />
          <table>
            <thead>
              <tr><th>Year</th><th>Module Name</th><th>Description</th><th>Leader</th><th>Actions</th></tr>
            </thead>
            <tbody>
              ${modules.map(m => `
                <tr>
                  <td><input name="year_${m.id}" value="${m.year}" size="2" /></td>
                  <td><input name="name_${m.id}" value="${esc(m.name)}" maxlength="100" /></td>
                  <td><input name="desc_${m.id}" value="${esc(m.description)}" maxlength="200" /></td>
                  <td>${esc(m.leader_name)}</td>
                  <td>
                    <form action="/admin/programmes/${programme.id}/modules/${m.id}/delete" method="post" class="inline-form" onsubmit="return confirm('Delete this module? This cannot be undone.');">
                      <input type="hidden" name="_csrf" value="${programme.csrfToken || ''}" />
                      <button type="submit" class="secondary-btn">Delete</button>
                    </form>
                  </td>
                </tr>
              `).join("")}
              <tr>
                <td><input name="year_new" value="" size="2" placeholder="Year" /></td>
                <td><input name="name_new" value="" maxlength="100" placeholder="Module name" /></td>
                <td><input name="desc_new" value="" maxlength="200" placeholder="Description" /></td>
                <td>-</td>
              </tr>
            </tbody>
          </table>
          <button type="submit">Save module changes</button>
          <button type="submit" name="add_module" value="1" class="secondary-btn">Add module</button>
        </form>
      </section>
    `,
  });
}
export function renderEditProgrammeForm(options: {
  programme: Programme & { csrfToken?: string };
  currentUser: User;
  message?: string;
}): string {
  const { programme, currentUser, message } = options;
  return renderLayout({
    title: `Edit Programme: ${esc(programme.title)}`,
    currentUser,
    nav: renderNav(currentUser),
    content: `
      <section class="panel">
        <h2>Edit Programme</h2>
        ${message ? renderFeedback(message) : ""}
        <form action="/admin/programmes/${programme.id}/edit" method="post" class="edit-programme-form">
          <input type="hidden" name="_csrf" value="${programme.csrfToken || ''}" />
          <label for="title-edit">Title</label>
          <input id="title-edit" name="title" required maxlength="120" value="${esc(programme.title)}" />

          <label for="level-edit">Level</label>
          <select id="level-edit" name="level">
            <option value="Undergraduate"${programme.level === "Undergraduate" ? " selected" : ""}>Undergraduate</option>
            <option value="Postgraduate"${programme.level === "Postgraduate" ? " selected" : ""}>Postgraduate</option>
          </select>

          <label for="description-edit">Description</label>
          <textarea id="description-edit" name="description" required maxlength="500">${esc(programme.description)}</textarea>

          <label for="imageUrl-edit">Image URL</label>
          <input id="imageUrl-edit" name="imageUrl" required value="${esc(programme.image_url || "")}" />

          <label class="switch-label">
            <input type="checkbox" name="published" value="1" class="switch-input"${programme.published ? " checked" : ""} />
            <span class="switch-slider"></span>
            <span class="switch-text">Published</span>
          </label>

          <button type="submit">Save changes</button>
        </form>
      </section>
    `,
  });
}
import type { ModuleRow, Programme, User } from "../types.ts";
import type { ProgrammeInterestRow } from "../models/interestModel.ts";
import { esc } from "./layout.ts";
import { renderLayout } from "../templates/layout.ts";
import { renderNav } from "../templates/nav.ts";
import { renderFeedback } from "../templates/feedback.ts";

type ProgrammeWithCsrf = Programme & { csrfToken?: string };

function formatDateTime(input: string): string {
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) {
    return esc(input);
  }
  return d.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderInterestTable(interestRows: Array<ProgrammeInterestRow & {
  isDuplicate: boolean;
  isInvalid: boolean;
}>, csrfToken: string): string {
  if (interestRows.length === 0) {
    return "<p>No student interests registered yet.</p>";
  }

  return `<table class="interest-table">
    <thead>
      <tr><th>Student name</th><th>Email</th><th>Registered at</th><th>Status</th><th>Action</th></tr>
    </thead>
    <tbody>
      ${interestRows.map((row) => `<tr>
        <td>${esc(row.student_name)}</td>
        <td>${esc(row.email)}</td>
        <td>${formatDateTime(row.created_at)}</td>
        <td>${[
          row.isDuplicate ? "Duplicate" : "",
          row.isInvalid ? "Invalid email" : "",
        ].filter(Boolean).join("; ") || "Valid"}</td>
        <td>
          <form action="/admin/interests/${row.id}/delete" method="post" class="inline-form" onsubmit="return confirm('Remove this registration?');">
            <input type="hidden" name="_csrf" value="${csrfToken}" />
            <button type="submit">Remove</button>
          </form>
        </td>
      </tr>`).join("\n")}
    </tbody>
  </table>`;
}

function programmeRow(programme: ProgrammeWithCsrf, canDelete: boolean): string {
  const toggleLabel = programme.published ? "Unpublish" : "Publish";
  const toggleValue = programme.published ? 0 : 1;
  const publishAction = `<form action="/admin/programmes/${programme.id}/publish" method="post" class="inline-form">
      <input type="hidden" name="published" value="${toggleValue}" />
      <input type="hidden" name="_csrf" value="${programme.csrfToken || ''}" />
      <button type="submit" class="row-action-item">${toggleLabel}</button>
    </form>`;
  const editAction = `<a href="/admin/programmes/${programme.id}/edit" class="edit-btn row-action-item" title="Edit programme">Edit</a>`;
  const modulesAction = `<a href="/admin/programmes/${programme.id}/modules/edit" class="edit-btn row-action-item" title="Edit modules">Edit modules</a>`;
  const deleteAction = canDelete
    ? `<form action="/admin/programmes/${programme.id}/delete" method="post" class="inline-form" onsubmit="return confirm('Delete this programme and all related interest data?');">
        <input type="hidden" name="_csrf" value="${programme.csrfToken || ''}" />
        <button type="submit" class="row-action-item">Delete</button>
      </form>`
    : "";

  return `<tr>
    <td data-label="Title">${esc(programme.title)}</td>
    <td data-label="Level">${esc(programme.level)}</td>
    <td data-label="Published">${programme.published ? "Yes" : "No"}</td>
    <td data-label="Action" class="action-cell">
      <div class="action-inline">
        ${publishAction}
        ${editAction}
        ${modulesAction}
        ${deleteAction}
      </div>
      <details class="row-action-menu">
        <summary class="row-action-toggle" aria-label="Open actions" title="Actions">&#8942;</summary>
        <div class="row-action-list">
          ${publishAction}
          ${editAction}
          ${modulesAction}
          ${deleteAction}
        </div>
      </details>
    </td>
  </tr>`;
}

export function renderAdminDashboard(options: {
  currentUser: User;
  programmes: ProgrammeWithCsrf[];
  interestsByProgramme: Array<{
    programmeId: number;
    programmeTitle: string;
    interests: Array<ProgrammeInterestRow & {
      isDuplicate: boolean;
      isInvalid: boolean;
    }>;
  }>;
  csrfToken?: string;
  message?: string;
}): string {
  const createForm = options.currentUser.role === "admin"
    ? `<section class="panel">
      <h2>Create programme (admin only)</h2>
      <form action="/admin/programmes" method="post" class="admin-form">
        <input type="hidden" name="_csrf" value="${options.csrfToken || ''}" />
        <label for="title">Title</label>
        <input id="title" name="title" required maxlength="120" />

        <label for="level">Level</label>
        <select id="level" name="level">
          <option value="Undergraduate">Undergraduate</option>
          <option value="Postgraduate">Postgraduate</option>
        </select>

        <label for="description">Description</label>
        <textarea id="description" name="description" required maxlength="500"></textarea>

        <label for="imageUrl">Image URL</label>
        <input id="imageUrl" name="imageUrl" required />

        <label class="switch-label">
          <input type="checkbox" name="published" value="1" checked class="switch-input" />
          <span class="switch-slider"></span>
          <span class="switch-text">Publish now</span>
        </label>

        <button type="submit">Create programme</button>
      </form>
    </section>`
    : `<section class="panel"><h2>Create programme</h2><p>Only admins can create new programmes.</p></section>`;

  const canDelete = options.currentUser.role === "admin";
  const tableRows = options.programmes.map((programme) => programmeRow(programme, canDelete)).join("\n");
  const prospectivePanels = options.interestsByProgramme
    .map((group) => `<section class="panel">
      <h3>${esc(group.programmeTitle)}</h3>
      <p>${group.interests.length} prospective student${group.interests.length === 1 ? "" : "s"}</p>
      <p><a href="/admin/interests/export?programmeId=${group.programmeId}">Export CSV for this programme</a></p>
      ${renderInterestTable(group.interests, options.csrfToken || "")}
    </section>`)
    .join("\n");

  const content = `
    <section class="hero">
      <h1>Admin dashboard</h1>
      <p>Manage programme visibility and core content.</p>
    </section>

    ${options.message ? renderFeedback(options.message) : ""}

    <section class="panel programmes-panel">
      <h2>Programmes</h2>
      <table class="programmes-table">
        <thead>
          <tr><th>Title</th><th>Level</th><th>Published</th><th>Action</th></tr>
        </thead>
        <tbody>${tableRows}</tbody>
      </table>
    </section>

    <section>
      <h2>Prospective students by programme</h2>
      <p><a href="/admin/interests/export">Export CSV for all programmes</a></p>
      ${prospectivePanels}
    </section>

    ${createForm}
  `;

  return renderLayout({
    title: "Admin dashboard",
    content,
    currentUser: options.currentUser,
    nav: renderNav(options.currentUser),
  });
}
