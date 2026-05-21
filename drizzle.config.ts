import { defineConfig } from "drizzle-kit";

const DATABASE_URL = process.env.DATABASE_URL || "";
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/models/**/*.ts",
  out: "./drizzle",
  dbCredentials: {
    url: DATABASE_URL,
  },
});
