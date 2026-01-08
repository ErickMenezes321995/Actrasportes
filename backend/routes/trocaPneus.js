const express = require("express");
const router = express.Router();
const TrocaPneu = require("../models/Trocapneu");

const formatPneu = (p) => {
  const obj = p.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};


router.get("/", async (req, res) => {
  try {
    console.log("🔍 Buscando trocas de pneu...");
    const pneus = await TrocaPneu.find()
      .populate("caminhaoId", "placa modelo") // ⬅️ Agora funciona!
      .sort({ createdAt: -1 });
    
    console.log(`✅ Encontradas ${pneus.length} trocas`);
    res.status(200).json(pneus.map(formatPneu));
  } catch (error) {
    console.error("Erro ao buscar trocas de pneu:", error);
    res.status(500).json({ error: "Erro ao buscar trocas de pneu." });
  }
});

router.post("/", async (req, res) => {
  console.log("📨 POST /api/trocaPneus - Dados:", req.body);
  
  try {
    const { caminhaoId, codigoPneu, dataTroca, posicao, marca, valor, tipo, observacao } = req.body;

    if (!caminhaoId || !codigoPneu || !dataTroca || !posicao || !marca || !valor || !tipo) {
      return res.status(400).json({ error: "Todos os campos obrigatórios devem ser preenchidos." });
    }

    const novaTroca = new TrocaPneu({
      caminhaoId,
      codigoPneu,
      dataTroca,
      posicao,
      marca,
      valor,
      tipo,
      observacao: observacao || ""
    });

    const trocaSalva = await novaTroca.save();
    console.log("✅ Salvo no MongoDB. ID:", trocaSalva._id);

    await trocaSalva.populate("caminhaoId", "placa modelo");

    const trocaFormatada = formatPneu(trocaSalva);
    res.status(201).json(trocaFormatada);
  } catch (error) {
    console.error("❌ Erro ao criar troca de pneu:", error);
    res.status(500).json({ error: "Erro ao criar troca de pneu: " + error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const trocaAtualizada = await TrocaPneu.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("caminhaoId", "nome placa modelo");

    if (!trocaAtualizada) {
      return res.status(404).json({ error: "Troca de pneu não encontrada." });
    }

    res.json(formatPneu(trocaAtualizada));
  } catch (error) {
    console.error("Erro ao atualizar troca de pneu:", error);
    res.status(500).json({ error: "Erro ao atualizar troca de pneu." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const trocaRemovida = await TrocaPneu.findByIdAndDelete(id);

    if (!trocaRemovida) {
      return res.status(404).json({ error: "Troca de pneu não encontrada." });
    }

    res.status(200).json({ 
      message: "Troca de pneu removida com sucesso", 
      troca: formatPneu(trocaRemovida) 
    });
  } catch (error) {
    console.error("Erro ao excluir troca de pneu:", error);
    res.status(500).json({ error: "Erro ao excluir troca de pneu." });
  }
});

module.exports = router;