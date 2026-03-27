/**
 * @swagger
 * /api/v1/cpu:
 *   get:
 *     summary: Récupère l'utilisation CPU avec système d'alerte
 *     description: |
 *       Retourne les informations CPU du serveur.
 *
 *       Une alerte est déclenchée si l'utilisation dépasse 30%.
 *       Dans ce cas, un incident est automatiquement créé via l'API externe.
 *     tags: [CPU]
 *     responses:
 *       200:
 *         description: Informations CPU récupérées avec succès
 *         content:
 *           application/json:
 *             example:
 *               total_usage_percent: 45.12
 *               logical_cores: 8
 *               physical_cores: 8
 *               checked_at: "Sun, 22 Jan 2026 22:30:01 CET"
 *               alert_triggered: true
 *               incident:
 *                 id: "42"
 *                 severity: "LOW"
 *                 message: "Incident created on monitoring platform"
 *       500:
 *         description: Erreur lors de la récupération des métriques CPU
 *         content:
 *           application/json:
 *             example:
 *               error: "Unable to read CPU metrics"
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


router.get("/", async (req, res) => {
    try {
        const load = await si.currentLoad()
        const cpu = await si.cpu()

        const percent = parseFloat(load.currentLoad.toFixed(2))
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
                        title: `ALERTE CPU — Utilisation à ${percent}%`,
                        description: `Le serveur ${os.hostname()} a détecté une utilisation CPU de ${percent}% à ${checkedAt}`,
                        application_id: APPLICATION_ID,
                        status: "OPEN",
                        severity: severity,
                        start_date: new Date().toISOString()
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${TOKEN}`,
                            "Content-Type": "application/json"
                        }
                    }
                )

                incident = {
                    id: response.data?.data?.id || null,
                    severity: severity,
                    message: "Incident created on monitoring platform"
                }

            } catch (err) {
                console.error("Erreur création incident:", err.response?.data || err.message)

                incident = {
                    id: null,
                    severity: "UNKNOWN",
                    message: "Failed to create incident"
                }
            }
        }

        res.status(200).json({
            total_usage_percent: percent,
            logical_cores: cpu.cores,
            physical_cores: cpu.physicalCores,
            checked_at: checkedAt,
            alert_triggered: alertTriggered,
            ...(incident && { incident })
        })

    } catch (error) {
        console.error("Erreur CPU:", error)

        res.status(500).json({
            error: "Unable to read CPU metrics",
            status: 500,
            checked_at: new Date().toString()
        })
    }
})

module.exports = router