// src/types/Caminhao.ts

export interface Documentacao {
  crlv?: string;
  ipvaPago?: boolean;
  seguro?: string;
}

export interface Caminhao {
  id: number;
  placa: string;
  modelo: string;
  ano: string;
  renavam: string;
  chassi: string;
  status: string;
  mecanico?: string;
  trocaOleoData?: string;
  ultimaManutencao?: string;
  observacoes?: string;
  cor?: string;
  tipoCombustivel?: string;
  quilometragemAtual?: number;
  numeroEixos?: number;
  proximaRevisao?: string;
  pesoTotal?: string;
  capacidadeTanque?: string;
  documentacao?: Documentacao;
}
