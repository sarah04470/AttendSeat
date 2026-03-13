const express = require('express');
const router = express.Router();
const controller = require('./students.controller');
const { asyncHandler } = require('../../helpers/error.helper');

// 비로그인 - 조회
router.get('/list', asyncHandler(controller.getStudentList));
router.get('/detail/:idx', asyncHandler(controller.getStudentDetail));

// 중간관리자(8) 이상 - 수정
router.post('/register', asyncHandler(controller.registerStudent));
router.put('/update/:idx', asyncHandler(controller.updateStudent));
router.delete('/delete/:idx', asyncHandler(controller.deleteStudent));

// 슈퍼관리자(10) - 일괄 등록
router.post('/bulk-register', asyncHandler(controller.bulkRegisterStudents));

module.exports = router;
