/**
 * @swagger
 * /api/v1/all:
 *   get:
 *     summary: Récupère toutes les métriques système avec système d'alertes
 *     description: |
 *       Retourne l'ensemble des métriques du serveur (CPU, mémoire, disque).
 *
 *       Une alerte est déclenchée pour chaque métrique dépassant 30%.
 *       Plusieurs incidents peuvent être créés lors d'une seule requête.
 *     tags: [All]
 *     responses:
 *       200:
 *         description: Informations système récupérées avec succès
 *         content:
 *           application/json:
 *             example:
 *               host_info:
 *                 status: "UP"
 *                 hostname: "server-prod-01.local"
 *                 os: "linux"
 *                 platform: "ubuntu"
 *                 checked_at: "Sun, 22 Jan 2026 22:33:53 CET"
 *               cpu_info:
 *                 total_usage_percent: 45.12
 *                 logical_cores: 8
 *                 physical_cores: 8
 *                 checked_at: "Sun, 22 Jan 2026 22:33:54 CET"
 *                 alert_triggered: true
 *                 incident:
 *                   id: "45"
 *                   severity: "LOW"
 *                   message: "Incident created on monitoring platform"
 *               memory_info:
 *                 used_percent: 70.93
 *                 checked_at: "Sun, 22 Jan 2026 22:33:54 CET"
 *                 alert_triggered: true
 *                 incident:
 *                   id: "46"
 *                   severity: "HIGH"
 *                   message: "Incident created on monitoring platform"
 *               disk_info:
 *                 used_percent: 21.74
 *                 checked_at: "Sun, 22 Jan 2026 22:33:54 CET"
 *                 alert_triggered: false
 *       500:
 *         description: Erreur lors de la récupération des métriques système
 *         content:
 *           application/json:
 *             example:
 *               error: "Unable to read system metrics"
 *               status: 500
 *               checked_at: "Sun, 22 Jan 2026 22:40:00 CET"
 */
const express = require("express")
const si = require("systeminformation")
const os = require("os")
const axios = require("axios")

const router = express.Router()

const TOKEN = process.env.TOKEN
const APPLICATION_ID = process.env.APPLICATION_ID

function getSeverity(percent) {
    if (percent > 90) return "CRITICAL"
    if (percent > 60) return "HIGH"
    return "LOW"
}

async function createIncident(type, percent, hostname, checkedAt) {
    const severity = getSeverity(percent)

    const response = await axios.post(
        "https://monitoring-app.on-forge.com/api/v1/incidents",
        {
            title: `ALERTE ${type} — Utilisation à ${percent}%`,
            description: `Le serveur ${hostname} a détecté une utilisation ${type} de ${percent}% à ${checkedAt}`,
            application_id: APPLICATION_ID,
            status: "OPEN",
            severity: severity,
            start_date: new Date().toISOString()
        },
        {
            headers: {
                Authorization: `Bearer ${TOKEN}`
            }
        }
    )

    return {
        id: response.data?.data?.id,
        severity: severity,
        message: "Incident created on monitoring platform"
    }
}

router.get("/", async (req, res) => {
    try {
        const [load, cpu, mem, disks] = await Promise.all([
            si.currentLoad(),
            si.cpu(),
            si.mem(),
            si.fsSize()
        ])

        const disk = disks[0]
        const checkedAt = new Date().toString()

        const cpuPercent = parseFloat(load.currentLoad.toFixed(2))
        const memPercent = parseFloat(((mem.used / mem.total) * 100).toFixed(2))
        const diskPercent = parseFloat(disk.use.toFixed(2))

        let cpuIncident = null
        let memIncident = null
        let diskIncident = null

        // CPU
        if (cpuPercent > 30) {
            cpuIncident = await createIncident("CPU", cpuPercent, os.hostname(), checkedAt)
        }

        // MEMORY
        if (memPercent > 30) {
            memIncident = await createIncident("RAM", memPercent, os.hostname(), checkedAt)
        }

        // DISK
        if (diskPercent > 30) {
            diskIncident = await createIncident("DISK", diskPercent, os.hostname(), checkedAt)
        }

        res.json({
            host_info: {
                status: "UP",
                hostname: os.hostname(),
                os: os.type().toLowerCase(),
                platform: os.platform(),
                checked_at: checkedAt
            },
            cpu_info: {
                total_usage_percent: cpuPercent,
                logical_cores: cpu.cores,
                physical_cores: cpu.physicalCores,
                checked_at: checkedAt,
                alert_triggered: cpuPercent > 30,
                ...(cpuIncident && { incident: cpuIncident })
            },
            memory_info: {
                used_percent: memPercent,
                checked_at: checkedAt,
                alert_triggered: memPercent > 30,
                ...(memIncident && { incident: memIncident })
            },
            disk_info: {
                used_percent: diskPercent,
                checked_at: checkedAt,
                alert_triggered: diskPercent > 30,
                ...(diskIncident && { incident: diskIncident })
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