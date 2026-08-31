
import { Router } from "@oak/oak";
import {
  listProgrammesHandler,
  listProgrammesJsonHandler,
  programmeDetailHandler,
  registerInterestHandler,
  withdrawInterestHandler,
} from "../controllers/programmeController.ts";
import { loginHandler, loginPageHandler, logoutHandler } from "../controllers/authController.ts";
import {
  adminDashboardHandler,
  createProgrammeHandler,
  deleteProgrammeHandler,
  deleteInterestHandler,
  exportMailingListHandler,
  toggleProgrammePublishHandler,
} from "../controllers/adminController.ts";
import {
  editProgrammeFormHandler,
  editProgrammePostHandler,
} from "../controllers/programmeEditController.ts";
import { editModulesFormHandler, editModulesPostHandler, deleteModuleHandler } from "../controllers/moduleEditController.ts";
import { requireAuth, requireRole } from "../middleware/authz.ts";
import type { AuthenticatedState } from "../middleware/session.ts";

export const router = new Router<AuthenticatedState>();


router.get("/", (ctx) => {
  ctx.response.redirect("/programmes");
});

router.post(
  "/admin/programmes/:id/modules/edit",
  requireAuth(),
  requireRole(["admin", "editor"]),
  editModulesPostHandler
);
router.get(
  "/admin/programmes/:id/modules/edit",
  requireAuth(),
  requireRole(["admin", "editor"]),
  editModulesFormHandler
);

router.get("/programmes", listProgrammesHandler);
router.get("/api/programmes", listProgrammesJsonHandler);
router.get("/programmes/:id", programmeDetailHandler);
router.post("/interests", registerInterestHandler);
router.post("/interests/withdraw", withdrawInterestHandler);

router.get("/login", loginPageHandler);
router.post("/login", loginHandler);
router.post("/logout", logoutHandler);

router.get("/admin", requireAuth(), requireRole(["admin"]), adminDashboardHandler);
router.get("/editor", requireAuth(), requireRole(["admin", "editor"]), adminDashboardHandler);
router.get("/admin/interests/export", requireAuth(), requireRole(["admin", "editor"]), exportMailingListHandler);
router.post("/admin/interests/:id/delete", requireAuth(), requireRole(["admin", "editor"]), deleteInterestHandler);
router.post("/admin/programmes", requireAuth(), requireRole(["admin"]), createProgrammeHandler);
router.post(
  "/admin/programmes/:id/publish",
  requireAuth(),
  requireRole(["admin", "editor"]),
  toggleProgrammePublishHandler,
);
router.post(
  "/admin/programmes/:id/delete",
  requireAuth(),
  requireRole(["admin"]),
  deleteProgrammeHandler,
);

router.get(
  "/admin/programmes/:id/edit",
  requireAuth(),
  requireRole(["admin", "editor"]),
  editProgrammeFormHandler
);

router.post(
  "/admin/programmes/:id/edit",
  requireAuth(),
  requireRole(["admin", "editor"]),
  editProgrammePostHandler
);

router.post(
  "/admin/programmes/:id/modules/:moduleId/delete",
  requireAuth(),
  requireRole(["admin"]),
  deleteModuleHandler
);
