const express = require("express");
const router = express.Router();
const Transacao = require("../models/Transacao");

// Função para formatar retornos (_id -> id)
const formatDoc = (doc) => {
  const obj = doc.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

// GET transações por viagem
router.get("/:idViagem/transacoes", async (req, res) => {
  try {
    const { idViagem } = req.params;
    const transacoes = await Transacao.find({ idViagem });
    res.json(transacoes.map(formatDoc));
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar transações" });
  }
});

// PUT (substitui todas as transações de uma viagem)
router.put("/:idViagem/transacoes", async (req, res) => {
  try {
    const { idViagem } = req.params;
    const novas = req.body;

    if (!Array.isArray(novas)) {
      return res.status(400).send("Transações devem ser um array.");
    }

    await Transacao.deleteMany({ idViagem });

    const novasTransacoes = novas.map(t => ({
      ...t,
      idViagem
    }));

    const inseridas = await Transacao.insertMany(novasTransacoes);
    res.json(inseridas.map(formatDoc));
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar transações" });
  }
});

// DELETE uma transação por ID
router.delete("/transacoes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletada = await Transacao.findByIdAndDelete(id);

    if (!deletada) {
      return res.status(404).send("Transação não encontrada.");
    }

    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: "Erro ao excluir transação" });
  }
});

module.exports = router;




