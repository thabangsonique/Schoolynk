import { Router } from "express";

import { authenticatedUser } from "../middlewares/authMiddleware/authMiddleware.js";
import { requireRole } from "../middlewares/authMiddleware/requireRole.js";
import {
  learnerAttendance,
  staffOverview,
} from "../controllers/adminAttendanceController.js";

const router = Router();

//ADMIN
router.get("/staff-overview", authenticatedUser, staffOverview);
router.get("/learners-overview", authenticatedUser, learnerAttendance);

export default router;
