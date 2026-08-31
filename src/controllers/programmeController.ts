import type { Context } from "@oak/oak";
import {
  getProgrammeById,
  listModulesForProgramme,
  listProgrammes,
  listStaffForProgramme,
} from "../models/programmeModel.ts";
import {
  createInterest,
  validateInterestInput,
  validateWithdrawInput,
  withdrawInterest,
} from "../models/interestModel.ts";
import { renderProgrammeDetailPage, renderProgrammeListPage, renderProgrammesJson } from "../views/programmeViews.ts";
import type { AuthenticatedState } from "../middleware/session.ts";

export async function listProgrammesHandler(ctx: Context<any>): Promise<void> {
  const url = ctx.request.url;
  const search = (url.searchParams.get("search") || "").trim();
  const levelParam = (url.searchParams.get("level") || "").trim();
  const level = levelParam === "Undergraduate" || levelParam === "Postgraduate" ? levelParam : "";
  const message = url.searchParams.get("message") || undefined;

  const programmes = listProgrammes({ search, level });

  ctx.response.body = renderProgrammeListPage({
    programmes,
    search,
    level,
    message,
    currentUser: (ctx as any).state?.currentUser,
  });
}

export async function listProgrammesJsonHandler(ctx: Context<any>): Promise<void> {
  const url = ctx.request.url;
  const search = (url.searchParams.get("search") || "").trim();
  const levelParam = (url.searchParams.get("level") || "").trim();
  const level = levelParam === "Undergraduate" || levelParam === "Postgraduate" ? levelParam : "";

  const programmes = listProgrammes({ search, level });
  ctx.response.type = "application/json";
  ctx.response.body = renderProgrammesJson(programmes);
}

export async function programmeDetailHandler(
  ctx: Context<any>,
): Promise<void> {
  const id = Number((ctx as any).params?.id);
  if (!Number.isInteger(id) || id < 1) {
    ctx.throw(404, "Programme not found");
  }

  const programme = getProgrammeById(id);
  if (!programme) {
    ctx.throw(404, "Programme not found");
  }

  const modules = listModulesForProgramme(id);
  const staff = listStaffForProgramme(id);
  const message = ctx.request.url.searchParams.get("message") || undefined;

  ctx.response.body = renderProgrammeDetailPage({
    programme: { ...programme, csrfToken: ctx.state.csrfToken },
    modules,
    staff,
    message,
    currentUser: (ctx as any).state?.currentUser,
  });
}

export async function registerInterestHandler(ctx: Context<any>): Promise<void> {
  const wantsJson = ctx.request.headers.get("accept")?.includes("application/json");

  const formData = await ctx.request.body({ type: "form" }).value;
  if (!formData || typeof formData.get !== "function") {
    if (wantsJson) {
      ctx.response.type = "application/json";
      ctx.response.body = { ok: false, message: "Invalid form submission." };
    } else {
      ctx.response.redirect(`/programmes?message=Invalid%20form%20submission`);
    }
    return;
  }
  const programmeId = Number(formData.get("programmeId"));
  const studentName = String(formData.get("studentName") || "");
  const email = String(formData.get("email") || "");

  const validation = validateInterestInput({
    programmeId,
    studentName,
    email,
  });

  if (!validation.valid) {
    if (wantsJson) {
      ctx.response.type = "application/json";
      ctx.response.body = { ok: false, message: validation.message ?? "Invalid input." };
    } else {
      const safeMessage = encodeURIComponent(validation.message || "Invalid input");
      ctx.response.redirect(`/programmes/${programmeId}?message=${safeMessage}`);
    }
    return;
  }

  const result = createInterest({ programmeId, studentName, email });

  if (wantsJson) {
    ctx.response.type = "application/json";
    ctx.response.body = { ok: result.ok, message: result.message };
    return;
  }

  const safeMessage = encodeURIComponent(result.message);
  ctx.response.redirect(`/programmes/${programmeId}?message=${safeMessage}`);
}

export async function withdrawInterestHandler(ctx: Context<any>): Promise<void> {
  const wantsJson = ctx.request.headers.get("accept")?.includes("application/json");
  const formData = await ctx.request.body({ type: "form" }).value;

  if (!formData || typeof formData.get !== "function") {
    if (wantsJson) {
      ctx.response.type = "application/json";
      ctx.response.body = { ok: false, message: "Invalid form submission." };
    } else {
      ctx.response.redirect(`/programmes?message=Invalid%20form%20submission`);
    }
    return;
  }

  const programmeId = Number(formData.get("programmeId"));
  const email = String(formData.get("email") || "");
  const validation = validateWithdrawInput({ programmeId, email });

  if (!validation.valid) {
    if (wantsJson) {
      ctx.response.type = "application/json";
      ctx.response.body = { ok: false, message: validation.message ?? "Invalid input." };
    } else {
      const safeMessage = encodeURIComponent(validation.message || "Invalid input");
      ctx.response.redirect(`/programmes/${programmeId}?message=${safeMessage}`);
    }
    return;
  }

  const result = withdrawInterest({ programmeId, email });
  if (wantsJson) {
    ctx.response.type = "application/json";
    ctx.response.body = { ok: result.ok, message: result.message };
    return;
  }

  const safeMessage = encodeURIComponent(result.message);
  ctx.response.redirect(`/programmes/${programmeId}?message=${safeMessage}`);
}
