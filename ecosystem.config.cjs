module.exports = {
    apps: [
        {
            name: 'ProtoBot',
            script: './start.sh',
            env: {},
            env_production: {
                PRODUCTION: '1'
            }
        }
    ]
};
