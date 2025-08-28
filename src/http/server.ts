import "dotenv/config";
import express from "express";
import cors from "cors";

import { userRoutes } from "../modules/user/routes.js";
import { errorsMiddleware } from "./middleware/errors.js";

const app = express();
const PORT = Number(process.env.PORT) || 8080;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/ping", (req, res) => {
  res.sendStatus(200);
});

app.use("/user", userRoutes);

app.use(errorsMiddleware);

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT} 🚀`);
});
