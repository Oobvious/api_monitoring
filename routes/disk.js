/**
 * @swagger
 * /api/v1/disk:
 *   get:
 *     summary: Récupère l'utilisation du disque avec système d'alerte
 *     description: |
 *       Retourne les informations d'utilisation du disque du serveur.
 *
 *       Une alerte est déclenchée si l'utilisation dépasse 30%.
 *       Dans ce cas, un incident est automatiquement créé via l'API externe.
 *     tags: [Disk]
 *     responses:
 *       200:
 *         description: Informations disque récupérées avec succès
 *         content:
 *           application/json:
 *             example:
 *               total_gb: 460
 *               used_gb: 443
 *               free_gb: 17
 *               used_percent: 96.23
 *               checked_at: "Sun, 22 Jan 2026 22:33:08 CET"
 *               alert_triggered: true
 *               incident:
 *                 id: "45"
 *                 severity: "CRITICAL"
 *                 message: "Incident created on monitoring platform"
 *       500:
 *         description: Erreur lors de la récupération des métriques disque
 *         content:
 *           application/json:
 *             example:
 *               error: "Unable to read disk metrics"
 *               status: 500
 *               checked_at: "Sun, 22 Jan 2026 22:40:00 CET"
 */
const express = require("express")
const si = require("systeminformation")
const os = require("os")
const axios = require("axios")

const router = express.Router()

const TOKEN = "35|VASJNFV7cUlfF2tHQ2dYYTACjlqCrDkEKizZwfi75e7141a8"
const APPLICATION_ID = "019d2e6b-a227-72ab-bf68-e9b3c8548ed9"

function getSeverity(percent) {
    if (percent > 90) return "CRITICAL"
    if (percent > 60) return "HIGH"
    return "LOW"
}

router.get("/", async (req, res) => {
    try {
        const disks = await si.fsSize()
        const disk = disks[0]

        const percent = parseFloat(disk.use.toFixed(2))
        const checkedAt = new Date().toString()

        let alertTriggered = false
        let incident = null

        if (percent > 30) {
            alertTriggered = true

            try {
                const severity = getSeverity(percent)

                const response = await axios.post(
                    "https://monitoring-app.on-forge.com/api/v1/incidents",
                    {
                        title: `ALERTE DISK — Utilisation à ${percent}%`,
                        description: `Le serveur ${os.hostname()} a détecté une utilisation disque de ${percent}% à ${checkedAt}`,
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

                incident = {
                    id: response.data?.data?.id,
                    severity: severity,
                    message: "Incident created on monitoring platform"
                }

            } catch (err) {
                console.error("Erreur DISK:", err.message)
            }
        }

        res.json({
            total_gb: (disk.size / 1e9).toFixed(0),
            used_gb: (disk.used / 1e9).toFixed(0),
            free_gb: ((disk.size - disk.used) / 1e9).toFixed(0),
            used_percent: percent,
            checked_at: checkedAt,
            alert_triggered: alertTriggered,
            ...(incident && { incident })
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