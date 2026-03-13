"use strict";

const getKoreanTimeISOString = () => {
  const now = new Date();
  const koreanTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  return koreanTime.toISOString();
};

class CustomError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.timestamp = getKoreanTimeISOString();
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends CustomError {
  constructor(message = '잘못된 요청입니다.', errorCode = 'BAD_REQUEST') { super(message, 400, errorCode); }
}
class UnauthorizedError extends CustomError {
  constructor(message = '인증이 필요합니다.', errorCode = 'UNAUTHORIZED') { super(message, 401, errorCode); }
}
class ForbiddenError extends CustomError {
  constructor(message = '접근 권한이 없습니다.', errorCode = 'FORBIDDEN') { super(message, 403, errorCode); }
}
class NotFoundError extends CustomError {
  constructor(message = '요청한 리소스를 찾을 수 없습니다.', errorCode = 'NOT_FOUND') { super(message, 404, errorCode); }
}
class ConflictError extends CustomError {
  constructor(message = '리소스 충돌이 발생했습니다.', errorCode = 'CONFLICT') { super(message, 409, errorCode); }
}
class ValidationError extends CustomError {
  constructor(message = '입력 데이터가 유효하지 않습니다.', errorCode = 'VALIDATION_ERROR') { super(message, 422, errorCode); }
}
class TooManyRequestsError extends CustomError {
  constructor(message = '요청이 너무 많습니다.', errorCode = 'TOO_MANY_REQUESTS') { super(message, 429, errorCode); }
}
class InternalServerError extends CustomError {
  constructor(message = '서버 내부 오류가 발생했습니다.', errorCode = 'INTERNAL_SERVER_ERROR') { super(message, 500, errorCode); }
}
class ServiceUnavailableError extends CustomError {
  constructor(message = '서비스가 일시적으로 사용할 수 없습니다.', errorCode = 'SERVICE_UNAVAILABLE') { super(message, 503, errorCode); }
}

const createErrorResponse = (error) => {
  const response = {
    success: false,
    error: {
      message: error.message,
      code: error.errorCode || 'UNKNOWN_ERROR',
      timestamp: error.timestamp || getKoreanTimeISOString()
    }
  };
  if (isDev && error.stack) response.error.stack = error.stack;
  if (error.data) response.error.data = error.data;
  return response;
};

const createSuccessResponse = (data, message = '성공적으로 처리되었습니다.') => {
  return { success: true, message, data, timestamp: getKoreanTimeISOString() };
};

const logError = async (error, req = null) => {
  let clientIp = req ? (req.header("x-forwarded-for") || req.header('x-real-ip') || req.header('cf-connecting-ip') || req.socket.remoteAddress) : null;
  const ip = clientIp ? ip2long(clientIp) : null;
  const errorInfo = {
    message: error.message, stack: error.stack, statusCode: error.statusCode || 500,
    errorCode: error.errorCode || 'UNKNOWN_ERROR', timestamp: getKoreanTimeISOString(),
    url: req ? req.originalUrl : null, method: req ? req.method : null, ip: ip ? ip : null,
    userId: req && req.loginUser && req.loginUser.id ? req.loginUser.id : null
  };
  console.error('=== 에러 발생 ===');
  console.error('메시지:', errorInfo.message);
  console.error('URL:', errorInfo.url);
  console.error('스택:', errorInfo.stack);
  console.error('================');
  if (!isDev && req) {
    try { await addLog('ERROR', JSON.stringify(errorInfo), errorInfo.userId, errorInfo.ip); }
    catch (logError) { console.error('에러 로그 저장 실패:', logError); }
  }
};

const asyncHandler = (fn) => {
  return (req, res, next) => { Promise.resolve(fn(req, res, next)).catch(next); };
};

const syncHandler = (fn) => {
  return (req, res, next) => { try { fn(req, res, next); } catch (error) { next(error); } };
};

// 글로벌 등록
global.CustomError = CustomError;
global.BadRequestError = BadRequestError;
global.UnauthorizedError = UnauthorizedError;
global.ForbiddenError = ForbiddenError;
global.NotFoundError = NotFoundError;
global.ConflictError = ConflictError;
global.ValidationError = ValidationError;
global.TooManyRequestsError = TooManyRequestsError;
global.InternalServerError = InternalServerError;
global.ServiceUnavailableError = ServiceUnavailableError;
global.createErrorResponse = createErrorResponse;
global.createSuccessResponse = createSuccessResponse;
global.logError = logError;
global.asyncHandler = asyncHandler;
global.syncHandler = syncHandler;

module.exports = {
  CustomError, BadRequestError, UnauthorizedError, ForbiddenError,
  NotFoundError, ConflictError, ValidationError, TooManyRequestsError,
  InternalServerError, ServiceUnavailableError,
  createErrorResponse, createSuccessResponse, logError,
  asyncHandler, syncHandler, getKoreanTimeISOString
};
