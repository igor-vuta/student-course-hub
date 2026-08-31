import type { Context } from "@oak/oak";
import { getProgrammeById, updateProgramme } from "../models/programmeModel.ts";
import { renderEditProgrammeForm } from "../views/adminViews.ts";
import type { AuthenticatedState } from "../middleware/session.ts";

type RouteCtx = Context<AuthenticatedState> & { params: Record<string, string> };

export async function editProgrammeFormHandler(ctx: RouteCtx): Promise<void> {
  const id = Number(ctx.params.id);
  const programme = getProgrammeById(id, true);
  if (!programme) {
    ctx.response.status = 404;
    ctx.response.body = "Programme not found.";
    return;
  }
  ctx.response.body = renderEditProgrammeForm({
    programme: { ...programme, csrfToken: ctx.state.csrfToken },
    currentUser: ctx.state.currentUser!,
    message: ctx.request.url.searchParams.get("message") || undefined,
  });
}

export async function editProgrammePostHandler(ctx: RouteCtx): Promise<void> {
  const id = Number(ctx.params.id);
  const programme = getProgrammeById(id, true);
  if (!programme) {
    ctx.response.status = 404;
    ctx.response.body = "Programme not found.";
    return;
  }
  const formData = await ctx.request.body({ type: "form" }).value;
  const title = String(formData.get("title") || "").trim();
  const level = String(formData.get("level") || "");
  const description = String(formData.get("description") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const published = formData.get("published") ? 1 : 0;
  if (!title || !description || !imageUrl || (level !== "Undergraduate" && level !== "Postgraduate")) {
    ctx.response.redirect(`/admin/programmes/${id}/edit?message=Please+complete+all+fields+correctly.`);
    return;
  }
  updateProgramme(id, { title, level, description, imageUrl, published });
  ctx.response.redirect(`/admin?message=Programme+updated+successfully.`);
}
