module.exports = {
    apps: [
        {
            name: 'Lexi',
            script: './start.sh',
            env: {},
            env_production: {
                PRODUCTION: '1'
            }
        }
    ]
};
