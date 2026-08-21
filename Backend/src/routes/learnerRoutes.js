import { Router } from "express";

import { authenticatedUser } from "../middlewares/authMiddleware/authMiddleware.js";
import { requireRole } from "../middlewares/authMiddleware/requireRole.js";
import {
  createLearner,
  deleteLearner,
  getLearners,
  updateLearner,
} from "../controllers/learnersController.js";

const router = Router();

router.post(
  "/learners",
  authenticatedUser,
  requireRole("admin"),
  createLearner,
);

router.patch(
  "/learners/:id",
  authenticatedUser,
  requireRole("admin"),
  updateLearner,
);

router.delete(
  "/learners/:id",
  authenticatedUser,
  requireRole("admin"),
  deleteLearner,
);

router.get("/learners", authenticatedUser, requireRole("admin"), getLearners);
export default router;
