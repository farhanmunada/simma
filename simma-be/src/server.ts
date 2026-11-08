import { getEnv } from "./core/config/env.js";
import { buildApp } from "./app.js";
import { closeDb } from "./core/database/index.js";

async function main() {
  const env = getEnv();
  const app = await buildApp();

  try {
    await app.listen({ port: env.PORT, host: env.HOST });
  } catch (err) {
    app.log.error(err);
    await closeDb();
    process.exit(1);
  }

  // Graceful shutdown
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, async () => {
      app.log.info(`Received ${signal}, shutting down...`);
      await app.close();
      await closeDb();
      process.exit(0);
    });
  }
}

main();
