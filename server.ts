import express from "express";
const app = express();
const port = 3000;

app.get("/", (_, res) => {
  res.send("Hello World!, He He");
});

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}`);
});
