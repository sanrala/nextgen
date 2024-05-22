const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors()); // Ajoutez cette ligne pour activer CORS

app.get('/api/featured', async (req, res) => {
  try {
    const response = await axios.get('https://store.steampowered.com/api/featured/');
    res.json(response.data);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Une erreur s\'est produite lors de la récupération des données.' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
