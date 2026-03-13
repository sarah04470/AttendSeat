const model = require('./default-room.model');
const { ForbiddenError, BadRequestError, createSuccessResponse } = require('../../helpers/error.helper');

// 기본배정 목록 (비로그인 조회 가능)
exports.getList = async (req, res) => {
  const { grade, class: cls } = req.query;
  const list = await model.getDefaultRoomList({ grade, cls });
  res.json(createSuccessResponse({ list }));
};

// 단일 배정 (중간관리자+)
exports.assign = async (req, res) => {
  if (req.loginUser.auth < 8) throw new ForbiddenError('권한이 없습니다.');

  const { stu_idx, room_idx } = req.body;
  if (!stu_idx || !room_idx) throw new BadRequestError('학생과 장소를 선택해주세요.');

  await model.assignRoom(stu_idx, room_idx);
  res.json(createSuccessResponse(null, '배정되었습니다.'));
};

// 일괄 배정 (중간관리자+)
exports.bulkAssign = async (req, res) => {
  if (req.loginUser.auth < 8) throw new ForbiddenError('권한이 없습니다.');

  const { assignments } = req.body;
  if (!assignments || !Array.isArray(assignments) || assignments.length === 0) {
    throw new BadRequestError('배정 데이터가 필요합니다.');
  }

  const count = await model.bulkAssign(assignments);
  res.json(createSuccessResponse({ count }, `${count}명 배정 완료`));
};

// 배정 삭제 (중간관리자+)
exports.removeAssignment = async (req, res) => {
  if (req.loginUser.auth < 8) throw new ForbiddenError('권한이 없습니다.');
  await model.removeAssignment(req.params.stu_idx);
  res.json(createSuccessResponse(null, '배정이 해제되었습니다.'));
};
