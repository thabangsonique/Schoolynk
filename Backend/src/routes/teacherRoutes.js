import { Router } from "express";
import {
  createTeacher,
  deleteTeacher,
  getTeacherById,
  getTeachers,
  updateTeacherById,
} from "../controllers/teachersController.js";
import { authenticatedUser } from "../middlewares/authMiddleware/authMiddleware.js";
import { requireRole } from "../middlewares/authMiddleware/requireRole.js";
import { LogIn, signUpAdmin } from "../controllers/authController.js";

const router = Router();

router.post(
  "/teachers",
  authenticatedUser,
  requireRole("admin"),
  createTeacher,
);
router.get("/teachers", authenticatedUser, requireRole("admin"), getTeachers);
router.patch(
  "/teachers/:id",
  authenticatedUser,
  requireRole("admin"),
  updateTeacherById,
);
router.get(
  "/teachers/:id",
  authenticatedUser,
  requireRole("admin"),
  getTeacherById,
);
router.delete(
  "/teachers/:id",
  authenticatedUser,
  requireRole("admin"),
  deleteTeacher,
);
export default router;
