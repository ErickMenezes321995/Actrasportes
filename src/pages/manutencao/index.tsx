// src/pages/preventiva/index.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  IconButton,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  chakra,
  useToast,
  useDisclosure,
  Button,
  Spinner,
  Center,
  Badge
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import NovoManutencaoModal from "../../components/manutencao/novo";
import EditarManutencaoModal from "../../components/manutencao/editar";
import DetalhesManutencaoModal from "../../components/manutencao/detalhes";
import Dashboardprev from "../../components/manutencao/dashboard";

interface CaminhaoInfo {
  _id?: string;
  id?: string;
  placa: string;
  modelo: string;
}

interface ManutencaoPreventiva {
  id: string;
  caminhaoId: string | CaminhaoInfo;
  data: string;
  tipo: string;
  quilometragem: number;
  oficina: string;
  custo: number;
  proximaRevisao: string;
  observacoes?: string;
  status: string;
}

interface Caminhao {
  id: string;
  _id?: string;
  placa: string;
  modelo: string;
}

const WrenchIcon = chakra("svg", {
  baseStyle: {
    boxSize: 7,
    color: "teal.500",
  },
});

function StatusTag({ status }: { status: string }) {
  const statusMap: Record<string, { colorScheme: string; label: string }> = {
    Concluída: { colorScheme: "green", label: "Concluída" },
    Agendada: { colorScheme: "yellow", label: "Agendada" },
    Cancelada: { colorScheme: "red", label: "Cancelada" },
    Atrasada: { colorScheme: "orange", label: "Atrasada" },
    "Em Andamento": { colorScheme: "blue", label: "Em Andamento" }
  };
  const { colorScheme, label } = statusMap[status] || {
    colorScheme: "gray",
    label: status,
  };
  
  return (
    <Badge 
      colorScheme={colorScheme}
      fontSize="xs"
      px={2}
      py={1}
      borderRadius="md"
    >
      {label}
    </Badge>
  );
}

