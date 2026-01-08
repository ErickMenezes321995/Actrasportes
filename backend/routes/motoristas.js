const express = require("express");
const router = express.Router();
const Motorista = require("../models/Motorista"); // certifique-se que o caminho está correto

// Função para formatar motorista e manter "id"
const formatMotorista = (m) => {
  const obj = m.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

// GET - Listar todos os motoristas
router.get("/", async (req, res) => {
  try {
    const motoristas = await Motorista.find();
    res.status(200).json(motoristas.map(formatMotorista));
  } catch (error) {
    console.error("Erro ao buscar motoristas:", error);
    res.status(500).json({ error: "Erro ao buscar motoristas." });
  }
});

// POST - Criar novo motorista
router.post("/", async (req, res) => {
  try {
    const { nome, cpf, cnh } = req.body;

    if (!nome || !cpf || !cnh) {
      return res.status(400).json({ error: "Campos obrigatórios: nome, cpf, cnh." });
    }

    // Verifica CPF duplicado
    const existente = await Motorista.findOne({ cpf });
    if (existente) {
      return res.status(400).json({ error: "Já existe um motorista com este CPF." });
    }

    const novoMotorista = new Motorista(req.body);
    await novoMotorista.save();

    res.status(201).json(formatMotorista(novoMotorista));
  } catch (error) {
    console.error("Erro ao criar motorista:", error);
    res.status(500).json({ error: "Erro ao criar motorista." });
  }
});

// PUT - Atualizar motorista pelo ID
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const motoristaAtualizado = await Motorista.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!motoristaAtualizado) {
      return res.status(404).json({ error: "Motorista não encontrado." });
    }

    res.json(formatMotorista(motoristaAtualizado));
  } catch (error) {
    console.error("Erro ao atualizar motorista:", error);
    res.status(500).json({ error: "Erro ao atualizar motorista." });
  }
});

// DELETE - Remover motorista pelo ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const motoristaRemovido = await Motorista.findByIdAndDelete(id);

    if (!motoristaRemovido) {
      return res.status(404).json({ error: "Motorista não encontrado." });
    }

    res.status(200).json({ message: "Motorista removido com sucesso", motorista: formatMotorista(motoristaRemovido) });
  } catch (error) {
    console.error("Erro ao excluir motorista:", error);
    res.status(500).json({ error: "Erro ao excluir motorista." });
  }
});

module.exports = router;
