let exported = {
    success: function (res, data) {
        let ret = new Map();
        ret.set("err", 0);
        ret.set("data", data)
        let obj = Object.fromEntries(ret);
        res.json(JSON.stringify(obj));
    },
    fail: function(res, errCode, errMsg) {
        let ret = new Map();
        ret.set("err", errCode);
        ret.set("errMsg", errMsg);
        let obj = Object.fromEntries(ret);
        res.json(JSON.stringify(obj));
    }
}

module.exports = exported;