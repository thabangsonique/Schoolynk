import { Router } from "express";

import { authenticatedUser } from "../middlewares/authMiddleware/authMiddleware.js";
import { requireRole } from "../middlewares/authMiddleware/requireRole.js";
import { createLearner } from "../controllers/learnersController.js";

const router = Router();

router.post(
  "/learners",
  authenticatedUser,
  requireRole("admin"),
  createLearner,
);

export default router;
