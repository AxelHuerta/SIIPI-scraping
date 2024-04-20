import express from "express";
import { login } from "./controllers/UserController";

const app = express();
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

app.post("/users/login", async (req, res) => {
  const { username, password } = req.body;

  res.send(await login(username, password));
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
