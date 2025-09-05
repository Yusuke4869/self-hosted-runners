import type {
  ResourceStatus,
  ResourceThreshold,
} from "../../common/type/resource.ts";
import { getCpuUsage } from "../service/cpu.ts";
import { getMemoryUsage } from "../service/memory.ts";

const getDefaultThreshold = (): ResourceThreshold => ({
  cpu: parseFloat(Deno.env.get("RESOURCE_CPU_THRESHOLD") ?? "75"),
  memory: parseFloat(Deno.env.get("RESOURCE_MEMORY_THRESHOLD") ?? "75"),
});

const getResourceUsage = async () =>
  await Promise.all([getCpuUsage(), getMemoryUsage()]);

const isResourceAvailable = (
  cpuUsage: number | null,
  memoryUsage: number | null,
  threshold: ResourceThreshold,
): boolean => {
  if (cpuUsage === null || memoryUsage === null) return false;

  return cpuUsage <= threshold.cpu && memoryUsage <= threshold.memory;
};

export const getResourceAvailability = async (): Promise<boolean> => {
  const [cpu, memory] = await getResourceUsage();
  const threshold = getDefaultThreshold();

  return isResourceAvailable(cpu, memory, threshold);
};

export const checkResourceAvailability = async (): Promise<ResourceStatus> => {
  const [cpu, memory] = await getResourceUsage();
  const threshold = getDefaultThreshold();
  const available = isResourceAvailable(cpu, memory, threshold);

  return {
    usage: {
      cpu,
      memory,
    },
    threshold,
    available,
  };
};
