// backend/getDaildayConsumption.js

const express = require('express');
const axios = require('axios');
const qs = require('qs');

const app = express();

app.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const response = await axios.post('https://gw.hml.api.enedis.fr/v1/oauth2/token',
      qs.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.PUBLIC_KEY_TESTING,
        client_secret: process.env.PRIVATE_KEY_TESTING,
        code: code,
        redirect_uri: 'http://localhost:3000/callback'
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('Access Token:', response.data.access_token);
    // À ce stade tu peux le sauvegarder dans un fichier, en mémoire ou dans un store sécurisé
    res.send('Token récupéré ! Check ta console.');
  } catch (error) {
    console.error(error.response.data);
    res.status(500).send('Erreur lors de l\'échange du code');
  }
});

app.listen(3000, () => console.log('Serveur callback démarré sur http://localhost:3000'));

