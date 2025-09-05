import { worker } from "./worker/main.ts";

Deno.serve(worker.fetch);
