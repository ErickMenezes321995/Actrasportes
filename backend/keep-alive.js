// keep-alive.js - Versão melhorada
const https = require('https');

class KeepAlive {
  constructor() {
    this.url = process.env.RENDER_URL || 'https://gestaofrota.onrender.com';
    this.healthEndpoint = this.url + '/health'; // Usando a rota health
    this.interval = 8 * 60 * 1000; // 10 minutos
    this.timeout = 10000; // 10 segundos de timeout
  }

  start() {
    console.log(`🔄 Keep-alive iniciado para: ${this.healthEndpoint}`);
    console.log(`⏰ Ping a cada ${this.interval / 60000} minutos`);
    
    // Primeiro ping após 5 segundos (para garantir que o servidor está up)
    setTimeout(() => this.ping(), 5000);
    
    // Ping periódico
    setInterval(() => this.ping(), this.interval);
  }

  ping() {
    const startTime = Date.now();
    const timestamp = new Date().toLocaleString('pt-BR');
    
    const req = https.get(this.healthEndpoint, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const duration = Date.now() - startTime;
        try {
          const healthData = JSON.parse(data);
          console.log(`✅ [${timestamp}] Ping OK - Status: ${res.statusCode} - ${duration}ms - Uptime: ${healthData.uptime}s`);
        } catch {
          console.log(`✅ [${timestamp}] Ping OK - Status: ${res.statusCode} - ${duration}ms`);
        }
      });
    });
    
    req.setTimeout(this.timeout, () => {
      req.destroy();
      console.log(`⏰ [${timestamp}] Timeout após ${this.timeout}ms`);
    });
    
    req.on('error', (err) => {
      console.log(`❌ [${timestamp}] Erro: ${err.message}`);
    });
  }
}

module.exports = KeepAlive;