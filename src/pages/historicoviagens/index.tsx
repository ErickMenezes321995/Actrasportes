import React, { useEffect, useState,  useRef } from "react";
import {
  Box, Card, CardBody, CardHeader, Flex, Text, Heading, Button,
  Table, Thead, Tr, Th, Tbody, Td, Tag, useToast,  AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader,
  AlertDialogBody, AlertDialogFooter, Spinner
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ModalAdiantamento from "../../components/historicoviagem/ModalAdiantamento";
import ModalNovaReceita from "../../components/historicoviagem/ModalNovaReceita";
import ModalNovaDespesa from "../../components/historicoviagem/ModalNovaDespesa";


import { useDisclosure } from "@chakra-ui/react";


type TipoTransacao = "Receita" | "Despesa" | "Adiantamento";

interface Transacao {
  id: number;
  data: string;
  descricao: string;
  tipo: TipoTransacao;
  valor: number;
  responsavel: string;
}

interface Viagem {
  id: number;
  origem: string;
  destino: string;
  status: "Pendente" | "Em andamento" | "Concluída" | "Cancelada";
  transacoes: Transacao[];
}



const Historico = () => {
  const { id } = useParams<{ id: string }>();
  const toast = useToast();
  const [viagem, setViagem] = useState<Viagem | null>(null);
  const [receitas, setReceitas] = useState<number>(0);
  const [despesas, setDespesas] = useState<number>(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isModalNovaReceitaOpen, setIsModalNovaReceitaOpen] = useState(false);
  const [isModalNovaDespesaOpen, setIsModalNovaDespesaOpen] = useState(false);
  const [idParaDeletar, setIdParaDeletar] = useState<number | null>(null);
  const {
    isOpen: isConfirmOpen,
    onOpen: onConfirmOpen,
    onClose: onConfirmClose,
  } = useDisclosure();
  const cancelRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true); 

 useEffect(() => {
    let loadingTimeout: NodeJS.Timeout;

  async function fetchViagemComTransacoes() {
    try {
        setIsLoading(true);
        loadingTimeout = setTimeout(() => setIsLoading(false), 20000);

      const viagemResponse = await fetch(`https://gestaofrota.onrender.com/api/viagens/${id}`);
      // const viagemResponse = await fetch(`http://localhost:5000/api/viagens/${id}`);
      if (!viagemResponse.ok) throw new Error("Erro ao buscar viagem");

      const viagemData: Viagem = await viagemResponse.json();
      setViagem(viagemData);

      const transacoesResponse = await fetch(`https://gestaofrota.onrender.com/api/viagens/${id}/transacoes`);
      // const transacoesResponse = await fetch(`http://localhost:5000/api/viagens/${id}/transacoes`);
     if (!transacoesResponse.ok) throw new Error("Erro ao buscar transações");

     const transacoes: Transacao[] = await transacoesResponse.json();

        const totalReceitas = transacoes
          .filter((t) => t.tipo === "Receita")
          .reduce((acc, curr) => acc + curr.valor, 0);

        const totalDespesas = transacoes
          .filter((t) => t.tipo === "Despesa" || t.tipo === "Adiantamento")
          .reduce((acc, curr) => acc + curr.valor, 0);

        setReceitas(totalReceitas);
        setDespesas(totalDespesas);
        setViagem((v) => v ? { ...v, transacoes } : null);

        clearTimeout(loadingTimeout);
        setIsLoading(false);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setIsLoading(false);
      }
    }

    if (id) fetchViagemComTransacoes();

    return () => {
      if (loadingTimeout) clearTimeout(loadingTimeout);
    };
  }, [id]);

useEffect(() => {
  let loadingTimeout: NodeJS.Timeout;

  async function fetchViagemComTransacoes() {
    try {
      setIsLoading(true); // Ativa o loading no início
      loadingTimeout = setTimeout(() => setIsLoading(false), 20000);

      // 1. Busca os dados da viagem
      const viagemResponse = await fetch(`https://gestaofrota.onrender.com/api/viagens/${id}`);
      // const viagemResponse = await fetch(`http://localhost:5000/api/viagens/${id}`);
      if (!viagemResponse.ok) throw new Error("Erro ao buscar viagem");
      const viagemData: Viagem & { valorMercadoria?: string | number } = await viagemResponse.json();

      // 2. Busca as transações existentes
      const transacoesResponse = await fetch(`https://gestaofrota.onrender.com/api/viagens/${id}/transacoes`);
      // const transacoesResponse = await fetch(`http://localhost:5000/api/viagens/${id}/transacoes`);
      if (!transacoesResponse.ok) throw new Error("Erro ao buscar transações");
      let transacoes: Transacao[] = await transacoesResponse.json();

      // 3. Verifica e cria despesas automáticas (se necessário)
      const hasSeguroCarga = transacoes.some(t => t.descricao.includes("Seguro da Carga (Automático)"));
      
      if (!hasSeguroCarga && viagemData.valorMercadoria) {
        const hoje = new Date().toISOString().split('T')[0];
        const valorMercadoria = typeof viagemData.valorMercadoria === 'string' 
          ? parseFloat(viagemData.valorMercadoria.replace(',', '.')) 
          : viagemData.valorMercadoria;
        const valorSeguro = valorMercadoria * 0.001;
        
        const novaTransacao: Transacao = {
          id: viagemData.id * 1000 + 1,
          data: hoje,
          descricao: "Seguro da Carga (Automático)",
          tipo: "Despesa",
          valor: valorSeguro,
          responsavel: "Sistema"
        };

        transacoes = [...transacoes, novaTransacao];
        
        // Atualiza no servidor
        const updateResponse = await fetch(`https://gestaofrota.onrender.com/api/viagens/${id}/transacoes`, {
        // const updateResponse = await fetch(`http://localhost:5000/api/viagens/${id}/transacoes`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(transacoes),
        });

        if (!updateResponse.ok) throw new Error("Erro ao salvar seguro automático");
        transacoes = await updateResponse.json();
      }

      // 4. Calcula totais
      const totalReceitas = transacoes
        .filter((t) => t.tipo === "Receita")
        .reduce((acc, curr) => acc + curr.valor, 0);

      const totalDespesas = transacoes
        .filter((t) => t.tipo === "Despesa" || t.tipo === "Adiantamento")
        .reduce((acc, curr) => acc + curr.valor, 0);

      // 5. Atualiza todos os estados de uma vez
      setViagem({ ...viagemData, transacoes });
      setReceitas(totalReceitas);
      setDespesas(totalDespesas);

      clearTimeout(loadingTimeout);
      setIsLoading(false); // Desativa o loading apenas quando tudo estiver pronto

    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      clearTimeout(loadingTimeout);
      setIsLoading(false);
    }
  }

  if (id) fetchViagemComTransacoes();

  return () => {
    if (loadingTimeout) clearTimeout(loadingTimeout);
  };
}, [id]);

useEffect(() => {
  if (!viagem || !viagem.transacoes) return;

  const calcularTotais = () => {
    const totalReceitas = viagem.transacoes
      .filter((t) => t.tipo === "Receita")
      .reduce((acc, curr) => acc + curr.valor, 0);

    const totalDespesas = viagem.transacoes
      .filter((t) => t.tipo === "Despesa" || t.tipo === "Adiantamento")
      .reduce((acc, curr) => acc + curr.valor, 0);

    setReceitas(totalReceitas);
    setDespesas(totalDespesas);
  };

  calcularTotais();
}, [viagem]);

  const saldo = receitas - despesas;


  const finalizarViagem = async () => {
    if (!viagem) return;

    try {
       const response = await fetch(`https://gestaofrota.onrender.com/api/viagens/${viagem.id}`, {
      //const response = await fetch(`http://localhost:5000/api/viagens/${viagem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...viagem, status: "Concluída" }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar status");

      const data = await response.json();
      setViagem(data);

      toast({
        title: "Viagem finalizada com sucesso!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Erro ao finalizar viagem",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

const confirmarDelecaoTransacao = (id: number) => {
  setIdParaDeletar(id);
  onConfirmOpen();
};

const handleDeletarTransacao = async () => {
  if (!viagem || idParaDeletar === null) return;

  try {
    const response = await fetch(`https://gestaofrota.onrender.com/api/viagens/transacoes/${idParaDeletar}`, {
    // const response = await fetch(`http://localhost:5000/api/viagens/transacoes/${idParaDeletar}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Erro ao deletar transação");

    // Remove localmente
    const transacoesAtualizadas = viagem.transacoes.filter(t => t.id !== idParaDeletar);
    setViagem({ ...viagem, transacoes: transacoesAtualizadas });

    toast({
      title: "Transação deletada com sucesso!",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  } catch (err) {
    toast({
      title: "Erro ao deletar transação",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  } finally {
    onConfirmClose();
    setIdParaDeletar(null);
  }
};



const handleSalvarReceita = async (receita: {
  data: string;
  descricao: string;
  valor: number;
  responsavel: string;
  tipo: "Receita";
}) => {
  if (!viagem) return;

  const novaTransacao = {
    id: Date.now(),
    idViagem: viagem.id,
    ...receita,
  };

  const transacoesAtualizadas = [...(viagem.transacoes || []), novaTransacao];

  try {
    const response = await fetch(`https://gestaofrota.onrender.com/api/viagens/${viagem.id}/transacoes`, {
    // const response = await fetch(`http://localhost:5000/api/viagens/${viagem.id}/transacoes`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transacoesAtualizadas),
    });

    if (!response.ok) throw new Error("Erro ao salvar receita");

    const transacoesAtualizadasDoServidor = await response.json();
    setViagem({ ...viagem, transacoes: transacoesAtualizadasDoServidor });

    toast({
      title: "Receita adicionada com sucesso!",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  } catch (err) {
    toast({
      title: "Erro ao adicionar receita",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
};

const handleSalvarDespesa = async (despesa: {
  data: string;
  descricao: string;
  valor: number;
  responsavel: string;
  tipo: "Despesa";
}) => {
  if (!viagem) return;

  const novaTransacao = {
    id: Date.now(),
    idViagem: viagem.id,
    ...despesa,
  };

  const transacoesAtualizadas = [...(viagem.transacoes || []), novaTransacao];

  try {
    const response = await fetch(`https://gestaofrota.onrender.com/api/viagens/${viagem.id}/transacoes`, {
    // const response = await fetch(`http://localhost:5000/api/viagens/${viagem.id}/transacoes`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transacoesAtualizadas),
    });

    if (!response.ok) throw new Error("Erro ao salvar despesa");

    const transacoesAtualizadasDoServidor = await response.json();
    setViagem({ ...viagem, transacoes: transacoesAtualizadasDoServidor });

    toast({
      title: "Despesa adicionada com sucesso!",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  } catch (err) {
    toast({
      title: "Erro ao adicionar despesa",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
};

const handleSalvarAdiantamento = async (adiantamento: {
  data: string;
  descricao: string;
  valor: number;
  responsavel: string;
  tipo: "Adiantamento";
}) => {
  if (!viagem) return;

  // Cria a nova transação sem id manual
  const novaTransacao = {
    idViagem: viagem.id,
    ...adiantamento,
  };

  // Junta com as transações já existentes
  const transacoesAtualizadas = [...(viagem.transacoes || []), novaTransacao];

  try {
    const response = await fetch(
      `https://gestaofrota.onrender.com/api/viagens/${viagem.id}/transacoes`,
      // `http://localhost:5000/api/viagens/${viagem.id}/transacoes`,
      {
        method: "PUT", // mantém PUT igual despesa
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transacoesAtualizadas),
      }
    );

    if (!response.ok) throw new Error("Erro ao salvar adiantamento");

    const transacoesAtualizadasDoServidor = await response.json();

    // Atualiza o estado da viagem com o array retornado do servidor
    setViagem({ ...viagem, transacoes: transacoesAtualizadasDoServidor });

    toast({
      title: "Adiantamento registrado com sucesso!",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  } catch (err) {
    toast({
      title: "Erro ao registrar adiantamento",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
};


const gerarRelatorioPDF = () => {
  if (!viagem) return;

  const doc = new jsPDF();

  // LOGO EM BASE64 - SUBSTITUA POR SUA IMAGEM EM BASE64
  const logoBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/wAARCAH2BAADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9sAQwADAwMDAwMEAwMEBgQEBAYIBgYGBggKCAgICAgKDQoKCgoKCg0NDQ0NDQ0NDw8PDw8PEhISEhIUFBQUFBQUFBQU/9sAQwEDAwMFBQUJBQUJFQ4MDhUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUVFRUV/90ABABA/9oADAMBAAIRAxEAPwD68+Enwl+F2o/C3wVqGoeDdGubq60OwkmmeyhZ3d7dN7M+yvSP+FK/CL/oRtC/8AIP/iKZ8Ff+SQeAv+wBpv8A6TpXqNAHmP8AwpX4Rf8AQjaF/wCAEH/xFH/ClfhF/wBCNoX/AIAQf/EV6dRQB5j/AMKV+EX/AEI2hf8AgBB/8RR/wpX4Rf8AQjaF/wCAEH/xFenUUAeY/wDClfhF/wBCNoX/AIAQf/EUf8KV+EX/AEI2hf8AgBB/8RXp1FAHmP8AwpX4Rf8AQjaF/wCAEH/xFH/ClfhF/wBCNoX/AIAQf/EV6dRQB5j/AMKV+EX/AEI2hf8AgBB/8RR/wpX4Rf8AQjaF/wCAEH/xFenUUAeY/wDClfhF/wBCNoX/AIAQf/EUf8KV+EX/AEI2hf8AgBB/8RXp1FAHmP8AwpX4Rf8AQjaF/wCAEH/xFH/ClfhF/wBCNoX/AIAQf/EV6dRQB5j/AMKV+EX/AEI2hf8AgBB/8RR/wpX4Rf8AQjaF/wCAEH/xFenUUAeY/wDClfhF/wBCNoX/AIAQf/EUf8KV+EX/AEI2hf8AgBB/8RXp1FAHmP8AwpX4Rf8AQjaF/wCAEH/xFH/ClfhF/wBCNoX/AIAQf/EV6dRQB5j/AMKV+EX/AEI2hf8AgBB/8RR/wpX4Rf8AQjaF/wCAEH/xFenUUAeY/wDClfhF/wBCNoX/AIAQf/EUf8KV+EX/AEI2hf8AgBB/8RXp1FAHmP8AwpX4Rf8AQjaF/wCAEH/xFH/ClfhF/wBCNoX/AIAQf/EV6dRQB5j/AMKV+EX/AEI2hf8AgBB/8RR/wpX4Rf8AQjaF/wCAEH/xFenUUAeY/wDClfhF/wBCNoX/AIAQf/EUf8KV+EX/AEI2hf8AgBB/8RXp1FAHmP8AwpX4Rf8AQjaF/wCAEH/xFH/ClfhF/wBCNoX/AIAQf/EV6dRQB5j/AMKV+EX/AEI2hf8AgBB/8RR/wpX4Rf8AQjaF/wCAEH/xFenUUAeY/wDClfhF/wBCNoX/AIAQf/EUf8KV+EX/AEI2hf8AgBB/8RXp1FAHmP8AwpX4Rf8AQjaF/wCAEH/xFH/ClfhF/wBCNoX/AIAQf/EV6dRQB5j/AMKV+EX/AEI2hf8AgBB/8RR/wpX4Rf8AQjaF/wCAEH/xFenUUAeY/wDClfhF/wBCNoX/AIAQf/EUf8KV+EX/AEI2hf8AgBB/8RXp1FAHmP8AwpX4Rf8AQjaF/wCAEH/xFH/ClfhF/wBCNoX/AIAQf/EV6dRQB5j/AMKV+EX/AEI2hf8AgBB/8RR/wpX4Rf8AQjaF/wCAEH/xFenUUAeY/wDClfhF/wBCNoX/AIAQf/EUf8KV+EX/AEI2hf8AgBB/8RXp1FAHmP8AwpX4Rf8AQjaF/wCAEH/xFH/ClfhF/wBCNoX/AIAQf/EV6dRQB5j/AMKV+EX/AEI2hf8AgBB/8RR/wpX4Rf8AQjaF/wCAEH/xFenUUAeY/wDClfhF/wBCNoX/AIAQf/EUf8KV+EX/AEI2hf8AgBB/8RXp1FAHmP8AwpX4Rf8AQjaF/wCAEH/xFH/ClfhF/wBCNoX/AIAQf/EV6dRQB5j/AMKV+EX/AEI2hf8AgBB/8RR/wpX4Rf8AQjaF/wCAEH/xFenUUAeY/wDClfhF/wBCNoX/AIAQf/EUf8KV+EX/AEI2hf8AgBB/8RXp1FAHmP8AwpX4Rf8AQjaF/wCAEH/xFH/ClfhF/wBCNoX/AIAQf/EV6dRQB5j/AMKV+EX/AEI2hf8AgBB/8RR/wpX4Rf8AQjaF/wCAEH/xFenUUAeY/wDClfhF/wBCNoX/AIAQf/EUf8KV+EX/AEI2hf8AgBB/8RXp1FAHmP8AwpX4Rf8AQjaF/wCAEH/xFH/ClfhF/wBCNoX/AIAQf/EV6dRQB5j/AMKV+EX/AEI2hf8AgBB/8RR/wpX4Rf8AQjaF/wCAEH/xFenUUAeY/wDClfhF/wBCNoX/AIAQf/EUf8KV+EX/AEI2hf8AgBB/8RXp1FAHmP8AwpX4Rf8AQjaF/wCAEH/xFH/ClfhF/wBCNoX/AIAQf/EV6dRQB5j/AMKV+EX/AEI2hf8AgBB/8RR/wpX4Rf8AQjaF/wCAEH/xFenUUAeY/wDClfhF/wBCNoX/AIAQf/EUf8KV+EX/AEI2hf8AgBB/8RXp1FAHmP8AwpX4Rf8AQjaF/wCAEH/xFH/ClfhF/wBCNoX/AIAQf/EV6dRQB5j/AMKV+EX/AEI2hf8AgBB/8RR/wpX4Rf8AQjaF/wCAEH/xFenUUAeY/wDClfhF/wBCNoX/AIAQf/EUf8KV+EX/AEI2hf8AgBB/8RXp1FAHmP8AwpX4Rf8AQjaF/wCAEH/xFH/ClfhF/wBCNoX/AIAQf/EV6dRQB5j/AMKV+EX/AEI2hf8AgBB/8RR/wpX4Rf8AQjaF/wCAEH/xFenUUAeY/wDClfhF/wBCNoX/AIAQf/EUf8KV+EX/AEI2hf8AgBB/8RXp1FAHmP8AwpX4Rf8AQjaF/wCAEH/xFH/ClfhF/wBCNoX/AIAQf/EV6dRQB5j/AMKV+EX/AEI2hf8AgBB/8RR/wpX4Rf8AQjaF/wCAEH/xFenUUAeY/wDClfhF/wBCNoX/AIAQf/EUf8KV+EX/AEI2hf8AgBB/8RXp1FAHmP8AwpX4Rf8AQjaF/wCAEH/xFH/ClfhF/wBCNoX/AIAQf/EV6dRQB5j/AMKV+EX/AEI2hf8AgBB/8RR/wpX4Rf8AQjaF/wCAEH/xFenUUAeY/wDClfhF/wBCNoX/AIAQf/EUf8KV+EX/AEI2hf8AgBB/8RXp1FAHmP8AwpX4Rf8AQjaF/wCAEH/xFH/ClfhF/wBCNoX/AIAQf/EV6dRQB5j/AMKV+EX/AEI2hf8AgBB/8RR/wpX4Rf8AQjaF/wCAEH/xFenUUAeY/wDClfhF/wBCNoX/AIAQf/EUf8KV+EX/AEI2hf8AgBB/8RXp1FAHmP8AwpX4Rf8AQjaF/wCAEH/xFH/ClfhF/wBCNoX/AIAQf/EV6dRQB5j/AMKV+EX/AEI2hf8AgBB/8RR/wpX4Rf8AQjaF/wCAEH/xFenUUAeY/wDClfhF/wBCNoX/AIAQf/EUf8KV+EX/AEI2hf8AgBB/8RXp1FAHmP8AwpX4Rf8AQjaF/wCAEH/xFH/ClfhF/wBCNoX/AIAQf/EV6dRQB5j/AMKV+EX/AEI2hf8AgBB/8RR/wpX4Rf8AQjaF/wCAEH/xFenUUAeY/wDClfhF/wBCNoX/AIAQf/EUf8KV+EX/AEI2hf8AgBB/8RXp1FAHmP8AwpX4Rf8AQjaF/wCAEH/xFH/ClfhF/wBCNoX/AIAQf/EV6dRQB5j/AMKV+EX/AEI2hf8AgBB/8RR/wpX4Rf8AQjaF/wCAEH/xFenUUAeY/wDClfhF/wBCNoX/AIAQf/EV578U/hN8MNM+HniPUdO8HaNaXdrYyyRTw2UKyRv/AHlfZX0hXmfxj/5Jd4s/7B0v8qAP/9D9Afgr/wAkg8Bf9gDTf/SdK9Rry74K/wDJIPAX/YA03/0nSvUaACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK8z+Mf8AyS7xZ/2Dpf5V6ZXmfxj/AOSXeLP+wdL/ACoA/9H9Afgr/wAkg8Bf9gDTf/SdK9Rry74K/wDJIPAX/YA03/0nSvUaACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK8z+Mf8AyS7xZ/2Dpf5V6ZXmfxj/AOSXeLP+wdL/ACoA/9L9Afgr/wAkg8Bf9gDTf/SdK9Rry74K/wDJIPAX/YA03/0nSvUaACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK8z+Mf8AyS7xZ/2Dpf5V6ZXmfxj/AOSXeLP+wdL/ACoA/9P9Afgr/wAkg8Bf9gDTf/SdK9Rry74K/wDJIPAX/YA03/0nSvUaACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK8z+Mf8AyS7xZ/2Dpf5V6ZXmfxj/AOSXeLP+wdL/ACoA/9T9Afgr/wAkg8Bf9gDTf/SdK9Rry74K/wDJIPAX/YA03/0nSvUaACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK8z+Mf8AyS7xZ/2Dpf5V6ZXmfxj/AOSXeLP+wdL/ACoA/9X9Afgr/wAkg8Bf9gDTf/SdK9Rry74K/wDJIPAX/YA03/0nSvUaACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK8z+Mf8AyS7xZ/2Dpf5V6ZXmfxj/AOSXeLP+wdL/ACoA/9b9Afgr/wAkg8Bf9gDTf/SdK9Rry74K/wDJIPAX/YA03/0nSvUaACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKK5Lxb428K+A9LXWfGGrW+j6e8ywLPcttXzJPuLQB1tFeE/8NNfAT/ooOj/APf6k/4aa+AX/RQdH/7/AFAHu9FeEf8ADTXwC/6KDo//AH+o/wCGmvgF/wBFB0f/AL/UAe70V4R/w018Av8AooOj/wDf6j/hpr4Bf9FB0f8A7/UAe70V4R/w018Av+ig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DBJ5scdyiuqtWro+j6ZoVhDpWkWsdlY2q7YYYhtVVrXoo/vh7aXL7Lm90KKKKDMKKKKACiiigAooooAKKKKACiiigArzP4x/8ku8Wf8AYOl/lXpleZ/GP/kl3iz/ALB0v8qAP//S/QH4K/8AJIPAX/YA03/0nSvUa8u+Cv8AySDwF/2ANN/9J0r1GgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACvM/jH/AMku8Wf9g6X+VemV5n8Y/wDkl3iz/sHS/wAqAP/T/QH4K/8AJIPAX/YA03/0nSvUa8u+Cv8AySDwF/2ANN/9J0r1GgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACvM/jH/AMku8Wf9g6X+VemV5n8Y/wDkl3iz/sHS/wAqAP/U/QH4K/8AJIPAX/YA03/0nSvUa8u+Cv8AySDwF/2ANN/9J0r1GgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACvM/jH/AMku8Wf9g6X+VemV5n8Y/wDkl3iz/sHS/wAqAP/V/QH4K/8AJIPAX/YA03/0nSvUa8u+Cv8AySDwF/2ANN/9J0r1GgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACvM/jH/AMku8Wf9g6X+VemV5n8Y/wDkl3iz/sHS/wAqAP/W9d+G/wC1R4S0D4f+FtAn0TUZZdK0mytXkQxBWKW6LuXL123/AA2L4L/6AGqfnB/8XX5xaB/yCLL/AK9rX/0UtX6AP0O/4bF8F/8AQA1T84P/AIuj/hsXwX/0ANU/OD/4uvzxooA/Q7/hsXwX/wBADVPzg/8Ai6P+GxfBf/QA1T84P/i6/PGigD9Dv+GxfBf/AEANU/OD/wCLo/4bF8F/9ADVPzg/+Lr88aKAP0O/4bF8F/8AQA1T84P/AIuj/hsXwX/0ANU/OD/4uvzxooA/Q7/hsXwX/wBADVPzg/8Ai6P+GxfBf/QA1T84P/i6/PGigD9Dv+GxfBf/AEANU/OD/wCLo/4bF8F/9ADVPzg/+Lr88aKAP0O/4bF8F/8AQA1T84P/AIuj/hsXwX/0ANU/OD/4uvzxooA/Q7/hsXwX/wBADVPzg/8Ai6P+GxfBf/QA1T84P/i6/PGigD9Dv+GxfBf/AEANU/OD/wCLo/4bF8F/9ADVPzg/+Lr88aKAP0O/4bF8F/8AQA1T84P/AIuj/hsXwX/0ANU/OD/4uvzx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";

  try {
    // Adicionar logo no cabeçalho
    doc.addImage(logoBase64, 'PNG', 15, 10, 30, 15);
  } catch (error) {
    console.warn('Erro ao adicionar logo, continuando sem ela...', error);
  }

  // Cabeçalho
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text("Relatório da Viagem", 105, 20, { align: "center" });

  doc.setFontSize(11);
  doc.setTextColor(90);

  autoTable(doc, {
    startY: 35,
    head: [["Campo", "Valor"]],
    body: [
      ["Origem", viagem.origem],
      ["Destino", viagem.destino],
      ["Motorista", (viagem as any).motorista || "-"],
      ["Cliente", (viagem as any).cliente || "-"],
      ["Viatura", (viagem as any).viatura || "-"],
      ["Data Início", new Date((viagem as any).dataInicio).toLocaleString("pt-BR")],
      ["Data Término", new Date((viagem as any).dataTermino).toLocaleString("pt-BR")],
      ["Odômetro", (viagem as any).odometro?.toString() || "-"],
      ["Peso da Carga", (viagem as any).pesoCarga || "-"],
      ["Valor da Mercadoria",(viagem as any).valorMercadoria
          ? Number((viagem as any).valorMercadoria).toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })
          : "-",
      ],
      ["CTE", (viagem as any).cte || "-"],
      ["MDFE", (viagem as any).mdfe || "-"],
      ["NFE", (viagem as any).nfe || "-"],
      ["Pedido", (viagem as any).pedido || "-"],
      ["Observações", (viagem as any).observacao || "-"],
    ],
    theme: "striped",
    styles: { fontSize: 10, cellPadding: 2 },
    headStyles: { fillColor: [52, 152, 219], textColor: 255 },
    didDrawPage: (data) => {
      try {
        // Adicionar logo em todas as páginas
        doc.addImage(logoBase64, 'PNG', 15, 10, 30, 15);
      } catch (error) {
        // Ignora erro se não conseguir adicionar a logo
      }
      
      // Atualiza a posição final mesmo em nova página
      if (data.cursor) {
        (doc as any).finalTableY = data.cursor.y;
      }
    },
  });

  const afterFirstTableY = (doc as any).lastAutoTable.finalY + 10;

  autoTable(doc, {
    startY: afterFirstTableY,
    head: [["Data", "Descrição", "Tipo", "Valor (R$)", "Responsável"]],
    body: viagem.transacoes.map((t) => [
      new Date(t.data).toLocaleDateString("pt-BR"),
      t.descricao,
      t.tipo,
      t.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
      t.responsavel,
    ]),
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { top: 10 },
    didDrawPage: (data) => {
      try {
        // Adicionar logo em todas as páginas
        doc.addImage(logoBase64, 'PNG', 15, 10, 30, 15);
      } catch (error) {
        // Ignora erro se não conseguir adicionar a logo
      }
      
      if (data.cursor) {
        (doc as any).finalTableY = data.cursor.y;
      }
    },
  });

  const posResumo = (doc as any).finalTableY || (doc as any).lastAutoTable.finalY;

  if (posResumo + 40 > doc.internal.pageSize.height) {
    doc.addPage();
    try {
      // Adicionar logo também na nova página
      doc.addImage(logoBase64, 'PNG', 15, 10, 30, 15);
    } catch (error) {
      // Ignora erro se não conseguir adicionar a logo
    }
  }

  const totalReceitas = viagem.transacoes
    .filter((t) => t.tipo === "Receita")
    .reduce((acc, curr) => acc + curr.valor, 0);

  const totalDespesas = viagem.transacoes
    .filter((t) => t.tipo === "Despesa" || t.tipo === "Adiantamento")
    .reduce((acc, curr) => acc + curr.valor, 0);

  const saldo = totalReceitas - totalDespesas;

  const yResumo = doc.internal.pageSize.height - 50;

  doc.setDrawColor(220);
  doc.line(14, yResumo - 8, 196, yResumo - 8);

  doc.setFontSize(14);
  doc.setTextColor(40);
  doc.text("Resumo Financeiro", 14, yResumo);

  doc.setFontSize(11);
  doc.setTextColor(60);
  doc.text(
    `Receitas: R$ ${totalReceitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    14,
    yResumo + 10
  );
  doc.text(
    `Despesas: R$ ${totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    14,
    yResumo + 18
  );

  doc.setTextColor(saldo >= 0 ? "green" : "red");
  doc.text(
    `Saldo Final: R$ ${saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
    14,
    yResumo + 26
  );

  // Rodapé com data
  doc.setFontSize(9);
  doc.setTextColor(130);
  doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, 14, doc.internal.pageSize.height - 10);
  
  try {
    // Adicionar pequena logo no rodapé
    doc.addImage(logoBase64, 'PNG', 180, doc.internal.pageSize.height - 15, 15, 7.5);
  } catch (error) {
    // Ignora erro se não conseguir adicionar a logo
  }

  // Exporta
  doc.save(`relatorio_viagem_${viagem.id}.pdf`);
};

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      </Flex>
    );
  }

  if (!viagem) {
    return <Text px={4} pt={10}>Carregando ou viagem não encontrada...</Text>;
  }
return (
    <Box bg="transparent" minH="100vh" py={6} marginTop="60px">
      {isLoading ? (
        <Flex justify="center" align="center" h="100vh">
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.600"
            size="xl"
          />
        </Flex>
      ) : !viagem ? (
        <Text px={4} pt={10}>Carregando ou viagem não encontrada...</Text>
      ) : (
        <Box maxW="1300px" mx="auto" px={4}>
          {/* Cabeçalho da viagem */}
          <Card mb={6} boxShadow="0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)" borderRadius="4px" border="1px solid #d0d0d0">
            <CardHeader bg="white" py={4} borderBottom="1px solid #d0d0d0">
              <Flex justify="space-between" align="center" flexWrap="wrap">
                <Heading size="md" color="#15457b" fontWeight="bold" fontFamily="Arial, sans-serif">
                  {viagem.origem} → {viagem.destino}
                </Heading>
                <Flex gap={3} align="center">
                  <Button
                    bg="#dfeaf5"
                    color="#15457b"
                    border="1px solid #a3bde3"
                    borderRadius="3px"
                    fontWeight="normal"
                    _hover={{ bg: "#c5d5e6" }}
                    onClick={gerarRelatorioPDF}
                    fontSize="13px"
                    height="28px"
                    px={3}
                  >
                    Exportar PDF
                  </Button>

                  <Button
                    bg="#e9f0e9"
                    color="#385d33"
                    border="1px solid #a3c293"
                    borderRadius="3px"
                    fontWeight="normal"
                    _hover={{ bg: "#d5e2d1" }}
                    onClick={finalizarViagem}
                    isDisabled={viagem.status === "Concluída"}
                    fontSize="13px"
                    height="28px"
                    px={3}
                  >
                    Finalizar Viagem
                  </Button>
                  
                  <Box
                    bg={
                      viagem.status === "Concluída"
                        ? "#e6f4e6"
                        : viagem.status === "Cancelada"
                        ? "#f9e6e6"
                        : viagem.status === "Pendente"
                        ? "#fef0e6"
                        : viagem.status === "Em andamento"
                        ? "#e6f0f5"
                        : "#f0f0f0"
                    }
                    color={
                      viagem.status === "Concluída"
                        ? "#2a6b2a"
                        : viagem.status === "Cancelada"
                        ? "#a33d3d"
                        : viagem.status === "Pendente"
                        ? "#b35926"
                        : viagem.status === "Em andamento"
                        ? "#1f5c7a"
                        : "#666666"
                    }
                    border="1px solid"
                    borderColor={
                      viagem.status === "Concluída"
                        ? "#9ecf9e"
                        : viagem.status === "Cancelada"
                        ? "#e0a8a8"
                        : viagem.status === "Pendente"
                        ? "#f5c9a4"
                        : viagem.status === "Em andamento"
                        ? "#9ec5d9"
                        : "#d0d0d0"
                    }
                    px={3}
                    py={1}
                    borderRadius="3px"
                    fontWeight="normal"
                    fontSize="12px"
                    display="flex"
                    alignItems="center"
                  >
                    {viagem.status === "Concluída" && "Concluída"}
                    {viagem.status === "Cancelada" && "Cancelada"}
                    {viagem.status === "Pendente" && "Pendente"}
                    {viagem.status === "Em andamento" && "Em Andamento"}
                  </Box>
                </Flex>
              </Flex>
            </CardHeader>
          </Card>

          {/* Cards de resumo financeiro */}
          <Flex mb={8} gap={4} flexWrap="wrap">
            <Card flex="1" minW="200px" bg="white" boxShadow="0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)" border="1px solid #d0d0d0" borderRadius="4px">
              <CardHeader py={3}>
                <Text fontWeight="bold" color="#666666" fontSize="13px">Total de Receitas</Text>
                <Text fontSize="lg" color="#2a6b2a" fontWeight="bold" mt={1}>
                  R$ {receitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </Text>
              </CardHeader>
            </Card>
            
            <Card flex="1" minW="200px" bg="white" boxShadow="0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)" border="1px solid #d0d0d0" borderRadius="4px">
              <CardHeader py={3}>
                <Text fontWeight="bold" color="#666666" fontSize="13px">Total de Despesas</Text>
                <Text fontSize="lg" color="#a33d3d" fontWeight="bold" mt={1}>
                  R$ {despesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </Text>
              </CardHeader>
            </Card>
            
            <Card flex="1" minW="200px" bg="white" boxShadow="0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)" border="1px solid #d0d0d0" borderRadius="4px">
              <CardHeader py={3}>
                <Text fontWeight="bold" color="#666666" fontSize="13px">Saldo</Text>
                <Text
                  fontSize="lg"
                  color={saldo >= 0 ? "#2a6b2a" : "#a33d3d"}
                  fontWeight="bold"
                  mt={1}
                >
                  R$ {saldo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </Text>
              </CardHeader>
            </Card>
          </Flex>

          {/* Tabela de transações */}
          <Card bg="white" boxShadow="0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)" border="1px solid #d0d0d0" borderRadius="4px" overflow="hidden">
            <CardHeader bg="#dfeaf5" py={3} borderBottom="1px solid #a3bde3">
              <Flex justify="space-between" align="center" flexWrap="wrap">
                <Heading size="sm" color="#15457b" fontWeight="bold" fontFamily="Arial, sans-serif">
                  Transações Financeiras
                </Heading>
                <Flex gap={2} flexWrap="wrap" mt={{ base: 2, md: 0 }}>
                  <Button 
                    bg="#e6f0f5" 
                    color="#1f5c7a" 
                    border="1px solid #9ec5d9" 
                    borderRadius="3px"
                    fontWeight="normal"
                    _hover={{ bg: "#d4e3ec" }}
                    onClick={onOpen}
                    fontSize="13px"
                    height="28px"
                    px={3}
                  >
                    Novo Adiantamento
                  </Button>
                  
                  <Button 
                    bg="#e6f4e6" 
                    color="#2a6b2a" 
                    border="1px solid #9ecf9e" 
                    borderRadius="3px"
                    fontWeight="normal"
                    _hover={{ bg: "#d5e8d5" }}
                    onClick={() => setIsModalNovaReceitaOpen(true)}
                    fontSize="13px"
                    height="28px"
                    px={3}
                  >
                    Nova Receita
                  </Button>
                  
                  <Button 
                    bg="#f9e6e6" 
                    color="#a33d3d" 
                    border="1px solid #e0a8a8" 
                    borderRadius="3px"
                    fontWeight="normal"
                    _hover={{ bg: "#f2d6d6" }}
                    onClick={() => setIsModalNovaDespesaOpen(true)}
                    fontSize="13px"
                    height="28px"
                    px={3}
                  >
                    Nova Despesa
                  </Button>
                </Flex>
              </Flex>
            </CardHeader>

            <CardBody p={0}>
              <Table variant="simple" size="sm">
                <Thead bg="#f5f5f5">
                  <Tr>
                    <Th borderColor="#e0e0e0" color="#666666" fontSize="12px" fontWeight="bold" py={2}>Data</Th>
                    <Th borderColor="#e0e0e0" color="#666666" fontSize="12px" fontWeight="bold" py={2}>Descrição</Th>
                    <Th borderColor="#e0e0e0" color="#666666" fontSize="12px" fontWeight="bold" py={2}>Tipo</Th>
                    <Th borderColor="#e0e0e0" color="#666666" fontSize="12px" fontWeight="bold" py={2}>Valor</Th>
                    <Th borderColor="#e0e0e0" color="#666666" fontSize="12px" fontWeight="bold" py={2}>Responsável</Th>
                    <Th borderColor="#e0e0e0" color="#666666" fontSize="12px" fontWeight="bold" py={2}>Ações</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {viagem.transacoes.map((transacao) => (
                    <Tr key={transacao.id} _even={{ bg: "#f9f9f9" }} _hover={{ bg: "#f0f7ff" }}>
                      <Td borderColor="#e0e0e0" fontSize="13px" py={2}>{new Date(transacao.data).toLocaleDateString("pt-BR")}</Td>
                      <Td borderColor="#e0e0e0" fontSize="13px" py={2}>{transacao.descricao}</Td>
                      <Td borderColor="#e0e0e0" py={2}>
                        <Box
                          display="inline-block"
                          px={2}
                          py={1}
                          borderRadius="3px"
                          fontSize="12px"
                          fontWeight="bold"
                          color={
                            transacao.tipo === "Receita"
                              ? "#2a6b2a"
                              : transacao.tipo === "Adiantamento"
                              ? "#1f5c7a"
                              : "#a33d3d"
                          }
                          bg={
                            transacao.tipo === "Receita"
                              ? "#e6f4e6"
                              : transacao.tipo === "Adiantamento"
                              ? "#e6f0f5"
                              : "#f9e6e6"
                          }
                          border="1px solid"
                          borderColor={
                            transacao.tipo === "Receita"
                              ? "#9ecf9e"
                              : transacao.tipo === "Adiantamento"
                              ? "#9ec5d9"
                              : "#e0a8a8"
                          }
                        >
                          {transacao.tipo}
                        </Box>
                      </Td>
                      <Td borderColor="#e0e0e0" fontSize="13px" py={2}>
                        R$ {transacao.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </Td>
                      <Td borderColor="#e0e0e0" fontSize="13px" py={2}>{transacao.responsavel}</Td>
                      <Td borderColor="#e0e0e0" py={2}>
                        <Button
                          bg="#f9e6e6"
                          color="#a33d3d"
                          border="1px solid #e0a8a8"
                          borderRadius="3px"
                          fontWeight="normal"
                          _hover={{ bg: "#f2d6d6" }}
                          size="xs"
                          onClick={() => confirmarDelecaoTransacao(transacao.id)}
                          fontSize="12px"
                          height="24px"
                          px={2}
                        >
                          Deletar
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </CardBody>
          </Card>
        </Box>
      )}

      {/* Modais (mantidos iguais) */}
      <ModalNovaDespesa
        isOpen={isModalNovaDespesaOpen}
        onClose={() => setIsModalNovaDespesaOpen(false)}
        onSalvar={handleSalvarDespesa}
      />

      <ModalNovaReceita
        isOpen={isModalNovaReceitaOpen}
        onClose={() => setIsModalNovaReceitaOpen(false)}
        onSalvar={handleSalvarReceita}
      />

      <ModalAdiantamento
        isOpen={isOpen}
        onClose={onClose}
        onSalvar={handleSalvarAdiantamento}
      />

      <AlertDialog
        isOpen={isConfirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={onConfirmClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="4px" border="1px solid #d0d0d0">
            <AlertDialogHeader fontSize="md" fontWeight="bold" bg="#f5f5f5" borderBottom="1px solid #e0e0e0" py={3}>
              Confirmar Exclusão
            </AlertDialogHeader>

            <AlertDialogBody py={4}>
              Tem certeza que deseja excluir esta transação? Essa ação não pode ser desfeita.
            </AlertDialogBody>

            <AlertDialogFooter borderTop="1px solid #e0e0e0" py={3}>
              <Button 
                ref={cancelRef} 
                onClick={onConfirmClose}
                bg="#f0f0f0"
                color="#666666"
                border="1px solid #d0d0d0"
                borderRadius="3px"
                fontWeight="normal"
                _hover={{ bg: "#e5e5e5" }}
                fontSize="13px"
                height="28px"
                px={3}
              >
                Cancelar
              </Button>
              <Button 
                bg="#f9e6e6"
                color="#a33d3d"
                border="1px solid #e0a8a8"
                borderRadius="3px"
                fontWeight="normal"
                _hover={{ bg: "#f2d6d6" }}
                onClick={handleDeletarTransacao} 
                ml={3}
                fontSize="13px"
                height="28px"
                px={3}
              >
                Deletar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default Historico;
