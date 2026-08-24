import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import teacherRoutes from "../src/routes/teacherRoutes.js";
import authRoutes from "../src/routes/authRoutes.js";
import learnerRoutes from "../src/routes/learnerRoutes.js";
import classRoutes from "../src/routes/classRoutes.js";
import subjectsRoutes from "../src/routes/subjectsRoutes.js";
import learnerAttendanceRoutes from "../src/routes/learnerAttendanceRoutes.js";
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

const port = process.env.PORT;

//check api health.
app.get("api/health", (req, res) => {
  res.json({ success: true, message: "school management api is running" });
});

app.listen(port, () => {
  console.log(`SERVER IS RUNNING ON PORT, ${port}`);
});
