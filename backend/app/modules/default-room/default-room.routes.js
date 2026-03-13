const express = require('express');
const router = express.Router();
const controller = require('./default-room.controller');
const { asyncHandler } = require('../../helpers/error.helper');

router.get('/list', asyncHandler(controller.getList));
router.post('/assign', asyncHandler(controller.assign));
router.post('/bulk-assign', asyncHandler(controller.bulkAssign));
router.delete('/remove/:stu_idx', asyncHandler(controller.removeAssignment));

module.exports = router;
