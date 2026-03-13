const model = require('./rooms.model');
const { BadRequestError, ForbiddenError, NotFoundError, createSuccessResponse } = require('../../helpers/error.helper');

// 장소 목록 (비로그인 가능)
exports.getRoomList = async (req, res) => {
  const { type } = req.query;
  const list = await model.getRoomList({ type });
  res.json(createSuccessResponse({ list }));
};

// 장소 상세 (비로그인 가능)
exports.getRoomDetail = async (req, res) => {
  const room = await model.getRoomByIdx(req.params.idx);
  if (!room) throw new NotFoundError('장소를 찾을 수 없습니다.');
  res.json(createSuccessResponse(room));
};

// 장소 등록 (슈퍼관리자)
exports.createRoom = async (req, res) => {
  if (req.loginUser.auth < 8) throw new ForbiddenError('권한이 없습니다.');

  const { room_name, room_type } = req.body;
  if (!room_name) throw new BadRequestError('장소명을 입력해주세요.');

  const idx = await model.createRoom({
    room_name,
    room_floor: req.body.room_floor || null,
    room_type: room_type || 'practice',
    room_capacity: req.body.room_capacity || null,
    room_status: 'Y',
  });

  res.json(createSuccessResponse({ room_idx: idx }, '장소가 등록되었습니다.'));
};

// 장소 수정 (슈퍼관리자)
exports.updateRoom = async (req, res) => {
  if (req.loginUser.auth < 8) throw new ForbiddenError('권한이 없습니다.');

  const room = await model.getRoomByIdx(req.params.idx);
  if (!room) throw new NotFoundError('장소를 찾을 수 없습니다.');

  const data = { ...req.body };
  delete data.room_idx;
  await model.updateRoom(req.params.idx, data);
  res.json(createSuccessResponse(null, '장소 정보가 수정되었습니다.'));
};

// 장소 삭제 (슈퍼관리자)
exports.deleteRoom = async (req, res) => {
  if (req.loginUser.auth < 8) throw new ForbiddenError('권한이 없습니다.');
  await model.deleteRoom(req.params.idx);
  res.json(createSuccessResponse(null, '장소가 삭제되었습니다.'));
};

// 일괄 등록 (슈퍼관리자)
exports.bulkCreateRooms = async (req, res) => {
  if (req.loginUser.auth < 8) throw new ForbiddenError('권한이 없습니다.');

  const { rooms } = req.body;
  if (!rooms || !Array.isArray(rooms) || rooms.length === 0) {
    throw new BadRequestError('장소 데이터가 필요합니다.');
  }

  const count = await model.bulkCreateRooms(rooms);
  res.json(createSuccessResponse({ count }, `${count}개의 장소가 등록되었습니다.`));
};
