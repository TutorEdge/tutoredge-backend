import dotenv from "dotenv";

dotenv.config();

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

export const config = {
  PORT: parseInt(getEnv("PORT")),
  MONGO_URI: getEnv("MONGO_URI"),
  JWT_SECRET: getEnv("JWT_SECRET"),
  ADMIN_USERNAME: getEnv("ADMIN_USERNAME"),
  ADMIN_PASSWORD: getEnv("ADMIN_PASSWORD")
};
