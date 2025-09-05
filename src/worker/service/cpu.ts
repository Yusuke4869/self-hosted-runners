const getCpuUsageMacOS = async (): Promise<number | null> => {
  try {
    const command = new Deno.Command("sh", {
      args: [
        "-c",
        "top -l 1 -n 0 | grep 'CPU usage' | awk '{print $3, $5}' | sed 's/%//g'",
      ],
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stdout } = await command.output();
    if (code !== 0) return null;

    const output = new TextDecoder().decode(stdout).trim();
    const values = output.split(" ");
    if (values.length < 2) return null;

    const userUsage = parseFloat(values[0]) || 0;
    const systemUsage = parseFloat(values[1]) || 0;
    const totalUsage = userUsage + systemUsage;

    return Math.round(totalUsage * 100) / 100;
  } catch (error) {
    console.error("Error getting CPU usage (macOS):", error);
    return null;
  }
};

const getCpuUsageUbuntu = async (): Promise<number | null> => {
  try {
    const command = new Deno.Command("sh", {
      args: ["-c", "top -bn1 | grep 'Cpu(s)' | awk '{print $2, $4}'"],
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stdout } = await command.output();
    if (code !== 0) return null;

    const output = new TextDecoder().decode(stdout).trim();
    const values = output.split(" ");
    if (values.length < 2) return null;

    const userUsage = parseFloat(values[0]) || 0;
    const systemUsage = parseFloat(values[1]) || 0;
    const totalUsage = userUsage + systemUsage;

    return Math.round(totalUsage * 100) / 100;
  } catch (error) {
    console.error("Error getting CPU usage (Linux):", error);
    return null;
  }
};

export const getCpuUsage = async (): Promise<number | null> => {
  try {
    switch (Deno.build.os) {
      case "darwin":
        return await getCpuUsageMacOS();
      // for ubuntu
      case "linux":
        return await getCpuUsageUbuntu();
      default:
        console.warn(`Unsupported OS: ${Deno.build.os}`);
        return null;
    }
  } catch (error) {
    console.error("Failed to get CPU usage:", error);
    return null;
  }
};
