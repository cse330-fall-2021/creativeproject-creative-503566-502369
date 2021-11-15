const UserDao = require("../dao/UserDao.js");
const UserRedis = require("../redis/UserRedis.js");
const RetHandler = require("../tools/RetHandler.js");
const FormatChecker = require("../tools/FormatChecker.js");
const Encryption = require("../tools/Encryption.js");

async function fetchUser(username) {
    let ret = null;
    try {
        let rows = await UserDao.fetchByUsername(username);
        if (rows.length === 1) {
            ret = rows[0];
        }
    } catch (e) {
        console.error(e);
    }
    return ret;
}

let exported = {
    register: async function (req, res) {
        let username = req.body.username;
        let password = req.body.password;
        if (!FormatChecker.username(username)) {
            return RetHandler.fail(1, "Username should be letters or digits and under 20 characters.");
        }
        if (!FormatChecker.password(password)) {
            return RetHandler.fail(1, "Password should be letters or digits and under 20 characters.")
        }
        let userDB = await fetchUser(username);
        if (userDB !== null) {
            return RetHandler.fail(2, "The username has been registered.");
        }
        let hashedPassword = Encryption.hash(password.toString());
        let result = false;
        try {
            result = await UserDao.register(username, hashedPassword);
        } catch (e) {
            console.error(e.message);
            return RetHandler.fail(-2, e.message);
        }
        return RetHandler.success(result);
    },
    login: async function (req, res) {
        let username = req.body.username;
        let password = req.body.password;
        if (!FormatChecker.username(username)) {
            return RetHandler.fail(1, "Username should be letters or digits and under 20 characters.");
        }
        if (!FormatChecker.password(password)) {
            return RetHandler.fail(1, "Password should be letters or digits and under 20 characters.")
        }
        let userDB = await fetchUser(username);
        if (userDB === null) {
            return RetHandler.fail(2, "The username does not exist.");
        }
        if (!Encryption.compare(password, userDB.password)) {
            return RetHandler.fail(3, "Incorrect password.");
        }
        let csrfToken = Encryption.randomBase64();
        try {
            await UserDao.login(userDB.id, req.session.id);
            await UserRedis.login(userDB.id, userDB.username,req.session.id, csrfToken);
        }catch (e) {
            console.error(e.message);
            return RetHandler.fail(-2, e.message);
        }
        let ret = {
            "csrf": csrfToken,
            "username": userDB.username,
            "userId": userDB.id
        }
        return RetHandler.success(ret);
    },
};

module.exports = exported