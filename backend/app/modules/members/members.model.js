const moment = require("moment-timezone");
const memberModel = {};
const db = database();

const getKoreanTime = () => {
  return moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss");
};

// 회원 조회 (mem_idx로)
memberModel.getMemberByIdx = async (mem_idx) => {
  try {
    return await db('wb_member')
      .where('mem_idx', mem_idx)
      .whereIn('mem_status', ['Y', 'N'])
      .first();
  } catch (err) {
    console.error('Error in getMemberByIdx:', err);
    return null;
  }
};

// 회원 조회 (userid로 로그인용)
memberModel.getMemberByUserid = async (mem_userid) => {
  try {
    return await db('wb_member')
      .where('mem_userid', mem_userid)
      .whereIn('mem_status', ['Y', 'N'])
      .first();
  } catch (err) {
    console.error('Error in getMemberByUserid:', err);
    return null;
  }
};

// 로그인 시간 업데이트
memberModel.updateLoginInfo = async (mem_idx, logIp) => {
  try {
    await db('wb_member')
      .where('mem_idx', mem_idx)
      .update({
        mem_logtime: getKoreanTime(),
        mem_logip: logIp,
        mem_logcount: db.raw('mem_logcount + 1')
      });
    return true;
  } catch (err) {
    console.error('Error in updateLoginInfo:', err);
    return false;
  }
};

// 회원 생성
memberModel.createMember = async (userData) => {
  try {
    const [mem_idx] = await db('wb_member').insert(userData);
    return mem_idx;
  } catch (err) {
    console.error('Error in createMember:', err);
    return null;
  }
};

// 비밀번호 업데이트
memberModel.updatePassword = async (mem_idx, newPassword) => {
  try {
    await db('wb_member')
      .where('mem_idx', mem_idx)
      .update({ mem_password: getHasString(newPassword) });
    return true;
  } catch (err) {
    console.error('Error in updatePassword:', err);
    return false;
  }
};

// 회원 목록 조회 (관리자용)
memberModel.getMemberList = async (options = {}) => {
  try {
    const { page = 1, limit = 20, search = null } = options;
    const offset = (page - 1) * limit;

    const listQuery = db('wb_member')
      .select('mem_idx', 'mem_userid', 'mem_name', 'mem_auth', 'mem_status', 'mem_logtime', 'mem_regtime')
      .where('mem_status', 'Y');

    if (search) {
      listQuery.andWhere(function() {
        this.where('mem_userid', 'like', `%${search}%`)
          .orWhere('mem_name', 'like', `%${search}%`);
      });
    }

    const countQuery = db('wb_member').where('mem_status', 'Y');
    if (search) {
      countQuery.andWhere(function() {
        this.where('mem_userid', 'like', `%${search}%`)
          .orWhere('mem_name', 'like', `%${search}%`);
      });
    }

    const [members, countResult] = await Promise.all([
      listQuery.orderBy('mem_idx', 'asc').offset(offset).limit(limit),
      countQuery.count({ total: 'mem_idx' }).first()
    ]);

    const total = countResult ? Number(countResult.total) : 0;
    return { members, total, page: parseInt(page), totalPages: Math.ceil(total / limit) };
  } catch (err) {
    console.error('Error in getMemberList:', err);
    return null;
  }
};

// 회원 상세 조회
memberModel.getMemberDetail = async (mem_idx) => {
  try {
    const result = await db('wb_member').where('mem_idx', mem_idx).first();
    if (!result) return null;
    const { mem_password, ...memberInfo } = result;
    return memberInfo;
  } catch (err) {
    console.error('Error in getMemberDetail:', err);
    return null;
  }
};

module.exports = memberModel;
