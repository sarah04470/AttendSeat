const model = {};

// 기본배정 목록 (학생 정보 JOIN)
model.getDefaultRoomList = async (params = {}) => {
  const db = database();
  const { grade, cls } = params;

  let query = db('wb_student as s')
    .leftJoin('wb_student_default_room as sdr', 's.stu_idx', 'sdr.stu_idx')
    .leftJoin('wb_room as r', 'sdr.room_idx', 'r.room_idx')
    .select(
      's.stu_idx', 's.stu_grade', 's.stu_class', 's.stu_number',
      's.stu_name', 's.stu_gender', 's.stu_major', 's.stu_sub_major',
      'sdr.sdr_idx', 'sdr.room_idx', 'sdr.sdr_period', 'sdr.sdr_day_of_week',
      'r.room_name', 'r.room_floor', 'r.room_type'
    )
    .where('s.stu_status', 'Y')
    .where('s.stu_year', 2026);

  if (grade) query = query.where('s.stu_grade', grade);
  if (cls) query = query.where('s.stu_class', cls);

  return query.orderBy([
    { column: 's.stu_grade', order: 'asc' },
    { column: 's.stu_class', order: 'asc' },
    { column: 's.stu_number', order: 'asc' },
  ]);
};

// 단일 배정 저장 (upsert)
model.assignRoom = async (stu_idx, room_idx) => {
  const db = database();
  const existing = await db('wb_student_default_room').where('stu_idx', stu_idx).first();

  if (existing) {
    await db('wb_student_default_room').where('stu_idx', stu_idx).update({ room_idx });
  } else {
    await db('wb_student_default_room').insert({ stu_idx, room_idx });
  }
  return true;
};

// 일괄 배정 저장
model.bulkAssign = async (assignments) => {
  const db = database();

  for (const item of assignments) {
    const existing = await db('wb_student_default_room').where('stu_idx', item.stu_idx).first();
    if (existing) {
      await db('wb_student_default_room').where('stu_idx', item.stu_idx).update({ room_idx: item.room_idx });
    } else {
      await db('wb_student_default_room').insert({ stu_idx: item.stu_idx, room_idx: item.room_idx });
    }
  }
  return assignments.length;
};

// 배정 삭제
model.removeAssignment = async (stu_idx) => {
  const db = database();
  return db('wb_student_default_room').where('stu_idx', stu_idx).delete();
};

module.exports = model;
