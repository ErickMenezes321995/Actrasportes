const mongoose = require("mongoose");

const ManutencaoPreventivaSchema = new mongoose.Schema({
  caminhaoId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Equipamentos", 
    required: true 
  },
  data: { 
    type: String, 
    required: true 
  },
  tipo: { 
    type: String, 
    enum: ["Preventiva", "Corretiva", "Preditiva"], 
    required: true 
  },
  quilometragem: { 
    type: Number, 
    required: true,
    min: 0
  },
  oficina: { 
    type: String, 
    required: true 
  },
  custo: { 
    type: Number, 
    required: true,
    min: 0
  },
  proximaRevisao: { 
    type: String, 
    required: true 
  },
  observacoes: { 
    type: String, 
    default: "" 
  },
  status: { 
    type: String, 
    enum: ["Agendada", "Concluída", "Cancelada", "Atrasada"], 
    default: "Agendada" 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model("ManutencaoPreventiva", ManutencaoPreventivaSchema);