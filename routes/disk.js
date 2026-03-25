/**
 * @swagger
 * /api/v1/disk:
 *   get:
 *     summary: Utilisation disque
 *     tags: [Disk]
 *     responses:
 *       200:
 *         description: Infos disque
 */
const express = require("express")
const si = require("systeminformation")

const router = express.Router()

router.get("/", async (req, res) => {
    try {
        const disks = await si.fsSize()
        const disk = disks[0]

        res.status(200).json({
            total_gb: (disk.size / 1e9).toFixed(0),
            used_gb: (disk.used / 1e9).toFixed(0),
            free_gb: ((disk.size - disk.used) / 1e9).toFixed(0),
            used_percent: disk.use.toFixed(2),
            checked_at: new Date().toString()
        })
    } catch (error) {
        res.status(500).json({
            error: "Unable to read disk metrics",
            status: 500,
            checked_at: new Date().toString()
        })
    }
})

module.exports = router