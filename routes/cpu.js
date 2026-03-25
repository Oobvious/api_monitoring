/**
 * @swagger
 * /api/v1/cpu:
 *   get:
 *     summary: Utilisation CPU
 *     tags: [CPU]
 *     responses:
 *       200:
 *         description: Infos CPU
 *         content:
 *           application/json:
 *             example:
 *               total_usage_percent: 21.56
 *               logical_cores: 8
 *               physical_cores: 8
 *               checked_at: "Sun, 22 Jan 2026 22:30:01 CET"
 *       500:
 *         description: Erreur serveur
 */
const express = require("express")
const si = require("systeminformation")

const router = express.Router()

router.get("/", async (req, res) => {
    try {
        const load = await si.currentLoad()
        const cpu = await si.cpu()

        res.status(200).json({
            total_usage_percent: load.currentLoad.toFixed(2),
            logical_cores: cpu.cores,
            physical_cores: cpu.physicalCores,
            checked_at: new Date().toString()
        })
    } catch (error) {
        res.status(500).json({
            error: "Unable to read CPU metrics",
            status: 500,
            checked_at: new Date().toString()
        })
    }
})

module.exports = router