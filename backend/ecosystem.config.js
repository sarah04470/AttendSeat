module.exports = {
    apps : [{
        name      : 'AttendSeat',
        script    : 'app/index.js',
        watch     : true,
        ignore_watch : [
            'node_modules',
            'app/data/files'
        ]
    }]
};
