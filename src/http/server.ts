import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const PORT = Number(process.env.PORT) || 8080;

app.get("/ping", (request, response) => {
  return response.sendStatus(200);
});

app.listen(PORT, () => console.log(`Server running on PORT ${PORT} 🚀`));
