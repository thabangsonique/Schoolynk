import { Router } from "express";

import { authenticatedUser } from "../middlewares/authMiddleware/authMiddleware.js";
import { requireRole } from "../middlewares/authMiddleware/requireRole.js";

import { getRecentActivities } from "../controllers/activitiesController.js";

const router = Router();

//ADMIN
router.get("/recent", authenticatedUser, getRecentActivities);

export default router;
