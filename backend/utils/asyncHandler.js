// utils/asyncHandler.js — Eliminates try/catch boilerplate in every controller
// Wraps an async function and forwards any rejected promise to Express's next(err)
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
