-- AttendSeat DB 스키마
-- MySQL / TiDB 호환

-- 관리자 계정
CREATE TABLE IF NOT EXISTS `wb_member` (
  `mem_idx` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `mem_userid` VARCHAR(50) NOT NULL,
  `mem_password` VARCHAR(255) NOT NULL,
  `mem_name` VARCHAR(50) NOT NULL,
  `mem_auth` TINYINT NOT NULL DEFAULT 4 COMMENT '4=교사, 8=관리자, 10=슈퍼관리자',
  `mem_status` CHAR(1) NOT NULL DEFAULT 'Y' COMMENT 'Y=활성, N=비활성, D=삭제',
  `mem_logtime` DATETIME DEFAULT NULL COMMENT '마지막 로그인',
  `mem_logip` INT UNSIGNED DEFAULT 0,
  `mem_logcount` INT UNSIGNED DEFAULT 0,
  `mem_regtime` DATETIME DEFAULT NULL,
  PRIMARY KEY (`mem_idx`),
  UNIQUE KEY `uk_userid` (`mem_userid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 로그
CREATE TABLE IF NOT EXISTS `wb_logs` (
  `log_idx` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `log_type` VARCHAR(50) DEFAULT NULL,
  `log_description` TEXT,
  `reg_user` INT UNSIGNED DEFAULT 0,
  `reg_datetime` DATETIME DEFAULT NULL,
  `reg_ip` INT UNSIGNED DEFAULT 0,
  PRIMARY KEY (`log_idx`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 학생
CREATE TABLE IF NOT EXISTS `wb_student` (
  `student_idx` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `year` SMALLINT NOT NULL COMMENT '학년도 (2026)',
  `grade` TINYINT NOT NULL COMMENT '학년 (1,2,3)',
  `class` TINYINT NOT NULL COMMENT '반 (1,2,3)',
  `number` TINYINT NOT NULL COMMENT '번호',
  `name` VARCHAR(50) NOT NULL,
  `gender` CHAR(1) DEFAULT NULL COMMENT '남/여',
  `major` VARCHAR(20) DEFAULT NULL COMMENT '음악/미술',
  `sub_major` VARCHAR(50) DEFAULT NULL COMMENT '세부전공 (피아노, 만화애니, 디자인 등)',
  `status` CHAR(1) NOT NULL DEFAULT 'Y' COMMENT 'Y=재학, N=졸업, T=자퇴, R=전학',
  `student_id` VARCHAR(10) DEFAULT NULL COMMENT '학번 (예: 1101)',
  `memo` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`student_idx`),
  KEY `idx_year_grade_class` (`year`, `grade`, `class`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 장소 (어학실, 각 실기실 등)
CREATE TABLE IF NOT EXISTS `wb_room` (
  `room_idx` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '장소명 (어학실, 만화애니1실, 음악2 등)',
  `floor` VARCHAR(10) DEFAULT NULL COMMENT '층',
  `type` VARCHAR(20) NOT NULL DEFAULT 'practice' COMMENT 'study=어학실, practice=실기실',
  `capacity` SMALLINT DEFAULT NULL COMMENT '수용인원',
  `is_active` CHAR(1) NOT NULL DEFAULT 'Y',
  PRIMARY KEY (`room_idx`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 좌석 (각 장소의 좌석)
CREATE TABLE IF NOT EXISTS `wb_seat` (
  `seat_idx` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `room_idx` INT UNSIGNED NOT NULL,
  `seat_number` VARCHAR(10) NOT NULL COMMENT '좌석번호',
  `seat_label` VARCHAR(50) DEFAULT NULL COMMENT '좌석 라벨 (표시용)',
  `pos_x` SMALLINT DEFAULT 0 COMMENT 'UI 좌표 X',
  `pos_y` SMALLINT DEFAULT 0 COMMENT 'UI 좌표 Y',
  `is_active` CHAR(1) NOT NULL DEFAULT 'Y',
  PRIMARY KEY (`seat_idx`),
  KEY `idx_room` (`room_idx`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 야자 출석 (특정 날짜, 특정 교시에 누가 어디에)
CREATE TABLE IF NOT EXISTS `wb_attendance` (
  `att_idx` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_idx` INT UNSIGNED NOT NULL,
  `room_idx` INT UNSIGNED DEFAULT NULL,
  `seat_idx` INT UNSIGNED DEFAULT NULL,
  `date` DATE NOT NULL COMMENT '날짜',
  `period` TINYINT NOT NULL COMMENT '교시 (1,2,3)',
  `status` VARCHAR(20) NOT NULL DEFAULT 'present' COMMENT 'present=출석, absent=결석, academy=학원, afterschool=방과후, leave=외출, gohome=하교/귀가, consult=상담, camp=캠프, study=어학실',
  `memo` VARCHAR(255) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`att_idx`),
  UNIQUE KEY `uk_student_date_period` (`student_idx`, `date`, `period`),
  KEY `idx_date_period` (`date`, `period`),
  KEY `idx_room_date` (`room_idx`, `date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 야자 기본 배정 (학생별 기본 연습실 설정)
CREATE TABLE IF NOT EXISTS `wb_student_default_room` (
  `sdr_idx` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `student_idx` INT UNSIGNED NOT NULL,
  `room_idx` INT UNSIGNED NOT NULL,
  `period` TINYINT DEFAULT NULL COMMENT 'NULL이면 전 교시 기본',
  `day_of_week` VARCHAR(10) DEFAULT NULL COMMENT '요일별 다른 배정 (월,화,수,목)',
  PRIMARY KEY (`sdr_idx`),
  KEY `idx_student` (`student_idx`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 초기 관리자 계정 생성 (비밀번호: admin123)
-- getHasString('admin123') = SHA256(MD5('attendseat' + 'admin123'))
-- 실제 해시값은 서버 실행 후 생성하세요
-- INSERT INTO wb_member (mem_userid, mem_password, mem_name, mem_auth, mem_status, mem_regtime)
-- VALUES ('admin', '해시값', '관리자', 10, 'Y', NOW());
