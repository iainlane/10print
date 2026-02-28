import { createMiddleware } from "hono/factory";
import { StatusCodes } from "http-status-codes";

const { METHOD_NOT_ALLOWED } = StatusCodes;

type MethodNotAllowedOptions = {
  methods: string[];
};

/**
 * Return a 405 for methods outside the allowed set on the matched route.
 */
export function methodNotAllowed(options: MethodNotAllowedOptions) {
  const methods = options.methods.map((method) => method.toUpperCase());
  const allowHeader = methods.join(", ");

  return createMiddleware(async (c, next) => {
    const currentMethod = c.req.method.toUpperCase();

    if (!methods.includes(currentMethod)) {
      c.header("Allow", allowHeader);
      return c.text("Method Not Allowed", METHOD_NOT_ALLOWED);
    }

    await next();
  });
}
