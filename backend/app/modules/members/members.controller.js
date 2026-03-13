const memberModel = loadModule("members", "model");
const memberController = {};
const moment = require('moment-timezone');
const {
  UnauthorizedError, ValidationError, ConflictError,
  createSuccessResponse, NotFoundError, ForbiddenError
} = require("../../helpers/error.helper");

// 로그인 체크 미들웨어
memberController.loginMemberCheck = async (req, res, next) => {
  const jwt = require("jsonwebtoken");

  req.loginUser = {
    id: 0,
    auth: 0,
    ip: ip2long(req.header("x-forwarded-for") || req.header('x-real-ip') || req.header('cf-connecting-ip') || req.socket.remoteAddress),
  };

  // 인증이 필요없는 경로
  if (
    req.path === "/v1/members/auth/login" ||
    req.path === "/v1/members/auth/refresh"
  ) {
    return next();
  }

  let accessToken = req.cookies.access_token;
  if (!accessToken) return next();

  await jwt.verify(accessToken, appConfig.secretKey, async (error, decoded) => {
    if (error) {
      req.loginUser.id = 0;
      req.loginUser.auth = 0;
      return next();
    } else {
      req.loginUser.id = decoded.id;
      req.loginUser.auth = decoded.auth;
      req.loginUser.name = decoded.name;
      return next();
    }
  });
};

