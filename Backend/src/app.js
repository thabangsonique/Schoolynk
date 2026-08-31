import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import teacherRoutes from "./routes/teacherRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import learnerRoutes from "./routes/learnerRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import subjectsRoutes from "./routes/subjectsRoutes.js";
import learnerAttendanceRoutes from "./routes/learnerAttendanceRoutes.js";
import adminAttendanceRoutes from "./routes/adminAttendanceRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import schoolSettingsRoutes from "./routes/schoolSettingsRoutes.js";

dotenv.config();
const app = express();

//MIDDLEWARES
app.use(express.json());
app.use(cors());

//ROUTES
app.use("/api", teacherRoutes);
app.use("/api", authRoutes);
app.use("/api", learnerRoutes);
app.use("/api", classRoutes);
app.use("/api", subjectsRoutes);
app.use("/api", learnerAttendanceRoutes);
app.use("/api", adminAttendanceRoutes);
app.use("/api", activityRoutes);
app.use("/api", schoolSettingsRoutes);

//check api health.
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "school management api is running" });
});

export default app;
