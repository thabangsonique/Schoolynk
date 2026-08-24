import { Router } from "express";

import { authenticatedUser } from "../middlewares/authMiddleware/authMiddleware.js";
import { requireRole } from "../middlewares/authMiddleware/requireRole.js";
import {} from "../controllers/learnersController.js";
import {
  createSubject,
  deleteSubject,
  getAllSubjects,
  updateSubject,
} from "../controllers/subjectsController.js";
import {
  bulkMarkAttendance,
  getTodayAttendance,
  markLearnerAttendance,
  submitDailyAttendance,
} from "../controllers/learnerAttendanceController.js";

const router = Router();

//ADMIN
router.post("/learner-attendance", authenticatedUser, markLearnerAttendance);
router.post("/learner-bulk-attendance", authenticatedUser, bulkMarkAttendance);
router.get("/learner-attendance", authenticatedUser, getTodayAttendance);
router.post("/submit-register", authenticatedUser, submitDailyAttendance);
export default router;
