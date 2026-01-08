const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// Caminho do arquivo JSON do perfil (ajuste se necessário)
const perfilPath = path.join(__dirname, "..", "data", "perfil.json");

// GET /api/perfil — retorna todos os perfis (array)
router.get("/", (req, res) => {
  fs.readFile(perfilPath, "utf8", (err, data) => {
    if (err) {
      console.error("Erro ao ler o arquivo de perfil:", err);
      return res.status(500).json({ error: "Erro ao ler o arquivo de perfil." });
    }
    try {
      const perfis = JSON.parse(data);
      res.json(perfis);  // <-- Retorna o array completo, não só o primeiro
    } catch (parseErr) {
      console.error("Erro ao parsear JSON do perfil:", parseErr);
      res.status(500).json({ error: "Erro ao parsear JSON do perfil." });
    }
  });
});

// PUT /api/perfil — atualiza um perfil dentro do array pelo id
router.put("/", (req, res) => {
  const novoPerfil = req.body;

  if (!novoPerfil || !novoPerfil.id) {
    return res.status(400).json({ error: "Dados do perfil inválidos." });
  }

  fs.readFile(perfilPath, "utf8", (err, data) => {
    if (err) {
      console.error("Erro ao ler o arquivo de perfil:", err);
      return res.status(500).json({ error: "Erro ao ler o arquivo de perfil." });
    }

    try {
      let perfis = JSON.parse(data);
      const index = perfis.findIndex(p => p.id === novoPerfil.id);
      if (index === -1) {
        return res.status(404).json({ error: "Perfil não encontrado." });
      }
      perfis[index] = novoPerfil;

      fs.writeFile(perfilPath, JSON.stringify(perfis, null, 2), (err) => {
        if (err) {
          console.error("Erro ao salvar o perfil:", err);
          return res.status(500).json({ error: "Erro ao salvar o perfil." });
        }
        res.json({ message: "Perfil atualizado com sucesso.", perfil: novoPerfil });
      });
    } catch (parseErr) {
      console.error("Erro ao parsear JSON do perfil:", parseErr);
      res.status(500).json({ error: "Erro ao parsear JSON do perfil." });
    }
  });
});

router.put("/", (req, res) => {
  const novoPerfil = req.body;

  if (!novoPerfil || !novoPerfil.id) {
    return res.status(400).json({ error: "Dados do perfil inválidos." });
  }

  fs.readFile(perfilPath, "utf8", (err, data) => {
    if (err) {
      console.error("Erro ao ler o arquivo de perfil:", err);
      return res.status(500).json({ error: "Erro ao ler o arquivo de perfil." });
    }

    try {
      const perfis = JSON.parse(data);
      const index = perfis.findIndex((p) => p.id === novoPerfil.id);

      if (index === -1) {
        return res.status(404).json({ error: "Perfil não encontrado." });
      }

      // Atualiza o perfil no array
      perfis[index] = { ...perfis[index], ...novoPerfil };

      fs.writeFile(perfilPath, JSON.stringify(perfis, null, 2), (err) => {
        if (err) {
          console.error("Erro ao salvar o perfil:", err);
          return res.status(500).json({ error: "Erro ao salvar o perfil." });
        }
        res.json({ message: "Perfil atualizado com sucesso.", perfil: perfis[index] });
      });
    } catch (parseErr) {
      console.error("Erro ao parsear JSON do perfil:", parseErr);
      res.status(500).json({ error: "Erro ao parsear JSON do perfil." });
    }
  });
});

module.exports = router;

