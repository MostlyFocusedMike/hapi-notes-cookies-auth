const Bcrypt = require('bcrypt');
const users = require('../db');

module.exports = {
    method: 'POST',
    path: '/login',
    options: {
        handler: async (request, h) => {
            const { username, password } = request.payload;

            const user = users[username];
            if (!user) {
                return { msg: 'You are not in the db' };
            }
            // check if user exists in DB
            // compare passwords
            if (await Bcrypt.compare(password, user.password)) {
                request.cookieAuth.set(user);
                return h.redirect(`/users/${user.username}`);
                // return h.redirect('/private-route');
            }
            return { msg: 'incorrect password or username' };
        },
    },
};
