const mongoose = require("mongoose");

const EquipamentoSchema = new mongoose.Schema({
  placa: { type: String, required: true, unique: true },
  modelo: { type: String, required: true },
  ano: { type: String, default: "" },
  renavam: { type: String, default: "" },
  chassi: { type: String, default: "" },
  status: { type: String, enum: ["Ativo", "Inativo"], default: "Ativo" },
  mecanico: { type: String, default: "" },
  trocaOleoData: { type: Date, default: null },
  ultimaManutencao: { type: Date, default: null },
  observacoes: { type: String, default: "" },
  cor: { type: String, default: "" },
  tipoCombustivel: { type: String, default: "" },
  quilometragemAtual: { type: Number, default: 0 },
  numeroEixos: { type: Number, default: 0 },
  proximaRevisao: { type: Date, default: null },
  pesoTotal: { type: String, default: "" },
  capacidadeTanque: { type: String, default: "" },
  documentacao: {
    crlv: { type: String, default: "" },
    ipvaPago: { type: Boolean, default: false },
    seguro: { type: String, default: "" },
    seguroVeicular: { type: String, default: "" },
  }
}, { timestamps: true });

module.exports = mongoose.model("Equipamentos", EquipamentoSchema);
