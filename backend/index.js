const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
});

async function inicializarBanco() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(200) NOT NULL,
        cpf VARCHAR(20),
        email VARCHAR(200) UNIQUE NOT NULL,
        telefone VARCHAR(30),
        senha_hash VARCHAR(255) NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS anuncios (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255) NOT NULL,
        preco NUMERIC(10,2) NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        emoji VARCHAR(20),
        criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Banco inicializado com sucesso');
  } catch (erro) {
    console.error('Erro ao inicializar banco:', erro);
  }
}

app.get('/api/status', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');

    res.json({
      status: 'Online',
      database_connection: true,
      timestamp: result.rows[0].now,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      status: 'Erro',
      database_connection: false,
      error: err.message,
    });
  }
});

app.get('/api/anuncios', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM anuncios ORDER BY criado_em DESC'
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      erro: 'Erro ao buscar anúncios',
    });
  }
});

app.post('/api/anuncios', async (req, res) => {
  try {
    const { titulo, preco, categoria, emoji } = req.body;

    const result = await pool.query(
      `
      INSERT INTO anuncios
      (titulo, preco, categoria, emoji)
      VALUES ($1,$2,$3,$4)
      RETURNING *
      `,
      [titulo, preco, categoria, emoji]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      erro: 'Erro ao salvar anúncio',
    });
  }
});

app.post('/api/usuarios/cadastro', async (req, res) => {
  try {
    const { nome, cpf, email, telefone, senha } = req.body;

    const usuarioExistente = await pool.query(
      'SELECT id FROM usuarios WHERE email = $1',
      [email]
    );

    if (usuarioExistente.rows.length > 0) {
      return res.status(400).json({
        erro: 'E-mail já cadastrado',
      });
    }

    const result = await pool.query(
      `
      INSERT INTO usuarios
      (nome, cpf, email, telefone, senha_hash)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING id
      `,
      [nome, cpf, email, telefone, senha]
    );

    res.status(201).json({
      mensagem: 'Usuário criado com sucesso',
      id: result.rows[0].id,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      erro: 'Erro ao cadastrar usuário',
    });
  }
});

app.post('/api/usuarios/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    const result = await pool.query(
      `
      SELECT *
      FROM usuarios
      WHERE email = $1
      AND senha_hash = $2
      `,
      [email, senha]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        erro: 'E-mail ou senha incorretos',
      });
    }

    res.json({
      sucesso: true,
      usuario: result.rows[0].nome,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      erro: 'Erro ao fazer login',
    });
  }
});

const PORT = process.env.PORT || 3000;

inicializarBanco().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
});
