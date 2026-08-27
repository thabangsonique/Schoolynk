import { Router } from "express";

import { authenticatedUser } from "../middlewares/authMiddleware/authMiddleware.js";
import { requireRole } from "../middlewares/authMiddleware/requireRole.js";
import {
  learnerAttendance,
  staffOverview,
  weeklyLearnerAttendance,
} from "../controllers/adminAttendanceController.js";

const router = Router();

//ADMIN
router.get("/staff-overview", authenticatedUser, staffOverview);
router.get("/learners-overview", authenticatedUser, learnerAttendance);
router.get(
  "/weekly-learner-attendance",
  authenticatedUser,
  requireRole("admin"),
  weeklyLearnerAttendance,
);
export default router;
