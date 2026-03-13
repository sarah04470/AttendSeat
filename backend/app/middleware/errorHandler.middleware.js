"use strict";

const { logError, createErrorResponse, NotFoundError } = require('../helpers/error.helper');

const errorHandler = async (error, req, res, next) => {
  await logError(error, req);
  let statusCode = error.statusCode || 500;
  let message = error.message || '서버 내부 오류가 발생했습니다.';
  let errorCode = error.errorCode || 'INTERNAL_SERVER_ERROR';

  const errorResponse = createErrorResponse({ ...error, statusCode, message, errorCode });

  if (isDev) {
    errorResponse.error.details = {
      name: error.name, url: req.originalUrl, method: req.method
    };
  }

  res.status(statusCode).json(errorResponse);
};

const notFoundHandler = (req, res, next) => {
  next(new NotFoundError(`경로 ${req.originalUrl}을(를) 찾을 수 없습니다.`));
};

const setupErrorHandling = (app) => {
  app.use(notFoundHandler);
  app.use(errorHandler);
};

module.exports = { errorHandler, notFoundHandler, setupErrorHandling };
