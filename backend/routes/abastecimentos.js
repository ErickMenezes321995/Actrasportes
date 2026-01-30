
const express = require("express");
const router = express.Router();
const Abastecimento = require("../models/Abastecimento");


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


router.get("/", async (req, res) => {
  try {
    const abastecimentos = await Abastecimento.find()
      .populate("caminhaoId")  
      .sort({ data: -1 });
    
    const abastecimentosFormatados = abastecimentos.map(abastecimento => formatDoc(abastecimento));
    res.status(200).json(abastecimentosFormatados);
  } catch (err) {
    console.error("Erro ao buscar abastecimentos:", err);
    res.status(500).json({
      error: "Erro ao buscar abastecimentos: " + err.message
    });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const abastecimento = await Abastecimento.findById(req.params.id)
      .populate("caminhaoId");
    
    if (!abastecimento) {
      return res.status(404).json({
        error: "Abastecimento não encontrado."
      });
    }
    
    res.status(200).json(formatDoc(abastecimento));
  } catch (err) {
    console.error("Erro ao buscar abastecimento:", err);
    res.status(500).json({
      error: "Erro ao buscar abastecimento: " + err.message
    });
  }
});

// POST - adicionar novo abastecimento
router.post("/", async (req, res) => {
  console.log("Dados recebidos no POST:", req.body);

  let {
    caminhaoId,
    data,
    arlaLitro,
    valorLitroArla,
    litros,
    valorLitro,
    posto,
    odometro,
    tipoCombustivel,
    observacoes = ""
  } = req.body;

  // Extrair apenas o ID do caminhão se for um objeto
  if (caminhaoId && typeof caminhaoId === 'object') {
    caminhaoId = caminhaoId._id || caminhaoId.id || caminhaoId;
  }

  // Verificação dos campos obrigatórios
  if (!caminhaoId || !data || litros === undefined || valorLitro === undefined || 
      !posto || odometro === undefined || !tipoCombustivel || arlaLitro === undefined || valorLitroArla === undefined) {
    return res.status(400).json({
      error: "Campos obrigatórios ausentes.",
      camposFaltantes: {
        caminhaoId: !caminhaoId,
        data: !data,
        arlaLitro: arlaLitro === undefined,
        valorLitroArla: valorLitroArla === undefined,
        litros: litros === undefined,
        valorLitro: valorLitro === undefined,
        posto: !posto,
        odometro: odometro === undefined,
        tipoCombustivel: !tipoCombustivel
      }
    });
  }

  try {
    // Calcular valor total
    const valorTotalArla = Number(arlaLitro) * Number(valorLitroArla)
    const valorTotalFuel = Number(litros) * Number(valorLitro);
    const valorTotal = valorTotalArla + valorTotalFuel;

    const novoAbastecimento = new Abastecimento({
      caminhaoId,
      data,
      arlaLitro: Number(arlaLitro) ,
      valorLitroArla: Number(valorLitroArla),
      litros: Number(litros),
      valorLitro: Number(valorLitro),
      posto,
      odometro: Number(odometro),
      tipoCombustivel,
      observacoes,
      valorTotal
    });

    const abastecimentoSalvo = await novoAbastecimento.save();
    await abastecimentoSalvo.populate("caminhaoId");
    
    res.status(201).json(formatDoc(abastecimentoSalvo));
  } catch (err) {
    console.error("Erro ao salvar abastecimento:", err);
    res.status(500).json({
      error: "Erro ao salvar abastecimento: " + err.message,
      details: err.errors
    });
  }
});

