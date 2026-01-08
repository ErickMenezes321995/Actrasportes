const mongoose = require("mongoose");

const MotoristaSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  telefone: { type: String, default: "" },
  email: { type: String, default: "" },
  cpf: { type: String, required: true, unique: true },
  rg: { type: String, default: "" },
  cnh: { type: String, required: true }, // Tipo da CNH: A, B, C, D, E
  validadeCnh: { type: String, default: "" }, // Formato YYYY-MM-DD
  endereco: { type: String, default: "" },
  status: { type: String, enum: ["Ativo", "Inativo"], default: "Ativo" },
  observacoes: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Motorista", MotoristaSchema);
