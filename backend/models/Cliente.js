const mongoose = require("mongoose");

const ClienteSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  cnpj: { type: String, required: true, unique: true },
  cidade: { type: String, default: "" },
  estado: { type: String, default: "" },
  email: { type: String, default: "" },
  telefone: { type: String, default: "" },
  endereco: { type: String, default: "" },
  cep: { type: String, default: "" },
  responsavel: { type: String, default: "" },
  dataCadastro: { type: String, default: "" },
  status: { type: String, enum: ["ativo", "inativo"], default: "ativo" },
  observacoes: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Cliente", ClienteSchema);
