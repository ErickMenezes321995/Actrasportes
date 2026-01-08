const mongoose = require("mongoose");

const FornecedorSchema = new mongoose.Schema({
  razaoSocial: { type: String, required: true },
  nomeFantasia: { type: String, default: "" },
  cnpj: { type: String, required: true, unique: true },
  inscricaoEstadual: { type: String, default: "" },
  segmento: { type: String, default: "" },
  produtosServicos: [{ type: String }],
  cidade: { type: String, default: "" },
  estado: { type: String, default: "" },
  email: { type: String, default: "" },
  telefone: { type: String, default: "" },
  endereco: { type: String, default: "" },
  cep: { type: String, default: "" },
  responsavel: { type: String, default: "" },
  cargoResponsavel: { type: String, default: "" },
  dataCadastro: { type: String, default: "" },
  status: { type: String, enum: ["ativo", "inativo"], default: "ativo" },
  condicoesPagamento: { type: String, default: "" },
  observacoes: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Fornecedor", FornecedorSchema);
