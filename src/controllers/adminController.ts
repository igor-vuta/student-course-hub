import type { Context } from "@oak/oak";
import { createProgramme, deleteProgrammeById, listProgrammes, setProgrammePublished } from "../models/programmeModel.ts";
import { deleteInterestById, listInterestsForProgramme, listMailingListRows } from "../models/interestModel.ts";
import { renderAdminDashboard } from "../views/adminViews.ts";
import type { AuthenticatedState } from "../middleware/session.ts";

type RouteCtx = Context<AuthenticatedState> & { params: Record<string, string> };

function sanitizeText(input: string, max: number): string {
  return input.trim().slice(0, max);
}

function toSafeAdminMessage(input: string): string {
  return encodeURIComponent(input.slice(0, 200));
}

function csvEscape(value: string): string {
  const safe = value.replaceAll('"', '""');
  return `"${safe}"`;
}

function buildCsvTimestamp(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${d}-${hh}${mm}${ss}`;
}

function isValidEmail(input: string): boolean {
  const email = input.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 120;
}

export async function adminDashboardHandler(ctx: Context<AuthenticatedState>): Promise<void> {
  const user = ctx.state.currentUser;
  if (!user) {
    ctx.response.redirect("/login");
    return;
  }

  const message = ctx.request.url.searchParams.get("message") || undefined;
  const programmes = listProgrammes({ includeUnpublished: true });
  const interestsByProgramme = programmes.map((programme) => ({
    programmeId: programme.id,
    programmeTitle: programme.title,
    interests: (() => {
      const rows = listInterestsForProgramme(programme.id);
      const counts = new Map<string, number>();
      for (const row of rows) {
        const key = row.email.trim().toLowerCase();
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      return rows.map((row) => {
        const key = row.email.trim().toLowerCase();
        return {
          ...row,
          isDuplicate: (counts.get(key) ?? 0) > 1,
          isInvalid: !isValidEmail(row.email),
        };
      });
    })(),
  }));

  ctx.response.body = renderAdminDashboard({
    currentUser: user,
    programmes: programmes.map(p => ({ ...p, csrfToken: ctx.state.csrfToken })),
    interestsByProgramme,
    message,
    csrfToken: ctx.state.csrfToken,
  });
}

export async function createProgrammeHandler(ctx: Context<AuthenticatedState>): Promise<void> {
  const wantsJson = ctx.request.headers.get("accept")?.includes("application/json");
  const formData = await ctx.request.body({ type: "form" }).value;
  const user = ctx.state.currentUser;
  if (!user || user.role !== "admin") {
    ctx.response.status = 403;
    ctx.response.body = "Only admin users can create programmes.";
    return;
  }
  if (!formData || typeof formData.get !== "function") {
    const msg = "Invalid form submission.";
    if (wantsJson) {
      ctx.response.type = "application/json";
      ctx.response.body = { ok: false, message: msg };
    } else {
      ctx.response.redirect(`/admin?message=${toSafeAdminMessage(msg)}`);
    }
    return;
  }
  const title = sanitizeText(String(formData.get("title") || ""), 120);
  const levelRaw = String(formData.get("level") || "");
  const description = sanitizeText(String(formData.get("description") || ""), 500);
  const imageUrl = sanitizeText(String(formData.get("imageUrl") || ""), 400);
  const published = formData.get("published") ? 1 : 0;

  if (!title || !description || !imageUrl) {
    const msg = "Please complete all required fields.";
    if (wantsJson) {
      ctx.response.type = "application/json";
      ctx.response.body = { ok: false, message: msg };
    } else {
      ctx.response.redirect(`/admin?message=${toSafeAdminMessage(msg)}`);
    }
    return;
  }

  if (levelRaw !== "Undergraduate" && levelRaw !== "Postgraduate") {
    const msg = "Invalid programme level.";
    if (wantsJson) {
      ctx.response.type = "application/json";
      ctx.response.body = { ok: false, message: msg };
    } else {
      ctx.response.redirect(`/admin?message=${toSafeAdminMessage(msg)}`);
    }
    return;
  }

  createProgramme({
    title,
    level: levelRaw,
    description,
    imageUrl,
    published,
  });

  if (wantsJson) {
    ctx.response.type = "application/json";
    ctx.response.body = { ok: true, message: "Programme created." };
    return;
  }
  ctx.response.redirect(`/admin?message=${toSafeAdminMessage("Programme created successfully.")}`);
}

export async function toggleProgrammePublishHandler(ctx: RouteCtx): Promise<void> {
  const user = ctx.state.currentUser;
  if (!user) {
    ctx.response.redirect("/login");
    return;
  }

  const wantsJson = ctx.request.headers.get("accept")?.includes("application/json");
  const programmeId = Number(ctx.params.id);
  if (!Number.isInteger(programmeId) || programmeId < 1) {
    const msg = "Invalid programme ID.";
    if (wantsJson) {
      ctx.response.type = "application/json";
      ctx.response.body = { ok: false, message: msg };
    } else {
      ctx.response.redirect(`/admin?message=${toSafeAdminMessage(msg)}`);
    }
    return;
  }


  const formData = await ctx.request.body({ type: "form" }).value;
  if (!formData || typeof formData.get !== "function") {
    const msg = "Invalid form submission.";
    if (wantsJson) {
      ctx.response.type = "application/json";
      ctx.response.body = { ok: false, message: msg };
    } else {
      ctx.response.redirect(`/admin?message=${toSafeAdminMessage(msg)}`);
    }
    return;
  }
  const published = Number(formData.get("published")) === 1 ? 1 : 0;

  setProgrammePublished(programmeId, published);
  const text = published ? "Programme published." : "Programme unpublished.";
  if (wantsJson) {
    ctx.response.type = "application/json";
    ctx.response.body = { ok: true, message: text };
    return;
  }
  ctx.response.redirect(`/admin?message=${toSafeAdminMessage(text)}`);
}

export async function deleteProgrammeHandler(ctx: RouteCtx): Promise<void> {
  const user = ctx.state.currentUser;
  if (!user || user.role !== "admin") {
    ctx.response.status = 403;
    ctx.response.body = "Only admin users can delete programmes.";
    return;
  }

  const wantsJson = ctx.request.headers.get("accept")?.includes("application/json");
  const programmeId = Number(ctx.params.id);
  if (!Number.isInteger(programmeId) || programmeId < 1) {
    const msg = "Invalid programme ID.";
    if (wantsJson) {
      ctx.response.type = "application/json";
      ctx.response.body = { ok: false, message: msg };
    } else {
      ctx.response.redirect(`/admin?message=${toSafeAdminMessage(msg)}`);
    }
    return;
  }

  const deleted = deleteProgrammeById(programmeId);
  const message = deleted ? "Programme deleted successfully." : "Programme not found.";

  if (wantsJson) {
    ctx.response.type = "application/json";
    ctx.response.body = { ok: deleted, message };
    return;
  }

  ctx.response.redirect(`/admin?message=${toSafeAdminMessage(message)}`);
}

export async function exportMailingListHandler(ctx: Context<AuthenticatedState>): Promise<void> {
  const user = ctx.state.currentUser;
  if (!user) {
    ctx.response.redirect("/login");
    return;
  }

  const programmeIdParam = ctx.request.url.searchParams.get("programmeId");
  const programmeId = programmeIdParam ? Number(programmeIdParam) : undefined;
  const validProgrammeId = Number.isInteger(programmeId) && (programmeId as number) > 0
    ? programmeId
    : undefined;

  const rows = listMailingListRows(validProgrammeId);

  const header = [
    "programme_id",
    "programme_title",
    "student_name",
    "email",
    "registered_at",
  ].join(",");

  const body = rows
    .map((row) => [
      String(row.programme_id),
      csvEscape(row.programme_title),
      csvEscape(row.student_name),
      csvEscape(row.email),
      csvEscape(row.created_at),
    ].join(","))
    .join("\n");

  const csv = `${header}\n${body}`;
  const timestamp = buildCsvTimestamp(new Date());
  const scope = validProgrammeId ? `programme-${validProgrammeId}` : "all-programmes";
  const filename = `mailing-list-${scope}-${timestamp}.csv`;

  ctx.response.status = 200;
  ctx.response.type = "text/csv; charset=utf-8";
  ctx.response.headers.set("Content-Disposition", `attachment; filename=\"${filename}\"`);
  ctx.response.body = csv;
}

export async function deleteInterestHandler(ctx: RouteCtx): Promise<void> {
  const user = ctx.state.currentUser;
  if (!user) {
    ctx.response.redirect("/login");
    return;
  }

  const wantsJson = ctx.request.headers.get("accept")?.includes("application/json");
  const interestId = Number(ctx.params.id);
  if (!Number.isInteger(interestId) || interestId < 1) {
    const msg = "Invalid interest ID.";
    if (wantsJson) {
      ctx.response.type = "application/json";
      ctx.response.body = { ok: false, message: msg };
    } else {
      ctx.response.redirect(`/admin?message=${toSafeAdminMessage(msg)}`);
    }
    return;
  }

  const removed = deleteInterestById(interestId);
  const message = removed ? "Interest registration removed." : "Interest registration not found.";

  if (wantsJson) {
    ctx.response.type = "application/json";
    ctx.response.body = { ok: removed, message };
    return;
  }

  ctx.response.redirect(`/admin?message=${toSafeAdminMessage(message)}`);
}
