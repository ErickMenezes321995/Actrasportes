const express = require("express");
const router = express.Router();
const Cliente = require("../models/Cliente"); // modelo do Mongo

// Função para formatar cliente e trocar _id -> id
const formatCliente = (c) => {
  const obj = c.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

// GET - Listar todos os clientes
router.get("/", async (req, res) => {
  try {
    const clientes = await Cliente.find().sort({ createdAt: -1 });
    res.json(clientes.map(formatCliente));
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    res.status(500).send("Erro ao buscar clientes.");
  }
});

// GET - Buscar cliente por ID
router.get("/:id", async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).send("Cliente não encontrado.");
    }
    res.json(formatCliente(cliente));
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    res.status(500).send("Erro ao buscar cliente.");
  }
});

// POST - Criar novo cliente
router.post("/", async (req, res) => {
  try {
    const { nome, cnpj } = req.body;

    if (!nome || !cnpj) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes." });
    }

    const existente = await Cliente.findOne({ cnpj });
    if (existente) {
      return res.status(400).json({ error: "Já existe um cliente com este CNPJ." });
    }

    const novoCliente = new Cliente(req.body);
    await novoCliente.save();
    res.status(201).json(formatCliente(novoCliente));
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    res.status(500).send("Erro ao criar cliente.");
  }
});

// PUT - Atualizar cliente
router.put("/:id", async (req, res) => {
  try {
    const clienteAtualizado = await Cliente.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!clienteAtualizado) {
      return res.status(404).send("Cliente não encontrado.");
    }

    res.json(formatCliente(clienteAtualizado));
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error);
    res.status(500).send("Erro ao atualizar cliente.");
  }
});

// DELETE - Remover cliente
router.delete("/:id", async (req, res) => {
  try {
    const clienteRemovido = await Cliente.findByIdAndDelete(req.params.id);

    if (!clienteRemovido) {
      return res.status(404).send("Cliente não encontrado.");
    }

    res.json({
      message: "Cliente removido com sucesso",
      cliente: formatCliente(clienteRemovido),
    });
  } catch (error) {
    console.error("Erro ao remover cliente:", error);
    res.status(500).send("Erro ao remover cliente.");
  }
});

module.exports = router;
