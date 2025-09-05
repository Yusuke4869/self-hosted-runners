import { Hono } from "hono";
import { getResourceController } from "../controller/resource.ts";

export const resourceRouter = new Hono()
  .get("/", getResourceController);
