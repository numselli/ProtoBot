module.exports = {
    apps: [
        {
            name: 'Lexi-Dev',
            script: './start.sh',
            env: {},
            env_production: {
                PRODUCTION: '1'
            }
        }
    ]
};
