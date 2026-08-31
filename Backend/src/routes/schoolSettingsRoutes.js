import { Router } from "express";
import { authenticatedUser } from "../middlewares/authMiddleware/authMiddleware.js";
import { requireRole } from "../middlewares/authMiddleware/requireRole.js";
import {
  getSchoolSettings,
  updateNotificationsEnabled,
} from "../controllers/schoolSettingsController.js";

const router = Router();

router.get(
  "/school-settings",
  authenticatedUser,
  requireRole("admin"),
  getSchoolSettings,
);
router.patch(
  "/school-settings/notifications",
  authenticatedUser,
  requireRole("admin"),
  updateNotificationsEnabled,
);

export default router;
