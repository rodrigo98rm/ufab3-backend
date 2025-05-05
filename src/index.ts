import cors from "cors";
import express, { json } from "express";
const app = express();
const port = process.env.PORT ?? "9001";

import routes from "./routes/index";

app.use(json());

app.use(cors());

app.use("/", routes);

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
