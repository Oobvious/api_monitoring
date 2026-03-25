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
const os = require("os")
const si = require("systeminformation")

const router = express.Router()

router.get("/", async (req, res) => {
    try {
        const [load, cpu, mem, disks] = await Promise.all([
            si.currentLoad(),
            si.cpu(),
            si.mem(),
            si.fsSize()
        ])

        const disk = disks[0]

        res.status(200).json({
            host_info: {
                status: "UP",
                hostname: os.hostname(),
                os: os.type().toLowerCase(),
                platform: os.platform(),
                checked_at: new Date().toString()
            },
            cpu_info: {
                total_usage_percent: load.currentLoad.toFixed(2),
                logical_cores: cpu.cores,
                physical_cores: cpu.physicalCores,
                checked_at: new Date().toString()
            },
            memory_info: {
                total_gb: (mem.total / 1e9).toFixed(0),
                used_gb: (mem.used / 1e9).toFixed(0),
                available_gb: (mem.available / 1e9).toFixed(0),
                used_percent: ((mem.used / mem.total) * 100).toFixed(2),
                checked_at: new Date().toString()
            },
            disk_info: {
                total_gb: (disk.size / 1e9).toFixed(0),
                used_gb: (disk.used / 1e9).toFixed(0),
                free_gb: ((disk.size - disk.used) / 1e9).toFixed(0),
                used_percent: disk.use.toFixed(2),
                checked_at: new Date().toString()
            }
        })

    } catch (error) {
        res.status(500).json({
            error: "Unable to read system metrics",
            status: 500,
            checked_at: new Date().toString()
        })
    }
})

module.exports = router