const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://ericksaraiva30:Manu080424@viagem.z1qglcj.mongodb.net/viagem?retryWrites=true&w=majority&appName=viagem")
  .then(() => console.log("✅ Conectado ao MongoDB Atlas"))
  .catch((err) => console.error("❌ Erro ao conectar no MongoDB", err));

// Rotas
app.use("/api/viagens", require("./routes/viagens"));
app.use("/api/motoristas", require("./routes/motoristas"));
app.use("/api/caminhoes", require("./routes/caminhoes"));
const transacoesRoutes = require("./routes/transacoes");
app.use("/api/viagens", transacoesRoutes);
const clientesRouter = require("./routes/Clientes");
app.use("/api/clientes", clientesRouter);
const fornecedoresRoutes = require("./routes/fornecedores");
app.use("/api/fornecedores", fornecedoresRoutes);
const abastecimentosRoutes = require("./routes/abastecimentos");
app.use("/api/abastecimentos", abastecimentosRoutes);
const trocaPneusRouter = require("./routes/trocaPneus");
app.use("/api/trocaPneus", trocaPneusRouter);
const trocaOleoRouter = require("./routes/trocaOleo");
app.use("/api/trocaOleo", trocaOleoRouter);
const manuPrevRoute = require('./routes/manuPrev');
app.use('/api/manuPrev', manuPrevRoute);
const manuCorretivaRouter = require("./routes/manucorre");
app.use("/api/manuCorretiva", manuCorretivaRouter);
const perfilRouter = require("./routes/perfil");
app.use("/api/perfil", perfilRouter);
const usuariosRouter = require("./routes/usuarios");
app.use("/api/usuarios", usuariosRouter);

// Adicione uma rota de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    message: 'Servidor está funcionando!'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  
  // ⭐⭐ IMPORTANTE: Iniciar o keep-alive apenas DEPOIS que o servidor estiver rodando ⭐⭐
  if (process.env.NODE_ENV === 'production') {
    const KeepAlive = require('./keep-alive');
    new KeepAlive().start();
  }
});