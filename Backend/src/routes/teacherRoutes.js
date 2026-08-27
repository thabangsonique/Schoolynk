import { Router } from "express";
import {
  createTeacher,
  deleteTeacher,
  getMyClasses,
  getMyLearners,
  getTeacherById,
  getTeachers,
  insertAvater,
  updateTeacherById,
} from "../controllers/teachersController.js";
import { authenticatedUser } from "../middlewares/authMiddleware/authMiddleware.js";
import { requireRole } from "../middlewares/authMiddleware/requireRole.js";
import { LogIn, signUpAdmin } from "../controllers/authController.js";
import {
  clockIn,
  clockOut,
  viewMyAttendance,
} from "../controllers/staffAttendanceController.js";

const router = Router();

//ADMIN ROUTES
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

//TEACHER ROUTES.
router.get("/get-my-learners", authenticatedUser, getMyLearners);
router.get("/my-classes", authenticatedUser, getMyClasses);
router.post("/clock-in", authenticatedUser, clockIn);
router.post("/clock-out", authenticatedUser, clockOut);
router.get("/my-attendance", authenticatedUser, viewMyAttendance);
router.post("/avatar", authenticatedUser, insertAvater);

//
export default router;
