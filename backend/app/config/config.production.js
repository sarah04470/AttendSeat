module.exports = {
    apiVersion: 'v1',
    appPort: 7800,
    secretKey: 'attendseat',
    database: {
        host: 'localhost',       // 배포시 변경
        username: 'root',        // 배포시 변경
        password: '',            // 배포시 변경
        port: 4000,              // TiDB 포트
        database: 'AttendSeat',
        ssl: { rejectUnauthorized: true }
    },
    cors: {
        origin: true,
        credentials: true
    },
    apiUrl: 'https://api.attendseat.com/v1', // 실제 도메인으로 변경
    jwt: {
        accessTokenExpire: '24h',
        refreshTokenExpire: '30d',
    },
    cookie: {
        secure: true,
        sameSite: 'none'
    }
}
