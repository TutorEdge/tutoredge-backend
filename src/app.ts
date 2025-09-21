import Fastify from "fastify";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";

const app = Fastify({ logger: true });

// DB connection
connectDB();

// Routes
app.register(async (instance) => {
  instance.register(authRoutes);
  instance.register(userRoutes);

  instance.get("/health", async () => {
    return { status: "ok" };
  });
}, { prefix: "/v1" });

export default app;
