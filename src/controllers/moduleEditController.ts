import { getProgrammeById, listModulesForProgramme, updateModule, createModuleForProgramme, deleteModuleById } from "../models/programmeModel.ts";
export async function editModulesPostHandler(ctx: RouteCtx): Promise<void> {
  const id = Number(ctx.params.id);
  const programme = getProgrammeById(id, true);
  if (!programme) {
    ctx.response.status = 404;
    ctx.response.body = "Programme not found.";
    return;
  }
  const modules = listModulesForProgramme(id);
  const formData = await ctx.request.body({ type: "form" }).value;
    let updated = 0;
    for (const m of modules) {
      const name = String(formData.get(`name_${m.id}`) || "").trim();
      const year = Number(formData.get(`year_${m.id}`));
      const description = String(formData.get(`desc_${m.id}`) || "").trim();
      if (name && year && description && (name !== m.name || year !== m.year || description !== m.description)) {
        updateModule(m.id, { name, year, description });
        updated++;
      }
    }

    if (formData.get("add_module")) {
      const name = String(formData.get("name_new") || "").trim();
      const year = Number(formData.get("year_new"));
      const description = String(formData.get("desc_new") || "").trim();
      if (name && year && description) {
        createModuleForProgramme(id, { name, year, description });
        ctx.response.redirect(`/admin/programmes/${id}/modules/edit?message=Module+added.`);
        return;
      } else {
        ctx.response.redirect(`/admin/programmes/${id}/modules/edit?message=Please+fill+all+fields+to+add+module.`);
        return;
      }
    }

    ctx.response.redirect(`/admin/programmes/${id}/modules/edit?message=${encodeURIComponent(updated ? "Modules updated." : "No changes.")}`);
}
import type { Context } from "@oak/oak";
import { renderEditModulesForm } from "../views/adminViews.ts";
import type { AuthenticatedState } from "../middleware/session.ts";

type RouteCtx = Context<AuthenticatedState> & { params: Record<string, string> };

export async function editModulesFormHandler(ctx: RouteCtx): Promise<void> {
  const id = Number(ctx.params.id);
  const programme = getProgrammeById(id, true);
  if (!programme) {
    ctx.response.status = 404;
    ctx.response.body = "Programme not found.";
    return;
  }
  const modules = listModulesForProgramme(id);
  ctx.response.body = renderEditModulesForm({
    programme: { ...programme, csrfToken: ctx.state.csrfToken },
    modules,
    currentUser: ctx.state.currentUser!,
    message: ctx.request.url.searchParams.get("message") || undefined,
  });
}

export async function deleteModuleHandler(ctx: RouteCtx): Promise<void> {
  const programmeId = Number(ctx.params.id);
  const moduleId = Number(ctx.params.moduleId);

  if (!Number.isInteger(programmeId) || programmeId < 1 || !Number.isInteger(moduleId) || moduleId < 1) {
    ctx.response.status = 400;
    ctx.response.body = "Invalid programme or module ID.";
    return;
  }

  const programme = getProgrammeById(programmeId, true);
  if (!programme) {
    ctx.response.status = 404;
    ctx.response.body = "Programme not found.";
    return;
  }

  const deleted = deleteModuleById(programmeId, moduleId);
  const message = deleted ? "Module deleted." : "Module not found or already removed.";
  ctx.response.redirect(`/admin/programmes/${programmeId}/modules/edit?message=${encodeURIComponent(message)}`);
}
