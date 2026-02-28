import { cors } from "hono/cors";

export const apiCors = cors({
  origin: "*",
  allowMethods: ["GET", "HEAD", "OPTIONS"],
  exposeHeaders: ["location"],
  maxAge: 86400,
});
