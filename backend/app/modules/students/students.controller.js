const model = require('./students.model');
const { BadRequestError, ForbiddenError, NotFoundError, createSuccessResponse } = require('../../helpers/error.helper');

// 학생 목록 (비로그인 가능)
exports.getStudentList = async (req, res) => {
  const { year, grade, class: cls, status, keyword, page = 1, limit = 50 } = req.query;
  const result = await model.getStudentList({ year, grade, class: cls, status, keyword, page: Number(page), limit: Number(limit) });
  res.json(createSuccessResponse(result));
};

// 학생 상세 (비로그인 가능)
exports.getStudentDetail = async (req, res) => {
  const { idx } = req.params;
  const student = await model.getStudentByIdx(idx);
  if (!student) throw new NotFoundError('학생을 찾을 수 없습니다.');
  res.json(createSuccessResponse(student));
};

// 학생 등록 (중간관리자 이상)
exports.registerStudent = async (req, res) => {
  if (req.loginUser.auth < 8) throw new ForbiddenError('권한이 없습니다.');

  const { stu_year, stu_grade, stu_class, stu_number, stu_name } = req.body;
  if (!stu_year || !stu_grade || !stu_class || !stu_number || !stu_name) {
    throw new BadRequestError('필수 항목을 입력해주세요.');
  }

  const data = {
    stu_year, stu_grade, stu_class, stu_number, stu_name,
    stu_gender: req.body.stu_gender || null,
    stu_major: req.body.stu_major || null,
    stu_sub_major: req.body.stu_sub_major || null,
    stu_status: req.body.stu_status || 'Y',
    stu_id: req.body.stu_id || null,
    stu_memo: req.body.stu_memo || null,
    reg_datetime: new Date(),
  };

  const idx = await model.createStudent(data);
  res.json(createSuccessResponse({ stu_idx: idx }, '학생이 등록되었습니다.'));
};

// 학생 수정 (중간관리자 이상)
exports.updateStudent = async (req, res) => {
  if (req.loginUser.auth < 8) throw new ForbiddenError('권한이 없습니다.');

  const { idx } = req.params;
  const student = await model.getStudentByIdx(idx);
  if (!student) throw new NotFoundError('학생을 찾을 수 없습니다.');

  const data = { ...req.body, upd_datetime: new Date() };
  delete data.stu_idx;
  delete data.reg_datetime;

  await model.updateStudent(idx, data);
  res.json(createSuccessResponse(null, '학생 정보가 수정되었습니다.'));
};

// 학생 삭제 (슈퍼관리자)
exports.deleteStudent = async (req, res) => {
  if (req.loginUser.auth < 10) throw new ForbiddenError('권한이 없습니다.');

  const { idx } = req.params;
  await model.deleteStudent(idx);
  res.json(createSuccessResponse(null, '학생이 삭제되었습니다.'));
};

// 일괄 등록 (슈퍼관리자)
exports.bulkRegisterStudents = async (req, res) => {
  if (req.loginUser.auth < 10) throw new ForbiddenError('권한이 없습니다.');

  const { students } = req.body;
  if (!students || !Array.isArray(students) || students.length === 0) {
    throw new BadRequestError('학생 데이터가 필요합니다.');
  }

  const now = new Date();
  const rows = students.map(s => ({
    stu_year: s.stu_year,
    stu_grade: s.stu_grade,
    stu_class: s.stu_class,
    stu_number: s.stu_number,
    stu_name: s.stu_name,
    stu_gender: s.stu_gender || null,
    stu_major: s.stu_major || null,
    stu_sub_major: s.stu_sub_major || null,
    stu_status: s.stu_status || 'Y',
    stu_id: s.stu_id || null,
    stu_memo: s.stu_memo || null,
    reg_datetime: now,
  }));

  const count = await model.bulkCreateStudents(rows);
  res.json(createSuccessResponse({ count }, `${count}명의 학생이 등록되었습니다.`));
};
