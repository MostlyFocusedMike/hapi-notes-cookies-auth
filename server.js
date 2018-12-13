require('dotenv').config();
const Bcrypt = require('bcrypt');
const hapi = require('hapi');
const hapiAuthCookie = require('hapi-auth-cookie');
const vision = require('vision');
const handlebars = require('handlebars');
const Path = require('path');

const users = {
    john: {
        /* password is 'secret' */
        password: '$2a$10$iqJSHD.BGr0E2IxQwYgJmeP3NvhPrXAeLSaGCj6IR/XU5QtjVu5Tm',
        username: 'john',
        name: 'John Doe',
        // id: '2133d32a',
    },
};

const server = new hapi.Server({
    host: 'localhost',
    port: 3107,
});

const start = async () => {
    await server.register([
        hapiAuthCookie,
        vision,
    ]);

    server.views({
        engines: {
            html: handlebars,
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
    server.route({
        method: 'GET',
        path: '/',
        options: {
            handler: (request, h) => {
                return h.view('index');
            },
        },
    });

    server.route({
        method: 'GET',
        path: '/login',
        options: {
            handler: async (request, h) => {
                return h.view('login');
            },
        },
    });

    server.route({
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
    });

    server.route({
        method: 'GET',
        path: '/logout',
        options: {
            auth: 'session',
            handler: (request, h) => {
                /* logout by clearing the cookie */
                return h.view('logout');
            },
        },
    });

    server.route({
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
    });

    server.route({
        method: 'GET',
        path: '/private-route',
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
                if (request.auth.isAuthenticated && request.auth.credentials.username === request.params.username) {
                    return `Hello ${request.params.username}, this is your profile`;
                }
                return `This is ${request.params.username}'s profile`;
            },
        },
    });

    server.route({
        method: 'GET',
        path: '/some-route',
        options: {
            auth: {
                mode: 'try',
                strategy: 'session',
            },
            handler: (request, h) => {
                if (request.auth.isAuthenticated) {
                    // session data available
                    const session = request.auth.credentials;
                    return {
                        msg: 'you ARE auth',
                        authData: request.auth,
                        session,
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
