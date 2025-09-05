const getMemoryUsageMacOS = async (): Promise<number | null> => {
  try {
    const command = new Deno.Command("sh", {
      args: [
        "-c",
        "memory_pressure -Q | awk 'NR==2{printf \"%.2f\\n\", 100 - $NF}'",
      ],
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stdout } = await command.output();
    if (code !== 0) return null;

    const output = new TextDecoder().decode(stdout).trim();
    const memoryUsage = parseFloat(output);

    return isNaN(memoryUsage) ? null : memoryUsage;
  } catch (error) {
    console.error("Error getting memory usage (macOS):", error);
    return null;
  }
};

const getMemoryUsageUbuntu = async (): Promise<number | null> => {
  try {
    const command = new Deno.Command("sh", {
      args: [
        "-c",
        "free | grep Mem | awk '{printf \"%.2f\", (($2-$7)/$2) * 100.0}'",
      ],
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stdout } = await command.output();
    if (code !== 0) return null;

    const output = new TextDecoder().decode(stdout).trim();
    const memoryUsage = parseFloat(output);

    return isNaN(memoryUsage) ? null : memoryUsage;
  } catch (error) {
    console.error("Error getting memory usage (Linux):", error);
    return null;
  }
};

export const getMemoryUsage = async (): Promise<number | null> => {
  try {
    switch (Deno.build.os) {
      case "darwin":
        return await getMemoryUsageMacOS();
      // for ubuntu
      case "linux":
        return await getMemoryUsageUbuntu();
      default:
        console.warn(`Unsupported OS: ${Deno.build.os}`);
        return null;
    }
  } catch (error) {
    console.error("Failed to get memory usage:", error);
    return null;
  }
};