// 로그인
memberController.login = async (req, res) => {
  const { mem_userid, mem_password } = req.body;

  if (!mem_userid) throw new ValidationError('아이디를 입력하세요.');
  if (!mem_password) throw new ValidationError('비밀번호를 입력하세요.');

  const user = await memberModel.getMemberByUserid(mem_userid);
  if (!user) throw new UnauthorizedError('아이디 또는 비밀번호가 올바르지 않습니다.');

  const hashedPassword = getHasString(mem_password);
  if (user.mem_password !== hashedPassword) {
    throw new UnauthorizedError('아이디 또는 비밀번호가 올바르지 않습니다.');
  }

  if (['H', 'D'].includes(user.mem_status)) {
    throw new UnauthorizedError('정지되거나 삭제된 계정입니다.');
  }

  // IP 추출
  let clientIp = req.header("x-forwarded-for") || req.header('x-real-ip') || req.header('cf-connecting-ip') || req.socket.remoteAddress;
  if (clientIp && clientIp.includes(',')) clientIp = clientIp.split(',')[0].trim();
  const logIp = ip2long(clientIp);

  await memberModel.updateLoginInfo(user.mem_idx, logIp);

  // JWT 토큰 생성
  const accessToken = createAccessToken({ id: user.mem_idx, auth: user.mem_auth, name: user.mem_name });
  const refreshToken = createRefreshToken({ id: user.mem_idx });

  // httpOnly 쿠키로 토큰 설정
  const cookieOptions = {
    httpOnly: true,
    secure: appConfig.cookie.secure,
    sameSite: appConfig.cookie.sameSite,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
  };

  res.cookie('access_token', accessToken, cookieOptions);
  res.cookie('refresh_token', refreshToken, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
  res.cookie('is_logged_in', 'true', { ...cookieOptions, httpOnly: false });

  const { mem_password: _, ...memberInfo } = user;

  return res.json(createSuccessResponse({ user: memberInfo }, '로그인에 성공했습니다.'));
};

// 토큰 갱신
memberController.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) throw new UnauthorizedError('Refresh Token이 필요합니다.');

  const decoded = verifyToken(refreshToken);
  if (decoded.error) {
    if (decoded.error === 'TOKEN_EXPIRED') throw new UnauthorizedError('Refresh Token이 만료되었습니다. 다시 로그인해주세요.');
    throw new UnauthorizedError(decoded.message);
  }
  if (decoded.type !== 'refresh') throw new UnauthorizedError('올바르지 않은 토큰입니다.');

  const user = await memberModel.getMemberByIdx(decoded.id);
  if (!user) throw new UnauthorizedError('회원 정보를 찾을 수 없습니다.');
  if (['H', 'D'].includes(user.mem_status)) throw new UnauthorizedError('정지되거나 삭제된 계정입니다.');

  const newAccessToken = createAccessToken({ id: user.mem_idx, auth: user.mem_auth, name: user.mem_name });

  res.cookie('access_token', newAccessToken, {
    httpOnly: true, secure: appConfig.cookie.secure,
    sameSite: appConfig.cookie.sameSite, path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.json(createSuccessResponse({}, '토큰이 갱신되었습니다.'));
};

// 현재 사용자 정보
memberController.getMe = async (req, res) => {
  if (!req.loginUser || req.loginUser.id === 0) throw new UnauthorizedError('로그인이 필요합니다.');

  const user = await memberModel.getMemberByIdx(req.loginUser.id);
  if (!user) throw new NotFoundError('회원 정보를 찾을 수 없습니다.');
  if (['H', 'D'].includes(user.mem_status)) throw new UnauthorizedError('정지되거나 삭제된 계정입니다.');

  const { mem_password: _, ...memberInfo } = user;
  return res.json(createSuccessResponse({ user: memberInfo }, '회원 정보 조회 성공'));
};

// 로그아웃
memberController.logout = async (req, res) => {
  const clearOpts = { path: '/', secure: appConfig.cookie.secure, sameSite: appConfig.cookie.sameSite };
  res.clearCookie('access_token', clearOpts);
  res.clearCookie('refresh_token', clearOpts);
  res.clearCookie('is_logged_in', clearOpts);
  return res.json(createSuccessResponse({}, '로그아웃되었습니다.'));
};

// 관리자 회원 등록
memberController.register = async (req, res) => {
  if (!req.loginUser || req.loginUser.auth < 8) throw new ForbiddenError('관리자 권한이 필요합니다.');

  const { mem_userid, mem_password, mem_name, mem_auth = 4 } = req.body;
  if (!mem_userid || !mem_password || !mem_name) throw new ValidationError('필수 항목을 입력하세요.');

  const existing = await memberModel.getMemberByUserid(mem_userid);
  if (existing) throw new ConflictError('이미 존재하는 아이디입니다.');

  const mem_idx = await memberModel.createMember({
    mem_userid, mem_password: getHasString(mem_password), mem_name, mem_auth, mem_status: 'Y',
    mem_regtime: moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss")
  });

  if (!mem_idx) throw new Error('회원 등록에 실패했습니다.');
  return res.json(createSuccessResponse({ mem_idx }, '회원이 등록되었습니다.'));
};

// 비밀번호 변경
memberController.changePassword = async (req, res) => {
  if (!req.loginUser || req.loginUser.id === 0) throw new UnauthorizedError('로그인이 필요합니다.');

  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) throw new ValidationError('현재 비밀번호와 새 비밀번호를 입력하세요.');

  const user = await memberModel.getMemberByIdx(req.loginUser.id);
  if (!user) throw new NotFoundError('회원 정보를 찾을 수 없습니다.');

  if (user.mem_password !== getHasString(current_password)) throw new UnauthorizedError('현재 비밀번호가 올바르지 않습니다.');

  await memberModel.updatePassword(req.loginUser.id, new_password);
  return res.json(createSuccessResponse({}, '비밀번호가 변경되었습니다.'));
};

// 회원 목록
memberController.getMemberList = async (req, res) => {
  if (!req.loginUser || req.loginUser.auth < 8) throw new ForbiddenError('관리자 권한이 필요합니다.');
  const result = await memberModel.getMemberList(req.query);
  if (!result) throw new Error('회원 목록 조회에 실패했습니다.');
  return res.json(createSuccessResponse(result));
};

// 회원 상세
memberController.getMemberDetail = async (req, res) => {
  if (!req.loginUser || req.loginUser.auth < 8) throw new ForbiddenError('관리자 권한이 필요합니다.');
  const member = await memberModel.getMemberDetail(req.params.id);
  if (!member) throw new NotFoundError('회원을 찾을 수 없습니다.');
  return res.json(createSuccessResponse(member));
};

module.exports = memberController;
