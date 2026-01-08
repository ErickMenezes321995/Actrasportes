const mongoose = require("mongoose");

const TrocaPneuSchema = new mongoose.Schema({
  caminhaoId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Equipamentos", 
    required: true 
  },
  codigoPneu: { type: String, required: true },
  dataTroca: { type: String, required: true },
  posicao: { type: String, required: true },
  marca: { type: String, required: true },
  observacao: { type: String, default: "" },
  valor: { type: Number, required: true },
  tipo: { 
    type: String, 
    enum: ["Troca", "Reparo", "Preventiva"], 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model("trocapneus", TrocaPneuSchema);