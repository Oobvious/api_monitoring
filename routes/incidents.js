/**
 * @swagger
 * /api/v1/incidents:
 *   get:
 *     summary: Récupère les incidents de l'application
 *     description: |
 *       Retourne la liste des incidents créés via la sonde de monitoring.
 *
 *       Ces incidents proviennent de l'API de monitoring externe.
 *       Ils sont filtrés par l'application enregistrée.
 *     tags: [Incidents]
 *     responses:
 *       200:
 *         description: Liste des incidents récupérée avec succès
 *         content:
 *           application/json:
 *             example:
 *               incidents:
 *                 - id: "42"
 *                   title: "ALERTE CPU — Utilisation à 85.42%"
 *                   severity: "HIGH"
 *                   status: "OPEN"
 *                   start_date: "2026-03-22T14:30:00"
 *                 - id: "43"
 *                   title: "ALERTE RAM — Utilisation à 70.94%"
 *                   severity: "HIGH"
 *                   status: "OPEN"
 *                   start_date: "2026-03-22T14:32:35"
 *               total: 2
 *               checked_at: "Sun, 22 Jan 2026 22:40:00 CET"
 *       500:
 *         description: Erreur lors de la récupération des incidents
 *         content:
 *           application/json:
 *             example:
 *               error: "Unable to fetch incidents"
 *               status: 500
 *               checked_at: "Sun, 22 Jan 2026 22:40:00 CET"
 */
const express = require("express")
const axios = require("axios")

const router = express.Router()

const TOKEN = process.env.TOKEN
const APPLICATION_ID = process.env.APPLICATION_ID


router.get("/", async (req, res) => {
    try {
        const response = await axios.get(
            `https://monitoring-app.on-forge.com/api/v1/applications/${APPLICATION_ID}/incidents`,
            {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            }
        )

        const incidents = response.data?.data || []

        res.status(200).json({
            incidents: incidents.map(i => ({
                id: i.id,
                title: i.title,
                severity: i.severity,
                status: i.status,
                start_date: i.start_date
            })),
            total: incidents.length,
            checked_at: new Date().toString()
        })

    } catch (error) {
        console.error("Erreur incidents:", error.response?.data || error.message)

        res.status(500).json({
            error: "Unable to fetch incidents",
            status: 500,
            checked_at: new Date().toString()
        })
    }
})

module.exports = router