const express = require("express");
const router = express.Router();
const Fornecedor = require("../models/Fornecedores"); // importa o schema do Mongo

// Função para formatar fornecedor e manter "id"
const formatFornecedor = (f) => {
  const obj = f.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

// POST - Criar novo fornecedor
router.post("/", async (req, res) => {
  try {
    const { razaoSocial, cnpj } = req.body;

    if (!razaoSocial || !cnpj) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes." });
    }

    // Evita duplicidade de CNPJ
    const existente = await Fornecedor.findOne({ cnpj });
    if (existente) {
      return res.status(400).json({ error: "Fornecedor com este CNPJ já existe." });
    }

    const novoFornecedor = new Fornecedor(req.body);
    await novoFornecedor.save();

    res.status(201).json(formatFornecedor(novoFornecedor));
  } catch (error) {
    console.error("Erro ao salvar fornecedor:", error);
    res.status(500).json({ error: "Erro ao salvar fornecedor." });
  }
});

// GET - Listar todos os fornecedores
router.get("/", async (req, res) => {
  try {
    const fornecedores = await Fornecedor.find().sort({ createdAt: -1 });
    res.json(fornecedores.map(formatFornecedor));
  } catch (error) {
    console.error("Erro ao ler fornecedores:", error);
    res.status(500).json({ error: "Erro ao carregar fornecedores." });
  }
});

// GET - Buscar fornecedor por ID
router.get("/:id", async (req, res) => {
  try {
    const fornecedor = await Fornecedor.findById(req.params.id);
    if (!fornecedor) {
      return res.status(404).json({ error: "Fornecedor não encontrado." });
    }
    res.json(formatFornecedor(fornecedor));
  } catch (error) {
    console.error("Erro ao buscar fornecedor:", error);
    res.status(500).json({ error: "Erro ao buscar fornecedor." });
  }
});

// DELETE - Remover fornecedor pelo ID
router.delete("/:id", async (req, res) => {
  try {
    const fornecedorRemovido = await Fornecedor.findByIdAndDelete(req.params.id);
    if (!fornecedorRemovido) {
      return res.status(404).json({ error: "Fornecedor não encontrado." });
    }
    res.json({
      message: "Fornecedor removido com sucesso.",
      fornecedor: formatFornecedor(fornecedorRemovido),
    });
  } catch (error) {
    console.error("Erro ao excluir fornecedor:", error);
    res.status(500).json({ error: "Erro ao excluir fornecedor." });
  }
});

// PUT - Atualizar fornecedor pelo ID
router.put("/:id", async (req, res) => {
  try {
    const fornecedorAtualizado = await Fornecedor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!fornecedorAtualizado) {
      return res.status(404).json({ error: "Fornecedor não encontrado." });
    }
    res.json(formatFornecedor(fornecedorAtualizado));
  } catch (error) {
    console.error("Erro ao atualizar fornecedor:", error);
    res.status(500).json({ error: "Erro ao atualizar fornecedor." });
  }
});

module.exports = router;
