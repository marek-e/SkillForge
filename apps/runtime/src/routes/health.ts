import { Hono } from "hono";
import type { HealthResponse } from "@skillforge/core";

export const healthRoutes = new Hono();

healthRoutes.get("/", (c) => {
  const response: HealthResponse = {
    status: "ok",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  };
  return c.json(response);
});
