const express = require("express");
const router = express.Router();
const ManutencaoPreventiva = require("../models/ManutencaoPreventiva");

// Função para formatar documentos
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

// GET - listar todas as manutenções preventivas
router.get("/", async (req, res) => {
  try {
    const manutencoes = await ManutencaoPreventiva.find()
      .populate("caminhaoId")
      .sort({ data: -1 });
    
    const manutencoesFormatadas = manutencoes.map(manutencao => formatDoc(manutencao));
    res.status(200).json(manutencoesFormatadas);
  } catch (err) {
    console.error("Erro ao buscar manutenções preventivas:", err);
    res.status(500).json({
      error: "Erro ao buscar manutenções preventivas: " + err.message
    });
  }
});

// GET - manutenção preventiva por ID
router.get("/:id", async (req, res) => {
  try {
    const manutencao = await ManutencaoPreventiva.findById(req.params.id)
      .populate("caminhaoId");
    
    if (!manutencao) {
      return res.status(404).json({
        error: "Manutenção preventiva não encontrada."
      });
    }
    
    res.status(200).json(formatDoc(manutencao));
  } catch (err) {
    console.error("Erro ao buscar manutenção preventiva:", err);
    res.status(500).json({
      error: "Erro ao buscar manutenção preventiva: " + err.message
    });
  }
});

// POST - adicionar nova manutenção preventiva
router.post("/", async (req, res) => {
  console.log("Dados recebidos no POST:", req.body);

  let {
    caminhaoId,
    data,
    tipo,
    quilometragem,
    oficina,
    custo,
    proximaRevisao,
    observacoes = "",
    status = "Agendada"
  } = req.body;

  // Extrair apenas o ID do caminhão se for um objeto
  if (caminhaoId && typeof caminhaoId === 'object') {
    caminhaoId = caminhaoId._id || caminhaoId.id || caminhaoId;
  }

  // Verificação dos campos obrigatórios
  if (!caminhaoId || !data || !tipo || quilometragem === undefined || 
      !oficina || custo === undefined || !proximaRevisao) {
    return res.status(400).json({
      error: "Campos obrigatórios ausentes.",
      camposFaltantes: {
        caminhaoId: !caminhaoId,
        data: !data,
        tipo: !tipo,
        quilometragem: quilometragem === undefined,
        oficina: !oficina,
        custo: custo === undefined,
        proximaRevisao: !proximaRevisao
      }
    });
  }

  try {
    const novaManutencao = new ManutencaoPreventiva({
      caminhaoId,
      data,
      tipo,
      quilometragem: Number(quilometragem),
      oficina,
      custo: Number(custo),
      proximaRevisao,
      observacoes,
      status
    });

    const manutencaoSalva = await novaManutencao.save();
    await manutencaoSalva.populate("caminhaoId");
    
    res.status(201).json(formatDoc(manutencaoSalva));
  } catch (err) {
    console.error("Erro ao salvar manutenção preventiva:", err);
    res.status(500).json({
      error: "Erro ao salvar manutenção preventiva: " + err.message,
      details: err.errors
    });
  }
});

// PUT - atualizar manutenção preventiva por ID
router.put("/:id", async (req, res) => {
  try {
    console.log("ID da manutenção:", req.params.id);
    console.log("Dados recebidos para atualização:", req.body);
    
    let dadosAtualizados = { ...req.body };
    
    // Extrair apenas o ID do caminhão se for um objeto
    if (dadosAtualizados.caminhaoId && typeof dadosAtualizados.caminhaoId === 'object') {
      dadosAtualizados.caminhaoId = dadosAtualizados.caminhaoId._id || dadosAtualizados.caminhaoId.id || dadosAtualizados.caminhaoId;
    }
    
    // Converter números
    if (dadosAtualizados.quilometragem !== undefined) {
      dadosAtualizados.quilometragem = Number(dadosAtualizados.quilometragem);
    }
    if (dadosAtualizados.custo !== undefined) {
      dadosAtualizados.custo = Number(dadosAtualizados.custo);
    }
    
    const manutencaoAtualizada = await ManutencaoPreventiva.findByIdAndUpdate(
      req.params.id,
      dadosAtualizados,
      { new: true, runValidators: true }
    ).populate("caminhaoId");

    if (!manutencaoAtualizada) {
      return res.status(404).json({
        error: "Manutenção preventiva não encontrada."
      });
    }

    res.status(200).json(formatDoc(manutencaoAtualizada));
  } catch (err) {
    console.error("Erro detalhado ao atualizar:", err);
    res.status(500).json({
      error: "Erro ao atualizar manutenção preventiva: " + err.message,
      details: err.errors
    });
  }
});

// DELETE - remover manutenção preventiva por ID
router.delete("/:id", async (req, res) => {
  try {
    const manutencaoDeletada = await ManutencaoPreventiva.findByIdAndDelete(req.params.id);
    
    if (!manutencaoDeletada) {
      return res.status(404).json({
        error: "Manutenção preventiva não encontrada."
      });
    }

    res.status(200).json({
      message: "Manutenção preventiva deletada com sucesso",
      id: manutencaoDeletada._id.toString()
    });
  } catch (err) {
    console.error("Erro ao excluir manutenção preventiva:", err);
    res.status(500).json({
      error: "Erro ao excluir manutenção preventiva: " + err.message
    });
  }
});

// GET - manutenções preventivas por caminhão
router.get("/caminhao/:caminhaoId", async (req, res) => {
  try {
    const manutencoes = await ManutencaoPreventiva.find({ 
      caminhaoId: req.params.caminhaoId 
    })
    .populate("caminhaoId")
    .sort({ data: -1 });
    
    const manutencoesFormatadas = manutencoes.map(manutencao => formatDoc(manutencao));
    res.status(200).json(manutencoesFormatadas);
  } catch (err) {
    console.error("Erro ao buscar manutenções preventivas por caminhão:", err);
    res.status(500).json({
      error: "Erro ao buscar manutenções preventivas: " + err.message
    });
  }
});

// GET - manutenções preventivas por status
router.get("/status/:status", async (req, res) => {
  try {
    const manutencoes = await ManutencaoPreventiva.find({ 
      status: req.params.status 
    })
    .populate("caminhaoId")
    .sort({ data: -1 });
    
    const manutencoesFormatadas = manutencoes.map(manutencao => formatDoc(manutencao));
    res.status(200).json(manutencoesFormatadas);
  } catch (err) {
    console.error("Erro ao buscar manutenções preventivas por status:", err);
    res.status(500).json({
      error: "Erro ao buscar manutenções preventivas: " + err.message
    });
  }
});

module.exports = router;
