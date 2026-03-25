/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: État général du serveur
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Serveur opérationnel
 *         content:
 *           application/json:
 *             example:
 *               status: "UP"
 *               hostname: "server-prod-01.local"
 *               os: "linux"
 *               platform: "ubuntu"
 *               checked_at: "Sun, 22 Jan 2026 22:29:16 CET"
 *       500:
 *         description: Erreur serveur
 */
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