const swaggerJsdoc = require("swagger-jsdoc")

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API Monitoring Serveur",
            version: "1.0.0",
            description: `
API de monitoring serveur permettant :
- Surveillance CPU, RAM, disque
- Détection automatique d'anomalies
- Création d'incidents via API externe
            `
        },

        servers: [
            {
                url: "http://localhost:5000"
            }
        ],

        tags: [
            { name: "Health" },
            { name: "CPU" },
            { name: "Memory" },
            { name: "Disk" },
            { name: "All" },
            { name: "Incidents" }
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },

        security: [
            {
                bearerAuth: []
            }
        ]
    },

    apis: ["./routes/*.js"]
}

const swaggerSpec = swaggerJsdoc(options)

module.exports = swaggerSpec