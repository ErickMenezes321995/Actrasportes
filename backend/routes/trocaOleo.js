const express = require("express");
const router = express.Router();
const TrocaOleo = require("../models/TrocaOleo");

// Função simplificada para formatar documentos
const formatDoc = (doc) => {
  if (!doc) return null;
  
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  
  if (obj._id) {
    obj.id = obj._id.toString();
    delete obj._id;
  }
  
  delete obj.__v;
  
  return obj;
};

// GET todas as trocas de óleo
router.get("/", async (req, res) => {
  try {
    const trocas = await TrocaOleo.find().populate("caminhaoId");
    const trocasFormatadas = trocas.map(troca => formatDoc(troca));
    res.status(200).json(trocasFormatadas);
  } catch (err) {
    res.status(500).json({
      error: "Erro ao buscar trocas de óleo: " + err.message
    });
  }
});

// GET troca de óleo por ID
router.get("/:id", async (req, res) => {
  try {
    const troca = await TrocaOleo.findById(req.params.id).populate("caminhaoId");
    if (!troca) {
      return res.status(404).json({
        error: "Troca de óleo não encontrada."
      });
    }
    
    res.status(200).json(formatDoc(troca));
  } catch (err) {
    res.status(500).json({
      error: "Erro ao buscar troca de óleo: " + err.message
    });
  }
});

// POST nova troca de óleo
router.post("/", async (req, res) => {
  console.log("Dados recebidos no POST:", req.body);

  let {
    caminhaoId,
    dataTroca,
    tipoOleo,
    quilometragem,
    observacoes = "",
    status = "Pendente"
  } = req.body;

  // Extrair apenas o ID do caminhão se for um objeto
  if (caminhaoId && typeof caminhaoId === 'object') {
    caminhaoId = caminhaoId._id || caminhaoId.id || caminhaoId;
    console.log("caminhaoId extraído:", caminhaoId);
  }

  // Verificação dos campos obrigatórios
  if (!caminhaoId || !dataTroca || !tipoOleo || quilometragem === undefined) {
    return res.status(400).json({
      error: "Campos obrigatórios ausentes.",
      camposFaltantes: {
        caminhaoId: !caminhaoId,
        dataTroca: !dataTroca,
        tipoOleo: !tipoOleo,
        quilometragem: quilometragem === undefined
      }
    });
  }

  try {
    const novaTroca = new TrocaOleo({
      caminhaoId,
      dataTroca,
      tipoOleo,
      quilometragem: Number(quilometragem),
      observacoes,
      status
    });

    const trocaSalva = await novaTroca.save();
    await trocaSalva.populate("caminhaoId");
    
    res.status(201).json(formatDoc(trocaSalva));
  } catch (err) {
    console.error("Erro ao salvar troca de óleo:", err);
    res.status(500).json({
      error: "Erro ao salvar troca de óleo: " + err.message,
      details: err.errors
    });
  }
});

// PUT atualização da troca de óleo
router.put("/:id", async (req, res) => {
  try {
    console.log("ID da troca:", req.params.id);
    console.log("Dados recebidos para atualização:", req.body);
    
    // Extrair apenas o ID do caminhão se for um objeto
    let dadosAtualizados = { ...req.body };
    
    if (dadosAtualizados.caminhaoId && typeof dadosAtualizados.caminhaoId === 'object') {
      dadosAtualizados.caminhaoId = dadosAtualizados.caminhaoId._id || dadosAtualizados.caminhaoId.id || dadosAtualizados.caminhaoId;
      console.log("caminhaoId convertido:", dadosAtualizados.caminhaoId);
    }
    
    // Garantir que quilometragem seja número
    if (dadosAtualizados.quilometragem !== undefined) {
      dadosAtualizados.quilometragem = Number(dadosAtualizados.quilometragem);
    }
    
    const trocaAtualizada = await TrocaOleo.findByIdAndUpdate(
      req.params.id,
      dadosAtualizados,
      { new: true, runValidators: true }
    ).populate("caminhaoId");

    if (!trocaAtualizada) {
      return res.status(404).json({
        error: "Troca de óleo não encontrada."
      });
    }

    res.status(200).json(formatDoc(trocaAtualizada));
  } catch (err) {
    console.error("Erro detalhado ao atualizar:", err);
    res.status(500).json({
      error: "Erro ao atualizar troca de óleo: " + err.message,
      details: err.errors
    });
  }
});

// DELETE troca de óleo
router.delete("/:id", async (req, res) => {
  try {
    const trocaDeletada = await TrocaOleo.findByIdAndDelete(req.params.id);
    
    if (!trocaDeletada) {
      return res.status(404).json({
        error: "Troca de óleo não encontrada."
      });
    }

    res.status(200).json({
      message: "Troca de óleo deletada com sucesso",
      id: trocaDeletada._id.toString()
    });
  } catch (err) {
    res.status(500).json({
      error: "Erro ao excluir troca de óleo: " + err.message
    });
  }
});

// GET trocas de óleo por caminhão
router.get("/caminhao/:caminhaoId", async (req, res) => {
  try {
    const trocas = await TrocaOleo.find({ 
      caminhaoId: req.params.caminhaoId 
    }).populate("caminhaoId");
    
    const trocasFormatadas = trocas.map(troca => formatDoc(troca));
    res.status(200).json(trocasFormatadas);
  } catch (err) {
    res.status(500).json({
      error: "Erro ao buscar trocas de óleo: " + err.message
    });
  }
});

module.exports = router;

