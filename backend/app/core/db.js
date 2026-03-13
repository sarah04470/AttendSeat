const knex = require('knex')({
    client:'mysql2',
    connection: {
        host: appConfig.database.host,
        user: appConfig.database.username,
        password: appConfig.database.password,
        port: appConfig.database.port,
        database: appConfig.database.database,
        timezone: '+09:00',
        ssl: appConfig.database.ssl || undefined
    },
    debug : false
})

module.exports = knex;
