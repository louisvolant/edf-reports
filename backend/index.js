require('dotenv').config();
const express = require('express');
const axios = require('axios');
const qs = require('qs');

const app = express();

// URL d'autorisation OAuth2
app.get('/authorize', (req, res) => {
  const url = `https://gw.hml.api.enedis.fr/v1/oauth2/authorize?client_id=${process.env.PUBLIC_KEY_TESTING}&redirect_uri=${encodeURIComponent(process.env.REDIRECT_URI)}&response_type=code&state=xyz&duration=1000&consent_scopes=consumption_daily`;
  res.redirect(url);
});

// Callback OAuth2 : échange du code contre un access token
app.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const response = await axios.post('https://gw.hml.api.enedis.fr/v1/oauth2/token',
      qs.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.PUBLIC_KEY_TESTING,
        client_secret: process.env.PRIVATE_KEY_TESTING,
        code: code,
        redirect_uri: process.env.REDIRECT_URI
      }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    console.log('Access Token récupéré :', response.data.access_token);

    res.send(`Access Token récupéré : ${response.data.access_token} (mets-le dans ton .env pour continuer)`);

  } catch (error) {
    console.error(error.response?.data || error);
    res.status(500).send('Erreur lors de l\'échange du code');
  }
});

// Route pour récupérer usage_point_id
app.get('/identity', async (req, res) => {
  const token = process.env.ACCESS_TOKEN;

  try {
    const response = await axios.get('https://gw.hml.api.enedis.fr/v4/user/identity', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(response.data);
    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error);
    res.status(500).send('Erreur lors de la récupération de l\'identité');
  }
});

// Route pour récupérer les consommations journalières
app.get('/consumption', async (req, res) => {
  const token = process.env.ACCESS_TOKEN;
  const usagePointId = process.env.USAGE_POINT_ID;

  try {
    const response = await axios.get('https://gw.hml.api.enedis.fr/v4/metering_data/daily_consumption', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        usage_point_id: usagePointId,
        start: '2024-05-01',
        end: '2024-05-20'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error);
    res.status(500).send('Erreur lors de la récupération des données');
  }
});

app.listen(3000, () => console.log('Serveur démarré sur http://localhost:3000'));
