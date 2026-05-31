const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());

// Configuração da conexão com o bd usando variáveis de ambiente
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

// Endpoint para verificar a conexão com o banco
app.get('/api/status', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      status: 'Online', 
      database_connection: true, 
      timestamp: result.rows[0].now 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'Erro', database_connection: false, error: err.message });
  }
});

// Endpoint inicial para listar anúncios
app.get('/api/anuncios', (req, res) => {
  res.json([
    { id: 1, titulo: "Notebook Acer Aspire 5", preco: 2500.00, categoria: "Notebooks" },
    { id: 2, titulo: "Placa de Desenvolvimento ESP32-CAM", preco: 45.00, categoria: "Componentes" }
  ]);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});
