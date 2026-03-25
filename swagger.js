const swaggerJsdoc = require("swagger-jsdoc")

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API Monitoring Serveur",
            version: "1.0.0",
            description: "API de monitoring (CPU, RAM, Disk, Health)"
        },
        servers: [
            {
                url: "http://localhost:5000"
            }
        ]
    },
    apis: ["./routes/*.js"] // IMPORTANT
}

const swaggerSpec = swaggerJsdoc(options)

module.exports = swaggerSpec