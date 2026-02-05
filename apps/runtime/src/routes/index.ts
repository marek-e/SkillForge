import { Hono } from "hono";
import { healthRoutes } from "./health";
import { agentRoutes } from "./agents";
import { skillRoutes } from "./skills";

export const routes = new Hono();

routes.route("/health", healthRoutes);
routes.route("/agents", agentRoutes);
routes.route("/skills", skillRoutes);
