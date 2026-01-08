const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const usuariosPath = path.join(__dirname, "..", "data", "usuarios.json");

router.get("/", (req, res) => {
  fs.readFile(usuariosPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Erro ao ler usuários." });
    }
    try {
      const usuarios = JSON.parse(data);
      res.json(usuarios);
    } catch {
      res.status(500).json({ error: "Erro ao parsear usuários." });
    }
  });
});

module.exports = router;
