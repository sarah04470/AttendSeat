const express = require('express');
const router = express.Router();
const controller = require('./rooms.controller');
const { asyncHandler } = require('../../helpers/error.helper');

// 비로그인 - 조회
router.get('/list', asyncHandler(controller.getRoomList));
router.get('/detail/:idx', asyncHandler(controller.getRoomDetail));

// 슈퍼관리자(10) - CRUD
router.post('/create', asyncHandler(controller.createRoom));
router.put('/update/:idx', asyncHandler(controller.updateRoom));
router.delete('/delete/:idx', asyncHandler(controller.deleteRoom));
router.post('/bulk-create', asyncHandler(controller.bulkCreateRooms));

module.exports = router;
