const express = require("express")

const app = express()
const port = process.env.PORT || 5000

const swaggerUi = require("swagger-ui-express")g
const swaggerSpec = require("./swagger")

// Import des routes
const healthRoute = require("./routes/health")
const cpuRoute = require("./routes/cpu")
const memoryRoute = require("./routes/memory")
const diskRoute = require("./routes/disk")
const allRoute = require("./routes/all")

// Utilisation des routes
app.use("/api/v1/health", healthRoute)
app.use("/api/v1/cpu", cpuRoute)
app.use("/api/v1/memory", memoryRoute)
app.use("/api/v1/disk", diskRoute)
app.use("/api/v1/all", allRoute)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Error 404
app.use((req, res) => {
    res.status(404).json({
        error: "Endpoint not found",
        status: 404,
        checked_at: new Date().toString()
    })
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})