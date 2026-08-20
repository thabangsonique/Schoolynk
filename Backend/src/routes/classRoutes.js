import { Router } from "express";

import { authenticatedUser } from "../middlewares/authMiddleware/authMiddleware.js";
import { requireRole } from "../middlewares/authMiddleware/requireRole.js";
import {} from "../controllers/learnersController.js";
import { createClass } from "../controllers/classController.js";

const router = Router();

router.post("/classes", authenticatedUser, requireRole("admin"), createClass);

export default router;
