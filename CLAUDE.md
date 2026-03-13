# CLAUDE.md

## Project Overview

예술고등학교 야간자율학습(야자) 좌석 및 출석 관리 시스템.
- **Backend API**: Node.js/Express (port 7800)
- **Admin Panel**: React (Vite + MUI)
- 학생 ~150명, 3학년 x 3반 (1반=음악, 2·3반=미술)

## Development Commands

### Backend
```bash
cd backend
npm install
npm run dev      # 개발모드 (--dev flag)
npm run server   # 프로덕션 모드
```

### Admin Frontend
```bash
cd admin
npm install
npm run dev      # Vite dev server
npm run build    # Production build
```

## Architecture

euno-node 프로젝트 구조 기반. 회사 코드 패턴 동일.

### Backend Structure
```
backend/app/
├── index.js
├── core/
│   ├── wheeparam.js    # Bootstrap
│   ├── db.js           # Knex.js MySQL/TiDB 연결
│   └── global.js       # 글로벌 함수
├── config/             # 환경별 설정
├── helpers/            # 자동 로드 헬퍼
├── middleware/
├── libraries/          # 업로드 등
└── modules/
    └── members/        # 관리자 인증
```

### Module Pattern (Auto-Discovery)
`modules/[name]/` 폴더에 `routes.js`, `controller.js`, `model.js` 3파일 추가하면 `/v1/[name]` 경로로 자동 마운트.

### Authentication
- JWT httpOnly Cookie 방식 (access_token 24h, refresh_token 30d)
- 권한: 4=교사, 8=관리자, 10=슈퍼관리자
- 비밀번호 해싱: SHA256(MD5(secretKey + password))

### Database
- MySQL / TiDB Serverless (MySQL 호환)
- Query Builder: Knex.js
- 스키마: SQLTABLE.sql 참조

## Key Tables
- `wb_member`: 관리자/교사 계정
- `students`: 학생 정보
- `rooms`: 장소 (어학실, 실기실 등)
- `seats`: 좌석
- `attendance`: 출석 기록
- `student_default_room`: 학생별 기본 연습실
- `supervisor_schedule`: 감독 교사 배정

## Code Style
- Backend: CommonJS (require/module.exports)
- Frontend: ES Modules, MUI, Redux Toolkit
- 에러 메시지: 한국어
- API 응답: { success: true/false, data, message }
