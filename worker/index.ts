import { Hono } from "hono";

import { apiCors } from "./cors";
import { methodNotAllowed } from "./method-not-allowed";
import { onSvgGet, onSvgHead, onSvgOptions } from "./svg";

const app = new Hono<{ Bindings: Env }>();

app.use("/svg", apiCors);
app.use("/svg", methodNotAllowed({ methods: ["GET", "HEAD", "OPTIONS"] }));

app.on("GET", "/svg", onSvgGet);
app.on("HEAD", "/svg", onSvgHead);
app.on("OPTIONS", "/svg", onSvgOptions);

export default app;
