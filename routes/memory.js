/**
 * @swagger
 * /api/v1/memory:
 *   get:
 *     summary: Utilisation mémoire
 *     tags: [Memory]
 *     responses:
 *       200:
 *         description: Infos mémoire
 *         content:
 *           application/json:
 *             example:
 *               total_gb: 32
 *               used_gb: 22
 *               free_gb: 10
 *               used_percent: 70.94
 *               checked_at: "Sun, 22 Jan 2026 22:32:35 CET"
 */
const express = require("express")
const si = require("systeminformation")

const router = express.Router()

router.get("/", async (req, res) => {
    try {
        const mem = await si.mem()

        res.status(200).json({
            total_gb: (mem.total / 1e9).toFixed(0),
            used_gb: (mem.used / 1e9).toFixed(0),
            free_gb: (mem.free / 1e9).toFixed(0),
            used_percent: ((mem.used / mem.total) * 100).toFixed(2),
            checked_at: new Date().toString()
        })
    } catch (error) {
        res.status(500).json({
            error: "Unable to read memory metrics",
            status: 500,
            checked_at: new Date().toString()
        })
    }
})

module.exports = router