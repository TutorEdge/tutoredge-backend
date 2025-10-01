import buildApp from "./app";
import { connectDB } from "./config/db";
import { config } from "./config/env";

const start = async () => {
  try {
    // Connect DB
    await connectDB();

    // Build Fastify app
    const app = await buildApp();

    // Start server
    await app.listen({ port: config.PORT, host: "0.0.0.0" });
    console.log(`🚀 Server running on http://localhost:${config.PORT}`);
    console.log(`📚 Swagger docs available at http://localhost:${config.PORT}/docs`);
  } catch (err) {
    console.error("❌ Failed to start server", err);
    process.exit(1);
  }
};

start();
