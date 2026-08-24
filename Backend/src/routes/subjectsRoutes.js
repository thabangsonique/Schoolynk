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

const router = Router();

//ADMIN
router.get(
  "/subjects",
  authenticatedUser,
  requireRole("admin"),
  getAllSubjects,
);

router.post(
  "/subjects",
  authenticatedUser,
  requireRole("admin"),
  createSubject,
);
router.patch(
  "/subjects/:id",
  authenticatedUser,
  requireRole("admin"),
  updateSubject,
);
router.delete(
  "/subjects/:id",
  authenticatedUser,
  requireRole("admin"),
  deleteSubject,
);
export default router;
