"use strict";

const jwt = require('jsonwebtoken');
const moment = require('moment-timezone');

const getKoreanTime = () => {
  return moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
};

const createAccessToken = (payload) => {
  return jwt.sign(
    { id: payload.id, auth: payload.auth, name: payload.name, type: 'access' },
    appConfig.secretKey,
    { expiresIn: appConfig.jwt.accessTokenExpire, issuer: 'attend-seat' }
  );
};

const createRefreshToken = (payload) => {
  return jwt.sign(
    { id: payload.id, type: 'refresh' },
    appConfig.secretKey,
    { expiresIn: appConfig.jwt.refreshTokenExpire, issuer: 'attend-seat' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, appConfig.secretKey);
  } catch (error) {
    if (error.name === 'TokenExpiredError') return { error: 'TOKEN_EXPIRED', message: '토큰이 만료되었습니다.' };
    if (error.name === 'JsonWebTokenError') return { error: 'INVALID_TOKEN', message: '유효하지 않은 토큰입니다.' };
    return { error: 'TOKEN_ERROR', message: '토큰 검증에 실패했습니다.' };
  }
};

global.createAccessToken = createAccessToken;
global.createRefreshToken = createRefreshToken;
global.verifyToken = verifyToken;

module.exports = { createAccessToken, createRefreshToken, verifyToken, getKoreanTime };
