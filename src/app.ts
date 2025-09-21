import Fastify from "fastify";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";

const app = Fastify({ logger: true });

// DB connection
connectDB();

// Swagger setup
app.register(swagger, {
  swagger: {
    info: {
      title: "Fastify API",
      description: "API documentation for Auth + User Service",
      version: "1.0.0",
    },
    host: "localhost:3000",
    schemes: ["http"],
    consumes: ["application/json"],
    produces: ["application/json"],
    securityDefinitions: {
      bearerAuth: {
        type: "apiKey",
        name: "Authorization",
        in: "header",
        description: "Enter JWT token as: Bearer <token>",
      },
    },
  },
});

app.register(swaggerUi, {
  routePrefix: "/docs",
  uiConfig: {
    docExpansion: "list",
    deepLinking: false,
  },
});

// Routes
app.register(async (instance) => {
  instance.register(authRoutes);
  instance.register(userRoutes);

  instance.get("/health", async () => {
    return { status: "ok" };
  });
}, { prefix: "/v1" });

export default app;
