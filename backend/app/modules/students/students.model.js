const getStudentList = async (params = {}) => {
  const { year, grade, class: cls, status, keyword, page = 1, limit = 50 } = params;
  const db = database();

  let query = db('wb_student');

  if (year) query = query.where('stu_year', year);
  if (grade) query = query.where('stu_grade', grade);
  if (cls) query = query.where('stu_class', cls);
  if (status) query = query.where('stu_status', status);
  if (keyword) {
    query = query.where(function () {
      this.where('stu_name', 'like', `%${keyword}%`)
        .orWhere('stu_id', 'like', `%${keyword}%`);
    });
  }

  const countQuery = query.clone().count('* as total').first();
  const total = (await countQuery).total;

  const offset = (page - 1) * limit;
  const list = await query
    .orderBy([
      { column: 'stu_grade', order: 'asc' },
      { column: 'stu_class', order: 'asc' },
      { column: 'stu_number', order: 'asc' },
    ])
    .limit(limit)
    .offset(offset);

  return { list, total, page, limit };
};

const getStudentByIdx = async (idx) => {
  const db = database();
  return db('wb_student').where('stu_idx', idx).first();
};

const createStudent = async (data) => {
  const db = database();
  const [idx] = await db('wb_student').insert(data);
  return idx;
};

const updateStudent = async (idx, data) => {
  const db = database();
  return db('wb_student').where('stu_idx', idx).update(data);
};

const deleteStudent = async (idx) => {
  const db = database();
  return db('wb_student').where('stu_idx', idx).update({ stu_status: 'D' });
};

const bulkCreateStudents = async (rows) => {
  const db = database();
  await db('wb_student').insert(rows);
  return rows.length;
};

module.exports = {
  getStudentList,
  getStudentByIdx,
  createStudent,
  updateStudent,
  deleteStudent,
  bulkCreateStudents,
};
