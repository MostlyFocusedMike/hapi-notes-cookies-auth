module.exports = {
    "extends": "airbnb-base",
    env: {
        browser: true,
        node: true,
        es6: true,
        jquery: true,
    },
    rules: {
        "indent": ["error", 4],
        "no-underscore-dangle": ["error", { "allow": ["_id", "_crumbs", "_calculateCrumbs", "_config", "_delete", "_pathAnim", "_onMouseover", "_onMouseout", "_types"] }],
        "no-unused-vars": ["warn", { "vars": "local" }],
        "no-plusplus": 0,
        "max-len": ["warn", 180],
        "one-var": 0,
        "no-console": "off",
        "arrow-body-style": "off",
    },
};