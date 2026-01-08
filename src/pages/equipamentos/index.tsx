import React, { useEffect, useState } from "react";
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
  Center
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import NovoCaminhaoModal from "../../components/modalequipamento/novocaminhao";
import EditarCaminhaoModal from "../../components/modalequipamento/editarcaminhao";
import DetalhesCaminhaoModal from "../../components/modalequipamento/DetalhesCaminhaoModal"; 
import axios from "axios";

interface Documentacao {
  crlv: string;
  ipvaPago: boolean;
  seguro: string;
}

interface Caminhao {
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

const TruckIcon = chakra("svg", {
  baseStyle: {
    boxSize: 7,
    color: "#15457b",
  },
});

function StatusTag({ status }: { status: string }) {
  const statusMap: Record<string, { color: string; bgColor: string; label: string }> = {
    Ativo: { color: "#2a6b2a", bgColor: "#e6f4e6", label: "Ativo" },
    Inativo: { color: "#b33c3c", bgColor: "#fae6e6", label: "Inativo" },
  };
  const { color, bgColor, label } = statusMap[status] || {
    color: "#666666",
    bgColor: "#f0f0f0",
    label: status,
  };
  return (
    <Box
      as="span"
      px={2}
      py={1}
      rounded="3px"
      fontWeight="600"
      fontSize="12px"
      color={color}
      bg={bgColor}
      border="1px solid"
      borderColor={color === "#2a6b2a" ? "#9ecf9e" : color === "#b33c3c" ? "#e6b0b0" : "#d0d0d0"}
      userSelect="none"
    >
      {label}
    </Box>
  );
}

const GestaoCaminhoes: React.FC = () => {
  const [caminhoes, setCaminhoes] = useState<Caminhao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [caminhaoSelecionado, setCaminhaoSelecionado] = useState<Caminhao | null>(null);
  const [caminhaoDetalhes, setCaminhaoDetalhes] = useState<Caminhao | null>(null);
  
  const {
    isOpen: isOpenNovo,
    onOpen: onOpenNovo,
    onClose: onCloseNovo,
  } = useDisclosure();

  const {
    isOpen: isOpenEditar,
    onOpen: onOpenEditar,
    onClose: onCloseEditar,
  } = useDisclosure();

  const {
    isOpen: isOpenDetalhes,
    onOpen: onOpenDetalhes,
    onClose: onCloseDetalhes,
  } = useDisclosure();

  const toast = useToast();

  useEffect(() => {
    const fetchCaminhoes = async () => {
      try {
        setIsLoading(true); 
        const response = await axios.get<Caminhao[]>("https://gestaofrota.onrender.com/api/caminhoes");
        
        const dataNormalizada = response.data.map((caminhao: any) => ({
          ...caminhao,
          id: caminhao.id ?? caminhao._id ?? Math.random(),
        }));

        setCaminhoes(dataNormalizada);
      } catch (error) {
        toast({
          title: "Erro ao carregar caminhões",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false); 
      }
    };

    fetchCaminhoes();
  }, []);

  const deletarCaminhao = async (id: number) => {
    try {
      await axios.delete(`https://gestaofrota.onrender.com/api/caminhoes/${id}`);
      
      const caminhaoRemovido = caminhoes.find((c) => c.id === id);
      
      setCaminhoes((prev) => prev.filter((c) => c.id !== id));

      toast({
        title: "Caminhão excluído",
        description: `O caminhão com de Modelo: ${caminhaoRemovido?.modelo} foi removido com sucesso.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir caminhão",
        description: "Não foi possível remover o caminhão.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const abrirModalEditar = (id: number) => {
    const caminhao = caminhoes.find((c) => c.id === id);
    if (caminhao) {
      setCaminhaoSelecionado({ ...caminhao });
      onOpenEditar();
    }
  };

  const abrirModalDetalhes = (id: number) => {
    const caminhao = caminhoes.find((c) => c.id === id);
    if (caminhao) {
      setCaminhaoDetalhes({ ...caminhao });
      onOpenDetalhes();
    }
  };

  const salvarCaminhaoAtualizado = (caminhaoAtualizado: Caminhao) => {
    if (!caminhaoAtualizado || caminhaoAtualizado.id === undefined) {
      console.error("Caminhão inválido ao tentar salvar:", caminhaoAtualizado);
      toast({
        title: "Erro ao atualizar caminhão",
        description: "Dados incompletos do caminhão.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setCaminhoes((prev) =>
      prev.map((c) => (c.id === caminhaoAtualizado.id ? caminhaoAtualizado : c))
    );

    toast({
      title: "Caminhão atualizado",
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    onCloseEditar();
  };

  const adicionarCaminhao = (caminhao: any) => {
    setCaminhoes((prev) => [...prev, caminhao]);
  };

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="#15457b"
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
              <TruckIcon viewBox="0 0 640 512" fill="currentColor">
                <path d="M624 352h-16V275.1c0-16.8-6.7-33-18.7-45L494.6 129.4c-12-12-28.2-18.7-45-18.7H400V80c0-26.5-21.5-48-48-48H48C21.5 32 0 53.5 0 80v336c0 26.5 21.5 48 48 48h32c0 35.3 28.7 64 64 64s64-28.7 64-64h192c0 35.3 28.7 64 64 64s64-28.7 64-64h56c8.8 0 16-7.2 16-16v-48c0-8.8-7.2-16-16-16zM112 464c-17.6 0-32-14.4-32-32s14.4-32 32-32 32 14.4 32 32-14.4 32-32 32zm320 0c-17.6 0-32-14.4-32-32s14.4-32 32-32 32 14.4 32 32-14.4 32-32 32zm-16-272h70.6L592 320H416V192z" />
              </TruckIcon>
              <Heading 
                size="md" 
                fontFamily="Arial, sans-serif"
                fontWeight="600"
                color="#15457b"
              >
                Gestão de Caminhões
              </Heading>
            </Flex>
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
              Novo Caminhão
            </Button>
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
                  Placa
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
                  Modelo
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
                  Ano
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
                  Cor
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
                  Combustível
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
                  Quilometragem
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
              {caminhoes.map((caminhao) => (
                <Tr 
                  key={caminhao.id} 
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
                    {caminhao.placa}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    {caminhao.modelo}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    {caminhao.ano}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    {caminhao.cor || "-"}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    {caminhao.tipoCombustivel || "-"}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    {caminhao.quilometragemAtual?.toLocaleString() || "-"}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    <StatusTag status={caminhao.status} />
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
                        aria-label="Visualizar detalhes"
                        icon={<ViewIcon />}
                        size="xs"
                        color="#666666"
                        bg="transparent"
                        border="1px solid #d0d0d0"
                        borderRadius="3px"
                        _hover={{ bg: "#e5e5e5" }}
                        onClick={() => abrirModalDetalhes(caminhao.id)}
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
                        onClick={() => abrirModalEditar(caminhao.id)}
                      />
                      <IconButton
                        aria-label="Deletar"
                        icon={<DeleteIcon />}
                        size="xs"
                        color="#b33c3c"
                        bg="transparent"
                        border="1px solid #e6b0b0"
                        borderRadius="3px"
                        _hover={{ bg: "#fae6e6" }}
                        onClick={() => deletarCaminhao(caminhao.id)}
                      />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      <NovoCaminhaoModal
        isOpen={isOpenNovo}
        onClose={onCloseNovo}
        onSalvar={adicionarCaminhao}
      />

      {caminhaoSelecionado && (
        <EditarCaminhaoModal
          key={caminhaoSelecionado.id}
          isOpen={isOpenEditar}
          onClose={onCloseEditar}
          caminhao={caminhaoSelecionado}
          onSalvar={salvarCaminhaoAtualizado}
        />
      )}

      {caminhaoDetalhes && (
        <DetalhesCaminhaoModal
          isOpen={isOpenDetalhes}
          onClose={onCloseDetalhes}
          caminhao={caminhaoDetalhes}
        />
      )}
    </Box>
  );
};

export default GestaoCaminhoes;