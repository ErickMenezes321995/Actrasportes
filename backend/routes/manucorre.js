const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const MANUTENCAO_CORRETIVA_FILE = path.join(__dirname, "../data/manutencaoCorretiva.json");

// GET todas as manutenções corretivas
router.get("/", (req, res) => {
  fs.readFile(MANUTENCAO_CORRETIVA_FILE, "utf8", (err, data) => {
    if (err) return res.status(500).send("Erro ao ler manutenções corretivas.");
    res.status(200).json(JSON.parse(data));
  });
});

// POST nova manutenção corretiva
router.post("/", (req, res) => {
  const {
    caminhaoId,
    data,
    tipo,
    quilometragem,
    oficina,
    custo,
    observacoes,
    status = "Concluída",
  } = req.body;

  if (!caminhaoId || !data || !tipo || !quilometragem) {
    return res.status(400).send("Campos obrigatórios: caminhaoId, data, tipo, quilometragem.");
  }

  fs.readFile(MANUTENCAO_CORRETIVA_FILE, "utf8", (err, dataFile) => {
    if (err) return res.status(500).send("Erro ao ler manutenções corretivas.");

    const manutencoes = JSON.parse(dataFile);
    const novaManutencao = {
      id: Date.now(),
      caminhaoId,
      data,
      tipo,
      quilometragem,
      oficina,
      custo,
      observacoes,
      status,
    };

    manutencoes.push(novaManutencao);

    fs.writeFile(MANUTENCAO_CORRETIVA_FILE, JSON.stringify(manutencoes, null, 2), (err) => {
      if (err) return res.status(500).send("Erro ao salvar manutenção corretiva.");
      res.status(201).json(novaManutencao);
    });
  });
});

// PUT atualizar manutenção corretiva
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).send("ID inválido.");

  fs.readFile(MANUTENCAO_CORRETIVA_FILE, "utf8", (err, dataFile) => {
    if (err) return res.status(500).send("Erro ao ler manutenções corretivas.");

    const manutencoes = JSON.parse(dataFile);
    const index = manutencoes.findIndex((m) => m.id === id);
    if (index === -1) return res.status(404).send("Manutenção corretiva não encontrada.");

    manutencoes[index] = { ...manutencoes[index], ...req.body };

    fs.writeFile(MANUTENCAO_CORRETIVA_FILE, JSON.stringify(manutencoes, null, 2), (err) => {
      if (err) return res.status(500).send("Erro ao atualizar manutenção corretiva.");
      res.status(200).json(manutencoes[index]);
    });
  });
});

// DELETE manutenção corretiva
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).send("ID inválido.");

  fs.readFile(MANUTENCAO_CORRETIVA_FILE, "utf8", (err, dataFile) => {
    if (err) return res.status(500).send("Erro ao ler manutenções corretivas.");

    const manutencoes = JSON.parse(dataFile);
    const novos = manutencoes.filter((m) => m.id !== id);

    fs.writeFile(MANUTENCAO_CORRETIVA_FILE, JSON.stringify(novos, null, 2), (err) => {
      if (err) return res.status(500).send("Erro ao excluir manutenção corretiva.");
      res.status(204).end();
    });
  });
});

module.exports = router;
