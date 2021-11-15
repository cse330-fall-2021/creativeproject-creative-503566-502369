let exported = {
    username: function (username) {
        let regex = /^[a-zA-Z0-9]{1,20}$/;
        return regex.test(username);
    },
    password: function (password) {
        let regex = /^[a-zA-Z0-9]{1,20}$/;
        return regex.test(password);
    },
    roomName: function (roomName) {
        return roomName.length > 0 && roomName.length < 20;
    },
    roomPassword: function (roomPassword) {
        let regex = /^[a-zA-Z0-9]{0,20}$/;
        return regex.test(roomPassword);
    }
}

module.exports = exported;
