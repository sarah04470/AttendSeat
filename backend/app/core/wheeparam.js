/**
 * AttendSeat 주요 진입점
 */
const App = {
  express: null,
  isDev: false,
  config: {}
}

global.App = App;

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs')
const cookieParser = require('cookie-parser')
const useragent = require('express-useragent');
const path = require('path');

require('./global')

App.express = express()

process.env.TZ = 'Asia/Seoul';

App.express.use(cookieParser(appConfig.secretKey))
App.express.use(bodyParser.json({ limit: '50mb' }))
App.express.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))
App.express.use(useragent.express());

/**
 * CORS 설정
 */
App.express.use(cors(appConfig.cors))

/**
 * Helper에 등록된 helper들 자동으로 불러오기
 */
let fileList = fs.readdirSync(root + '/helpers');
fileList.forEach(async (fileName) => {
  require(root + '/helpers/' + fileName);
});

/**
 * 전역 Middleware - 사용자 로그인 여부 체크
 */
let memberController = {};
try {
  memberController = loadModule('members', 'controller');
  if (memberController.loginMemberCheck) {
    App.express.use(memberController.loginMemberCheck);
  }
} catch (error) {
  console.warn('members 컨트롤러를 찾을 수 없습니다. 로그인 체크 미들웨어를 건너뜁니다.');
  App.express.use((req, res, next) => {
    req.loginUser = { id: 0, auth: 0, ip: 0 };
    next();
  });
}

/**
 * 모듈에 등록된 Router 들 자동으로 불러오기
 */
let dirList = fs.readdirSync(modulePath)
const router = require('express').Router();
dirList.forEach((dir) => {
  if (fs.lstatSync(modulePath + '/' + dir).isDirectory()) {
    const routePath = `${modulePath}/${dir}/${dir}.routes.js`;
    const matchPath = `/${appConfig.apiVersion}/${dir}`

    if (fs.existsSync(routePath)) {
      router.use(matchPath, require(routePath))
    }
  }
});

App.express.use(router);

/**
 * 업로드 관련 Router 등록
 */
const fileuploads = require(root + '/libraries/upload.library')
App.express.use(fileuploads)

const staticFilesDirectory = path.join(root, 'data', 'files');
App.express.use(`/${appConfig.apiVersion}/data/files`, express.static(staticFilesDirectory));

/**
 * 에러 핸들링 미들웨어 등록
 */
const { setupErrorHandling } = require('../middleware/errorHandler.middleware');
setupErrorHandling(App.express);

/**
 * 어플리케이션 실행
 */
App.start = async () => {
  const http = require('http');
  const server = http.createServer(App.express);

  server.listen(appConfig.appPort, '0.0.0.0', () => {
    console.log(`[${isDev ? '개발 모드':'릴리즈 모드'}] AttendSeat 서버 작동 : port ${appConfig.appPort}`);
  });
}

module.exports = App
