/**
 * @swagger
 * /api/v1/memory:
 *   get:
 *     summary: Récupère l'utilisation mémoire avec système d'alerte
 *     description: |
 *       Retourne les informations mémoire du serveur.
 *
 *       Une alerte est déclenchée si l'utilisation dépasse 30%.
 *       Dans ce cas, un incident est automatiquement créé via l'API externe.
 *     tags: [Memory]
 *     responses:
 *       200:
 *         description: Informations mémoire récupérées avec succès
 *         content:
 *           application/json:
 *             example:
 *               total_gb: 32
 *               used_gb: 22
 *               free_gb: 10
 *               used_percent: 70.94
 *               checked_at: "Sun, 22 Jan 2026 22:32:35 CET"
 *               alert_triggered: true
 *               incident:
 *                 id: "42"
 *                 severity: "HIGH"
 *                 message: "Incident created on monitoring platform"
 *       500:
 *         description: Erreur lors de la récupération des métriques mémoire
 *         content:
 *           application/json:
 *             example:
 *               error: "Unable to read memory metrics"
 *               status: 500
 *               checked_at: "Sun, 22 Jan 2026 22:40:00 CET"
 */
const express = require("express")
const si = require("systeminformation")
const os = require("os")
const axios = require("axios")

const router = express.Router()

const TOKEN = "588|edaG4gsP3f8GrMs0HELIUGBSdvgNCDks1YBhJ4JH34f9533e"
const APPLICATION_ID = "019d2c5a-fda8-7258-bb29-83be60642959"

function getSeverity(percent) {
    if (percent > 90) return "CRITICAL"
    if (percent > 60) return "HIGH"
    return "LOW"
}

router.get("/", async (req, res) => {
    try {
        const mem = await si.mem()

        const percent = parseFloat(((mem.used / mem.total) * 100).toFixed(2))
        const checkedAt = new Date().toString()

        let alertTriggered = false
        let incident = null

        if (percent > 30) {
            alertTriggered = true

            try {
                const severity = getSeverity(percent)

                const response = await axios    .post(
                    "https://monitoring-app.on-forge.com/api/v1/incidents",
                    {
                        title: `ALERTE RAM — Utilisation à ${percent}%`,
                        description: `Le serveur ${os.hostname()} a détecté une utilisation RAM de ${percent}% à ${checkedAt}`,
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
                console.error("Erreur RAM:", err.message)
            }
        }

        res.json({
            total_gb: (mem.total / 1e9).toFixed(0),
            used_gb: (mem.used / 1e9).toFixed(0),
            free_gb: (mem.free / 1e9).toFixed(0),
            used_percent: percent,
            checked_at: checkedAt,
            alert_triggered: alertTriggered,
            ...(incident && { incident })
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