const GestaoManutencaoPreventiva: React.FC = () => {
  const [manutencoes, setManutencoes] = useState<ManutencaoPreventiva[]>([]);
  const [caminhoes, setCaminhoes] = useState<Caminhao[]>([]);
  const [manutencaoSelecionada, setManutencaoSelecionada] = useState<ManutencaoPreventiva | null>(null);
  const [manutencaoDetalhes, setManutencaoDetalhes] = useState<ManutencaoPreventiva | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { isOpen: isOpenNovo, onOpen: onOpenNovo, onClose: onCloseNovo } = useDisclosure();
  const { isOpen: isOpenEditar, onOpen: onOpenEditar, onClose: onCloseEditar } = useDisclosure();
  const { isOpen: isOpenDetalhes, onOpen: onOpenDetalhes, onClose: onCloseDetalhes } = useDisclosure();

  const toast = useToast();

  const encontrarCaminhaoPorId = (id: string): Caminhao | undefined => {
    return caminhoes.find(c => 
      c.id === id || 
      c._id === id || 
      (c as any)._id?.toString() === id || 
      (c as any).id?.toString() === id
    );
  };

  const getNomeCaminhao = (caminhao: any): string => {
    if (caminhao && typeof caminhao === 'object' && caminhao.placa && caminhao.modelo) {
      return `${caminhao.placa} - ${caminhao.modelo}`;
    }
    
    if (typeof caminhao === 'string') {
      const caminhaoEncontrado = encontrarCaminhaoPorId(caminhao);
      return caminhaoEncontrado ? `${caminhaoEncontrado.placa} - ${caminhaoEncontrado.modelo}` : `ID: ${caminhao}`;
    }
    
    if (caminhao && typeof caminhao === 'object') {
      if (caminhao._id) {
        const caminhaoEncontrado = encontrarCaminhaoPorId(caminhao._id);
        return caminhaoEncontrado ? `${caminhaoEncontrado.placa} - ${caminhaoEncontrado.modelo}` : `ID: ${caminhao._id}`;
      }
      if (caminhao.id) {
        const caminhaoEncontrado = encontrarCaminhaoPorId(caminhao.id);
        return caminhaoEncontrado ? `${caminhaoEncontrado.placa} - ${caminhaoEncontrado.modelo}` : `ID: ${caminhao.id}`;
      }
    }
    
    return "Caminhão não encontrado";
  };

  const carregarDados = useCallback(async () => {
    setIsLoading(true);
    try {
      const resManutencoes = await fetch("https://backend-frotas.onrender.com/api/manuPrev");
      if (!resManutencoes.ok) throw new Error("Erro ao buscar manutenções");
      const dadosManutencoes: ManutencaoPreventiva[] = await resManutencoes.json();

      console.log("Dados das manutenções:", dadosManutencoes);
      if (dadosManutencoes.length > 0) {
        console.log("Primeira manutenção:", dadosManutencoes[0]);
        console.log("Tipo do caminhaoId:", typeof dadosManutencoes[0].caminhaoId);
        console.log("Valor do caminhaoId:", dadosManutencoes[0].caminhaoId);
      }

      setManutencoes(dadosManutencoes);

      const resCaminhoes = await fetch("https://backend-frotas.onrender.com/api/caminhoes");
      if (!resCaminhoes.ok) throw new Error("Erro ao buscar caminhões");
      const dadosCaminhoes: Caminhao[] = await resCaminhoes.json();
      
      console.log("Dados dos caminhões:", dadosCaminhoes);
      if (dadosCaminhoes.length > 0) {
        console.log("Primeiro caminhão:", dadosCaminhoes[0]);
        console.log("ID do primeiro caminhão:", dadosCaminhoes[0].id);
        console.log("_ID do primeiro caminhão:", dadosCaminhoes[0]._id);
      }

      setCaminhoes(dadosCaminhoes);

    } catch (err) {
      console.error(err);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as manutenções preventivas ou caminhões.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const deletarManutencao = async (id: string) => {
    try {
      const response = await fetch(`https://backend-frotas.onrender.com/api/manuPrev/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar manutenção.");
      }

      setManutencoes((prev) => prev.filter((m) => m.id !== id));

      toast({
        title: "Manutenção removida",
        description: `Manutenção removida com sucesso.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Erro ao deletar manutenção:", error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar a manutenção.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const abrirModalEditar = (id: string) => {
    const item = manutencoes.find((m) => m.id === id);
    if (item) {
      setManutencaoSelecionada(item);
      onOpenEditar();
    }
  };

  const abrirModalDetalhes = (id: string) => {
    const item = manutencoes.find((m) => m.id === id);
    if (item) {
      setManutencaoDetalhes(item);
      onOpenDetalhes();
    }
  };

  const salvarManutencaoAtualizada = (atualizada: ManutencaoPreventiva) => {
    setManutencoes((prev) =>
      prev.map((m) => (m.id === atualizada.id ? atualizada : m))
    );
    toast({
      title: "Manutenção atualizada",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    onCloseEditar();
  };

  const adicionarManutencao = (nova: ManutencaoPreventiva) => {
    setManutencoes((prev) => [...prev, nova]);
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="teal.500"
          size="xl"
        />
      </Center>
    );
  }

  return (
    <Box mt="80px" px={4}>
      <Card 
        w="100%" 
        maxW="1200px" 
        mx="auto" 
        boxShadow="0 2px 8px rgba(0,0,0,0.15)" 
        borderRadius="4px" 
        border="1px solid #a3bde3"
        p={0}
      >
        <CardHeader 
          bg="#dfeaf5" 
          borderBottom="1px solid #a3bde3" 
          py={3} 
          px={4}
          borderRadius="4px 4px 0 0"
        >
          <Flex justify="space-between" align="center">
            <Flex align="center" gap={3}>
              <WrenchIcon viewBox="0 0 512 512" fill="currentColor">
                <path d="M507.4 133.4l-68.6-68.6c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6l68.6 68.6c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6zM64 352c-35.3 0-64 28.7-64 64s28.7 64 64 64 64-28.7 64-64-28.7-64-64-64zm368-192c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16s16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm-96 96c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16s16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm-96 96c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16s16-7.2 16-16v-32c0-8.8-7.2-16-16-16zM507.4 44.6c-6.2-6.2-16.4-6.2-22.6 0l-68.6 68.6c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0l68.6-68.6c6.2-6.2 6.2-16.4 0-22.6zM64 384c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zm368-192c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16zm-96 96c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16zm-96 96c0-8.8-7.2-16-16-16h-32c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16z"/>
              </WrenchIcon>
              <Heading 
                size="md" 
                fontFamily="Arial, sans-serif"
                fontWeight="600"
                color="#15457b"
              >
                Gestão de Manutenção 
              </Heading>
            </Flex>
            <Flex gap={2}>
              <Button 
                colorScheme="blue" 
                size="sm" 
                leftIcon={<ViewIcon />} 
                onClick={onOpen}
                variant="outline"
                borderWidth="1px"
                bg="white"
                color="#15457b"
                borderColor="#a3bde3"
                borderRadius="3px"
                fontWeight="normal"
                _hover={{ bg: "#e8f0fe" }}
                fontSize="13px"
                height="28px"
                px={3}
              >
                Dashboard
              </Button>
              <Button 
                leftIcon={<AddIcon />} 
                bg="#e6f4e6"
                color="#2a6b2a"
                border="1px solid #9ecf9e"
                borderRadius="3px"
                fontWeight="normal"
                _hover={{ bg: "#d5e8d5" }}
                fontSize="13px"
                height="28px"
                px={3}
                onClick={onOpenNovo}
              >
                Nova Manutenção
              </Button>
            </Flex>
          </Flex>
        </CardHeader>

        <CardBody p={0}>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr bg="#f0f0f0">
                <Th 
                  border="1px solid #e0e0e0" 
                  py={2} 
                  px={3}
                  fontSize="12px"
                  fontWeight="600"
                  color="#666666"
                  textTransform="uppercase"
                >
                  Veículo
                </Th>
                <Th 
                  border="1px solid #e0e0e0" 
                  py={2} 
                  px={3}
                  fontSize="12px"
                  fontWeight="600"
                  color="#666666"
                  textTransform="uppercase"
                >
                  Data
                </Th>
                <Th 
                  border="1px solid #e0e0e0" 
                  py={2} 
                  px={3}
                  fontSize="12px"
                  fontWeight="600"
                  color="#666666"
                  textTransform="uppercase"
                >
                  Tipo
                </Th>
                <Th 
                  border="1px solid #e0e0e0" 
                  py={2} 
                  px={3}
                  fontSize="12px"
                  fontWeight="600"
                  color="#666666"
                  textTransform="uppercase"
                >
                  Km Atual
                </Th>
                <Th 
                  border="1px solid #e0e0e0" 
                  py={2} 
                  px={3}
                  fontSize="12px"
                  fontWeight="600"
                  color="#666666"
                  textTransform="uppercase"
                >
                  Oficina
                </Th>
                <Th 
                  border="1px solid #e0e0e0" 
                  py={2} 
                  px={3}
                  fontSize="12px"
                  fontWeight="600"
                  color="#666666"
                  textTransform="uppercase"
                >
                  Custo (R$)
                </Th>
                <Th 
                  border="1px solid #e0e0e0" 
                  py={2} 
                  px={3}
                  fontSize="12px"
                  fontWeight="600"
                  color="#666666"
                  textTransform="uppercase"
                >
                  Próx. Revisão
                </Th>
                <Th 
                  border="1px solid #e0e0e0" 
                  py={2} 
                  px={3}
                  fontSize="12px"
                  fontWeight="600"
                  color="#666666"
                  textTransform="uppercase"
                >
                  Status
                </Th>
                <Th 
                  border="1px solid #e0e0e0" 
                  py={2} 
                  px={3}
                  fontSize="12px"
                  fontWeight="600"
                  color="#666666"
                  textTransform="uppercase"
                >
                  Ações
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {manutencoes.map((m) => (
                <Tr 
                  key={m.id} 
                  _hover={{ bg: "#f5f8ff" }}
                  borderBottom="1px solid #e0e0e0"
                >
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    {getNomeCaminhao(m.caminhaoId)}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    {new Date(m.data).toLocaleDateString('pt-BR')}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    {m.tipo}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    {m.quilometragem.toLocaleString('pt-BR')} km
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    {m.oficina}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                    fontWeight="bold"
                  >
                    {formatarMoeda(m.custo)}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    {new Date(m.proximaRevisao).toLocaleDateString('pt-BR')}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    <StatusTag status={m.status} />
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    <Flex gap={1}>
                      <IconButton
                        aria-label="Visualizar"
                        icon={<ViewIcon />}
                        size="xs"
                        color="#666666"
                        bg="transparent"
                        border="1px solid #d0d0d0"
                        borderRadius="3px"
                        _hover={{ bg: "#e5e5e5" }}
                        onClick={() => abrirModalDetalhes(m.id)}
                      />
                      <IconButton
                        aria-label="Editar"
                        icon={<EditIcon />}
                        size="xs"
                        color="#666666"
                        bg="transparent"
                        border="1px solid #d0d0d0"
                        borderRadius="3px"
                        _hover={{ bg: "#e5e5e5" }}
                        onClick={() => abrirModalEditar(m.id)}
                      />
                      <IconButton
                        aria-label="Excluir"
                        icon={<DeleteIcon />}
                        size="xs"
                        color="#b33c3c"
                        bg="transparent"
                        border="1px solid #e6b0b0"
                        borderRadius="3px"
                        _hover={{ bg: "#fae6e6" }}
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja excluir esta manutenção?')) {
                            deletarManutencao(m.id);
                          }
                        }}
                      />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      <NovoManutencaoModal 
        isOpen={isOpenNovo}
        onClose={onCloseNovo}
        onSalvar={adicionarManutencao}
        caminhoes={caminhoes}
      />

      {manutencaoSelecionada && (
        <EditarManutencaoModal
          key={manutencaoSelecionada.id}
          isOpen={isOpenEditar}
          onClose={onCloseEditar}
          manutencao={manutencaoSelecionada as any}
          onSalvar={salvarManutencaoAtualizada}
          caminhoes={caminhoes}
        />
      )}

      {isOpenDetalhes && manutencaoDetalhes && (
        <DetalhesManutencaoModal
          isOpen={isOpenDetalhes}
          onClose={onCloseDetalhes}
          manutencao={manutencaoDetalhes as any}
          getNomeCaminhao={getNomeCaminhao} 
        />
      )}
      
      <Dashboardprev 
        isOpen={isOpen} 
        onClose={onClose}
        manutencoes={manutencoes}
        caminhoes={caminhoes}
      />
    </Box>
  );
};

export default GestaoManutencaoPreventiva;