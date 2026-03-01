import { worker } from "./worker/main.ts";
import { startJobProcessor } from "./worker/usecase/job.ts";

startJobProcessor();
Deno.serve(worker.fetch);
