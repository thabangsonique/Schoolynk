import { Router } from "express";

import { authenticatedUser } from "../middlewares/authMiddleware/authMiddleware.js";
import { requireRole } from "../middlewares/authMiddleware/requireRole.js";
import { LogIn, signUpAdmin } from "../controllers/authController.js";

const router = Router();

router.post("/signup-admin", signUpAdmin);
router.post("/login", LogIn);

export default router;
