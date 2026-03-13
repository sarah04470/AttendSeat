const {asyncHandler} = require("../../helpers/error.helper");
const router = require('express').Router()
const controller = loadModule('members', 'controller');

// 인증 API
router.post('/auth/login', asyncHandler(controller.login));
router.post('/auth/refresh', asyncHandler(controller.refreshToken));
router.get('/auth/me', asyncHandler(controller.getMe));
router.post('/auth/logout', asyncHandler(controller.logout));

// 관리자 API (로그인 필요)
router.get('/list', asyncHandler(controller.getMemberList));
router.post('/register', asyncHandler(controller.register));
router.put('/password', asyncHandler(controller.changePassword));
router.get('/:id', asyncHandler(controller.getMemberDetail));

module.exports = router
