import { Router } from "express";

import { authenticatedUser } from "../middlewares/authMiddleware/authMiddleware.js";
import { requireRole } from "../middlewares/authMiddleware/requireRole.js";
import {} from "../controllers/learnersController.js";
import {
  createClass,
  deleteClass,
  getAllClasses,
  getClassroomOverview,
  updateClass,
} from "../controllers/classController.js";

const router = Router();

//ADMIN
router.post("/classes", authenticatedUser, requireRole("admin"), createClass);
router.get("/classes", authenticatedUser, requireRole("admin"), getAllClasses);
router.get(
  "/classes-overview",
  authenticatedUser,
  requireRole("admin"),
  getClassroomOverview,
);
router.patch(
  "/classes/:id",
  authenticatedUser,
  requireRole("admin"),
  updateClass,
);

router.delete(
  "/classes/:id",
  authenticatedUser,
  requireRole("admin"),
  deleteClass,
);
export default router;
