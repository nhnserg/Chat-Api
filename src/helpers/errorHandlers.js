export const notFoundHandler = (_, res, next) => {
  res.status(404).json({ message: 'Not found' });
  next();
};

export const errorHandler = (error, _, res, next) => {
  const { status = 500, message = 'Server error' } = error;

  res.status(status).json({ message });
  next();
};
