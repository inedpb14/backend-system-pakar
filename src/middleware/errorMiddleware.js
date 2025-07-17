// Middleware untuk menangani rute yang tidak ditemukan
const notFound = (req, res, next) => {
  const error = new Error(`Rute ${req.originalUrl} tidak ditemukan`);
  res.status(404);
  next(error);
};

// Middleware untuk menangani error secara global
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export { notFound, errorHandler };
