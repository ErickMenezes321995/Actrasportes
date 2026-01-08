const mongoose = require("mongoose");

const TransacaoSchema = new mongoose.Schema({
  idViagem: { type: mongoose.Schema.Types.ObjectId, ref: "Viagem", required: true },
  data: { type: String, required: true },
  descricao: { type: String, required: true },
  valor: { type: Number, required: true },
  responsavel: { type: String, default: "" },
  tipo: { type: String, enum: ["Receita", "Despesa", "Adiantamento"], required: true }
}, { timestamps: true });

module.exports = mongoose.model("Transacao", TransacaoSchema);
