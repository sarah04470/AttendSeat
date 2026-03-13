module.exports = {
    apiVersion: 'v1',
    appPort: process.env.PORT || 7800,
    secretKey: process.env.SECRET_KEY || 'attendseat',
    database: {
        host: process.env.DB_HOST || 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
        username: process.env.DB_USER || '4QvHLHjP22aevU1.root',
        password: process.env.DB_PASS || 'DUXik8SMIzwYUsOS',
        port: process.env.DB_PORT || 4000,
        database: process.env.DB_NAME || 'attendseat',
        ssl: { rejectUnauthorized: true }
    },
    cors: {
        origin: process.env.CORS_ORIGIN || true,
        credentials: true
    },
    apiUrl: process.env.API_URL || 'https://attendseat-api.onrender.com/v1',
    jwt: {
        accessTokenExpire: '24h',
        refreshTokenExpire: '30d',
    },
    cookie: {
        secure: true,
        sameSite: 'none'
    }
}
