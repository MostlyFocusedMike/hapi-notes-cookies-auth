/* eslint-disable global-require */

require('dotenv').config();
const hapi = require('hapi');
const Path = require('path');

const server = new hapi.Server({
    host: 'localhost',
    port: 3107,
});

const start = async () => {
    await server.register([
        require('hapi-auth-cookie'),
        require('vision'),
    ]);

    server.views({
        engines: {
            html: require('handlebars'),
        },
        relativeTo: Path.join(__dirname, 'lib/templates'),
        path: '.',
        isCached: process.env.NODE_ENV === 'production',
    });

    server.auth.strategy('session', 'cookie', {
        /* needed for cookie encoding */
        password: process.env.PASSWORD,
        /*
            this is required for sending cookies
            over localhost, which is just http
        */
        isSecure: process.env.NODE_ENV === 'production',
        /*
            when a user fails auth, this is where they will get
            redirected to, can be disabled per route, and only
            affects routes with a mode of 'required'
        */
        redirectTo: '/',
    });


    // routes
    server.route([
        require('./lib/routes/home'),
        require('./lib/routes/login-get'),
        require('./lib/routes/login-post'),
    ]);

    server.route({
        method: 'GET',
        path: '/private-test',
        options: {
            auth: 'session',
            handler: (request, h) => {
                return 'Yeah! This message is only available for authenticated users!';
            },
        },
    });

    server.route({
        method: 'GET',
        path: '/users/{username}',
        options: {
            auth: {
                strategy: 'session',
                mode: 'try',
            },
            handler: (request, h) => {
                console.log('auth: ', request.auth.credentials);
                const user = users[request.params.username];
                if (!user) {
                    return h.redirect('/');
                }
                const context = {
                    name: user.name,
                    username: user.username,
                    isUser: false,
                };
                if (request.auth.isAuthenticated && request.auth.credentials.username === request.params.username) {
                    context.isUser = true;
                }

                return h.view('user-profile', context);
            },
        },
    });

    server.route({
        method: 'GET',
        path: '/show-auth',
        options: {
            auth: {
                mode: 'try',
                strategy: 'session',
            },
            handler: (request, h) => {
                if (request.auth.isAuthenticated) {
                    return {
                        msg: 'you ARE auth',
                        authData: request.auth,
                    };
                }
                return { msg: 'you are NOT auth', authData: request.auth };
            },
        },
    });

    try {
        await server.start();
        console.log(`Server is up on: ${server.info.uri}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();
