import app from "./app";
import { PORT } from "./config/env";

const start = async () => {
  try {
    await app.listen({ port: Number(PORT), host: "0.0.0.0" });
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
