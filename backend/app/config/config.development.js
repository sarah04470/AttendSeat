module.exports = {
    apiVersion: 'v1',
    appPort: 7800,
    secretKey: 'attendseat',
    database: {
        host: 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
        username: '4QvHLHjP22aevU1.root',
        password: 'DUXik8SMIzwYUsOS',
        port: 4000,
        database: 'attendseat',
        ssl: { rejectUnauthorized: true }
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
