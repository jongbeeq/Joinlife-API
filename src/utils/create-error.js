const createError = (message, statusCode) => {
  const error = {}
  if (typeof (message) === "String") {
    error = new Error(message);
  }
  error.message = message
  error.statusCode = statusCode;
  return error;
};

module.exports = createError;
