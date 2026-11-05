// Test multibranch pipeline
import express from "express";
import helmet from "helmet";
import { createContactRouter } from "./routes/contact.js";
import { createHealthRouter } from "./routes/health.js";
import { errorHandler } from "./middlewares/errorHandler.js";

export function createApp({ contactRepository }) {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(express.json({ limit: "10kb" }));

  app.use("/api/health", createHealthRouter());
  app.use("/api/contact", createContactRouter(contactRepository));

  app.use((req, res) => {
    res.status(404).json({ error: "NOT_FOUND" });
  });

  app.use(errorHandler);

  return app;
}
