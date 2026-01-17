import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"] || "postgresql://postgres.tmxkdwwdiftcldhsxubd:%23041294%23Gfr%23@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
  },
});
