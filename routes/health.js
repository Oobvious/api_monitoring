const express = require("express")
const os = require("os")

const router = express.Router()

router.get("/", (req, res) => {
    try {
        res.status(200).json({
            status: "UP",
            hostname: os.hostname(),
            os: os.type().toLowerCase(),
            platform: os.platform(),
            checked_at: new Date().toString()
        })
    } catch (error) {
        res.status(500).json({
            error: "Unable to read system health",
            status: 500,
            checked_at: new Date().toString()
        })
    }
})

module.exports = router