module.exports = {
    method: 'POST',
    path: '/logout',
    options: {
        auth: 'session',
        handler: (request, h) => {
            /* logout by clearing the cookie */
            request.cookieAuth.clear();
            return h.redirect('/');
        },
    },
};
