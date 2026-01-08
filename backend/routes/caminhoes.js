const express = require("express");
const router = express.Router();
const Equipamento = require("../models/Equipamento");

// Função para formatar a resposta
const formatEquipamento = (e) => {
  const obj = e.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

// GET todos os equipamentos
router.get("/", async (req, res) => {
  try {
    const equipamentos = await Equipamento.find();
    res.status(200).json(equipamentos.map(formatEquipamento));
  } catch (error) {
    res.status(500).send("Erro ao buscar equipamentos.");
  }
});

// POST novo equipamento
router.post("/", async (req, res) => {
  try {
    // Validação mínima (placa, modelo e ano)
    const { placa, modelo, ano } = req.body;
    if (!placa || !modelo || !ano) {
      return res.status(400).json({ error: "Placa, modelo e ano são obrigatórios." });
    }

    const novoEquipamento = new Equipamento(req.body);
    await novoEquipamento.save();
    res.status(201).json(formatEquipamento(novoEquipamento));
  } catch (error) {
    res.status(400).send("Erro ao criar equipamento.");
  }
});

// PUT atualizar equipamento
router.put("/:id", async (req, res) => {
  try {
    const atualizado = await Equipamento.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!atualizado) return res.status(404).send("Equipamento não encontrado.");
    res.status(200).json(formatEquipamento(atualizado));
  } catch (error) {
    res.status(400).send("Erro ao atualizar equipamento.");
  }
});

// DELETE equipamento
router.delete("/:id", async (req, res) => {
  try {
    const deletado = await Equipamento.findByIdAndDelete(req.params.id);
    if (!deletado) return res.status(404).send("Equipamento não encontrado.");
    res.status(204).end();
  } catch (error) {
    res.status(400).send("Erro ao excluir equipamento.");
  }
});

module.exports = router;

