import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { routes } from "./routes";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:4320"],
    allowMethods: ["GET", "POST", "PUT", "DELETE"],
  })
);

app.route("/api", routes);

app.get("/", (c) => c.redirect("/api/health"));

const PORT = process.env.PORT || 4321;

console.log(`SkillForge Runtime starting on http://localhost:${PORT}`);

serve({
  fetch: app.fetch,
  port: Number(PORT),
});
