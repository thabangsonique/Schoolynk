import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();

//MIDDLEWARES
app.use(express.json());
app.use(cors());
//ROUTES

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`SERVER IS RUNNING ON PORT, ${port}`);
});
