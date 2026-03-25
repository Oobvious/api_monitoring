const express = require("express")
const port = process.env.PORT || 5000

const os = require('os')

const app = express()

app.get("/api/v1/", (req, res) =>{
    res.status(200).send("Hello la team")
})

app.get("/api/v1/health", (req, res) => {
    try {
        const data = {
            status : "UP",
            hostname: os.hostname(),
            OS : os.type(),
        }

        res.status(200).json(data)
    }
    catch (error) {
        res.status(500).json({
        error: "Unable to read system health",
        status: 500,
        checked_at: new Date().toString()
        })
    }
})

app.get("/api/v1/cpu", (req, res) =>{
    res.status(200).send("Hello la team")
})

app.get("/api/v1/memory", (req, res) => {
    try {
        const data = {
        memory : process.memoryUsage()
        }

        res.status(200).json(data)
    }
    catch (error) {
        res.status(500).json({
        error: "Unable to read system memory",
        status: 500,
        checked_at: new Date().toString()
        })
    }
})

app.get("/api/v1/disk", (req, res) =>{
    res.status(200).send("Hello la team")
})

app.get("/api/v1/all", (req, res) =>{
    res.status(200).send("Test")
})

app.listen(port, () => {
    console.log("Server on")
})