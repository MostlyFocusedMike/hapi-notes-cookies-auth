module.exports = {
    method: 'GET',
    path: '/login',
    options: {
        handler: async (request, h) => {
            return h.view('login');
        },
    },
};
