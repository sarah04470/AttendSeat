module.exports = {
    apiVersion: 'v1',
    appPort: 7800,
    secretKey: 'attendseat',
    database: {
        host: 'localhost',       // TiDB 연결시 변경
        username: 'root',        // TiDB 연결시 변경
        password: '',            // TiDB 연결시 변경
        port: 3306,              // TiDB는 4000
        database: 'AttendSeat',  // TiDB 연결시 변경
        // ssl: { rejectUnauthorized: true }  // TiDB 사용시 주석 해제
    },
    cors: {
        origin: true,
        credentials: true
    },
    apiUrl: 'http://localhost:7800/v1',
    jwt: {
        accessTokenExpire: '24h',
        refreshTokenExpire: '30d',
    },
    cookie: {
        secure: false,
        sameSite: 'lax'
    }
}
