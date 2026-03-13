"use strict";

global.rowArray = async (query, bindList= []) => {
    const db = require('../core/db')
    let result = null
    try {
        await db.raw(query, bindList).then(rows => {
            if(rows && rows.length > 0 && rows[0].length > 0) result = rows[0][0]
        })
    } catch (e){ result = null }
    return result
}

global.resultArray = async (query, bindList = []) => {
    const db = require('../core/db')
    let result = []
    try {
        await db.raw(query, bindList).then(rows => {
            if(rows && rows.length > 0) result = rows[0]
            else result = []
        })
    } catch { result = [] }
    return result
}

global.getFoundRows = async () => {
    const db = require('../core/db')
    let result = 0;
    try {
        await db.raw('SELECT FOUND_ROWS() AS cnt').then(res => {
            result = element('cnt', element(0, element(0, res, []), {}), 0) * 1;
        })
    } catch { result = 0 }
    return result
}

global.getReturnObject = (returnType = 'list', result = [], totalRows = 0 ) => {
    if(returnType === 'list') {
        return { result, pageInfo: { totalRows } }
    }
    return result.length > 0 ? result[0] : {}
}
