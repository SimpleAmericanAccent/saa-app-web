// Wraps any async route handler in a try-catch to prevent server crashes
function safeRoute(handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (err) {
      console.error("❌ Uncaught Route Error:", err);
      next(err); // Pass error to Express global error handler
    }
  };
}

// Custom method handler that wraps all handlers in safeRoute
export function wrapMethodsWithSafeRoute(router) {
  const methods = ["get", "post", "put", "patch", "delete", "all"];

  methods.forEach((method) => {
    const original = router[method];
    router[method] = function (path, ...handlers) {
      // Wrap every handler inside `safeRoute`
      original.call(router, path, ...handlers.map(safeRoute));
    };
  });
}
