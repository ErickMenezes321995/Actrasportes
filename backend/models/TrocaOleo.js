const mongoose = require("mongoose");

const TrocaOleoSchema = new mongoose.Schema({
  caminhaoId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Equipamentos", 
    required: true 
  },
  dataTroca: { 
    type: String, 
    required: true 
  },
  tipoOleo: { 
    type: String, 
    required: true 
  },
  quilometragem: { 
    type: Number, 
    required: true 
  },
  observacao: { 
    type: String, 
    default: "" 
  },
  status: { 
    type: String, 
    enum: ["Pendente", "Concluída", "Cancelada"], 
    default: "Pendente" 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model("TrocaOleo", TrocaOleoSchema, "trocasoleo");