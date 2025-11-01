import fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import authRoutes from "./routes/auth.routes";
import parentRoutes from "./routes/parent.routes";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import path from "path";
import tutorRoutes from "./routes/tutor.routes";
import cors from "@fastify/cors";

const app = fastify({ logger: true });

async function buildApp() {
    // Register CORS
  await app.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Swagger setup
  await app.register(swagger, {
    openapi: {
      info: {
        title: "TutorEdge API",
        description: "API documentation for TutorEdge platform",
        version: "1.0.0"
      },
      servers: [
        { url: "http://localhost:3000/api/v1", description: "Development" },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
          }
        }
      },
      security: [{ bearerAuth: [] }]
    }
  });

  await app.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: true
    }
  });

  await app.register(multipart, {
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// app.register(fastifyStatic, {
//   root: path.join(process.cwd(), "uploads"),
//   prefix: "/uploads/",
//   decorateReply: false
// });

  // Routes
  app.register(authRoutes, { prefix: "/api/v1" });
  app.register(parentRoutes, { prefix: "/api/v1" });
  app.register(tutorRoutes, { prefix: "/api/v1" });

  return app;
}

export default buildApp;
