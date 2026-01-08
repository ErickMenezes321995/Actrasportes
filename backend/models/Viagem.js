const mongoose = require("mongoose");

const ViagemSchema = new mongoose.Schema({
  origem: { type: String, required: true },
  destino: { type: String, required: true },
  motorista: { type: String, default: "" },
  viatura: { type: String, default: "" },
  dataInicio: { type: String, required: true },
  dataTermino: { type: String, default: "" },
  status: { type: String, default: "Pendente" },
  cliente: { type: String, default: "" },
  pesoCarga: { type: Number, default: 0 },
  valorMercadoria: { type: Number, default: 0 },
  cte: { type: String, default: "" },
  mdfe: { type: String, default: "" },
  nfe: { type: String, default: "" },
  pedido: { type: String, default: "" },
  observacao: { type: String, default: "" },
  odometro: { type: Number, default: 0 },
  transacoes: { type: Array, default: [] }
}, { timestamps: true });

module.exports = mongoose.model("Viagens", ViagemSchema);

