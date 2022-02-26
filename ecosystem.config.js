module.exports = {
    apps : [
        {
          name: "protobot",
          script: "./start.sh",
          env: {},
          env_production: {
              PRODUCTION="1"
          }
        }
    ]
  }
  