// PUT - atualizar abastecimento por ID
router.put("/:id", async (req, res) => {
  try {
    console.log("ID do abastecimento:", req.params.id);
    console.log("Dados recebidos para atualização:", req.body);
    
    let dadosAtualizados = { ...req.body };
    
    // Extrair apenas o ID do caminhão se for um objeto
    if (dadosAtualizados.caminhaoId && typeof dadosAtualizados.caminhaoId === 'object') {
      dadosAtualizados.caminhaoId = dadosAtualizados.caminhaoId._id || dadosAtualizados.caminhaoId.id || dadosAtualizados.caminhaoId;
    }
    
    // Converter números
    if(dadosAtualizados.valorLitroArla !== undefined){
      dadosAtualizados.valorLitroArla = Number(dadosAtualizados.valorLitroArla);
    }
    if(dadosAtualizados.arlaLitro !== undefined){
      dadosAtualizados.arlaLitro = Number(dadosAtualizados.arlaLitro);
    }
    if (dadosAtualizados.litros !== undefined) {
      dadosAtualizados.litros = Number(dadosAtualizados.litros);
    }
    if (dadosAtualizados.valorLitro !== undefined) {
      dadosAtualizados.valorLitro = Number(dadosAtualizados.valorLitro);
    }
    if (dadosAtualizados.odometro !== undefined) {
      dadosAtualizados.odometro = Number(dadosAtualizados.odometro);
    }
    
    // Calcular valor total se litros ou valorLitro foram alterados
    if (dadosAtualizados.litros !== undefined || dadosAtualizados.valorLitro !== undefined) {
      const abastecimentoAtual = await Abastecimento.findById(req.params.id);
      const arlaLitro = dadosAtualizados.arlaLitro !== undefined ? dadosAtualizados.arlaLitro : abastecimentoAtual.arlaLitro;
      const valorLitroArla = dadosAtualizados.valorLitroArla !== undefined ? dadosAtualizados.valorLitroArla : abastecimentoAtual.valorLitroArla;
      const litros = dadosAtualizados.litros !== undefined ? dadosAtualizados.litros : abastecimentoAtual.litros;
      const valorLitro = dadosAtualizados.valorLitro !== undefined ? dadosAtualizados.valorLitro : abastecimentoAtual.valorLitro;
      const valorTotalArla = arlaLitro * valorLitroArla;
      const valorTotalFuel = litros * valorLitro;
      dadosAtualizados.valorTotal = valorTotalFuel + valorTotalArla ;
    }
    
    const abastecimentoAtualizado = await Abastecimento.findByIdAndUpdate(
      req.params.id,
      dadosAtualizados,
      { new: true, runValidators: true }
    ).populate("caminhaoId");

    if (!abastecimentoAtualizado) {
      return res.status(404).json({
        error: "Abastecimento não encontrado."
      });
    }

    res.status(200).json(formatDoc(abastecimentoAtualizado));
  } catch (err) {
    console.error("Erro detalhado ao atualizar:", err);
    res.status(500).json({
      error: "Erro ao atualizar abastecimento: " + err.message,
      details: err.errors
    });
  }
});

// DELETE - remover abastecimento por ID
router.delete("/:id", async (req, res) => {
  try {
    const abastecimentoDeletado = await Abastecimento.findByIdAndDelete(req.params.id);
    
    if (!abastecimentoDeletado) {
      return res.status(404).json({
        error: "Abastecimento não encontrado."
      });
    }

    res.status(200).json({
      message: "Abastecimento deletado com sucesso",
      id: abastecimentoDeletado._id.toString()
    });
  } catch (err) {
    console.error("Erro ao excluir abastecimento:", err);
    res.status(500).json({
      error: "Erro ao excluir abastecimento: " + err.message
    });
  }
});

// GET - abastecimentos por caminhão
router.get("/caminhao/:caminhaoId", async (req, res) => {
  try {
    const abastecimentos = await Abastecimento.find({ 
      caminhaoId: req.params.caminhaoId 
    })
    .populate("caminhaoId")
    .sort({ data: -1 });
    
    const abastecimentosFormatados = abastecimentos.map(abastecimento => formatDoc(abastecimento));
    res.status(200).json(abastecimentosFormatados);
  } catch (err) {
    console.error("Erro ao buscar abastecimentos por caminhão:", err);
    res.status(500).json({
      error: "Erro ao buscar abastecimentos: " + err.message
    });
  }
});

module.exports = router;
