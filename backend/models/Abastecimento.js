const mongoose = require("mongoose");

const AbastecimentoSchema = new mongoose.Schema({
  caminhaoId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Equipamentos",  
    required: true 
  },
  data: { 
    type: String, 
    required: true 
  },
  arlaLitro : { 
    type: Number, 
    required: true,
    min: 0
  },
   valorLitroArla: { 
    type: Number, 
    required: true,
    min: 0
  },
  litros: { 
    type: Number, 
    required: true,
    min: 0
  },
  valorLitro: { 
    type: Number, 
    required: true,
    min: 0
  },
  posto: { 
    type: String, 
    required: true 
  },
  odometro: { 
    type: Number, 
    required: true,
    min: 0
  },
  tipoCombustivel: { 
    type: String, 
    required: true 
  },
  observacoes: { 
    type: String, 
    default: "" 
  },
  valorTotal: {
    type: Number,
    required: true
  }
}, { 
  timestamps: true 
});

AbastecimentoSchema.pre('save', function(next) {
  const valorTotalArla = this.arlaLitro * this.valorLitroArla ;
  const valorTotalFuel = this.litros * this.valorLitro;
  this.valorTotal = valorTotalArla + valorTotalFuel;
  next();
});

module.exports = mongoose.model("Abastecimento", AbastecimentoSchema);