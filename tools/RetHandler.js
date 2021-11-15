let exported = {
    success: function (data) {
        let ret = new Map();
        ret.set("err", 0);
        ret.set("data", data)
        return Object.fromEntries(ret);
    },
    fail: function(errCode, errMsg) {
        let ret = new Map();
        ret.set("err", errCode);
        ret.set("errMsg", errMsg);
        return Object.fromEntries(ret);
    }
}

module.exports = exported;
