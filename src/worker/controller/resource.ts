import type { Context } from "hono";
import { checkResourceAvailability } from "../usecase/resource.ts";

export const getResourceController = async (c: Context) => {
  try {
    const resourceStatus = await checkResourceAvailability();

    return c.json({
      status: "success",
      data: resourceStatus,
    });
  } catch (error) {
    console.error("Failed to get resource status:", error);

    return c.json({
      status: "error",
      message: "Failed to retrieve resource status",
    }, 500);
  }
};
