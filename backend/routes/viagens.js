const express = require("express");
const Viagem = require("../models/Viagem");
const router = express.Router();

// Função para formatar viagem e manter "id"
const formatViagem = (v) => {
  const obj = v.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

// GET todas as viagens
router.get("/", async (req, res) => {
  try {
    const viagens = await Viagem.find();
    res.status(200).json(viagens.map(formatViagem));
  } catch (err) {
    res.status(500).send("Erro ao buscar viagens.");
  }
});

// GET viagem por ID
router.get("/:id", async (req, res) => {
  try {
    const viagem = await Viagem.findById(req.params.id);
    if (!viagem) return res.status(404).send("Viagem não encontrada.");
    res.status(200).json(formatViagem(viagem));
  } catch (err) {
    res.status(500).send("Erro ao buscar viagem.");
  }
});

// POST nova viagem
router.post("/", async (req, res) => {
  try {
    const novaViagem = new Viagem(req.body);
    await novaViagem.save();
    res.status(201).json(formatViagem(novaViagem));
  } catch (err) {
    res.status(500).send("Erro ao salvar viagem.");
  }
});

// PUT viagem
router.put("/:id", async (req, res) => {
  try {
    const dadosAtualizados = { ...req.body };

    if (dadosAtualizados.status === "Concluída" && !dadosAtualizados.dataTermino) {
      dadosAtualizados.dataTermino = new Date().toISOString();
    }

    const viagem = await Viagem.findByIdAndUpdate(req.params.id, dadosAtualizados, { new: true });
    if (!viagem) return res.status(404).send("Viagem não encontrada.");
    res.status(200).json(formatViagem(viagem));
  } catch (err) {
    res.status(500).send("Erro ao atualizar viagem.");
  }
});

// DELETE viagem
router.delete("/:id", async (req, res) => {
  try {
    const viagem = await Viagem.findByIdAndDelete(req.params.id);
    if (!viagem) return res.status(404).send("Viagem não encontrada.");
    res.status(204).end();
  } catch (err) {
    res.status(500).send("Erro ao excluir viagem.");
  }
});

module.exports = router;


