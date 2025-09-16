import Fastify from "fastify";

// Create Fastify instance
const app = Fastify({
  logger: true, // Enable logging
});

// Health check route
app.get("/health", async () => {
  return { status: "ok", message: "Fastify server running 🚀" };
});

export default app;
