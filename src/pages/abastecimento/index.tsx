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
  Center,
  Spinner,
  Badge
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import NovoCombustivelModal from "../../components/abasteciemento/novo";
import EditarAbastecimentoModal from "../../components/abasteciemento/editar";
import ModalDashboardAbastecimentoAnalitico from "../../components/abasteciemento/dashboard";

interface CaminhaoInfo {
  _id?: string;
  id?: string;
  placa: string;
  modelo: string;
}

interface Abastecimento {
  id: string;
  caminhaoId: string | CaminhaoInfo;
  data: string;
  litros: number;
  valorLitro: number;
  valorTotal: number;
  posto: string;
  odometro: number;
  tipoCombustivel: string;
  observacoes?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Caminhao {
  id: string;
  nome: string;
  placa: string;
  modelo: string;
}

const FuelIcon = chakra("svg", {
  baseStyle: {
    boxSize: 7,
    color: "#15457b",
  },
});

const GestaoCombustiveis: React.FC = () => {
  const [abastecimentos, setAbastecimentos] = useState<Abastecimento[]>([]);
  const [caminhoes, setCaminhoes] = useState<Caminhao[]>([]);
  const [abastecimentoSelecionado, setAbastecimentoSelecionado] = useState<Abastecimento | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOpenNovo, onOpen: onOpenNovo, onClose: onCloseNovo } = useDisclosure();
  const { isOpen: isOpenEditar, onOpen: onOpenEditar, onClose: onCloseEditar } = useDisclosure();

  const toast = useToast();

  const carregarDados = useCallback(async () => {
    setIsLoading(true);

    try {
      const [abastecimentosResponse, caminhoesResponse] = await Promise.all([
        fetch("https://backend-frotas.onrender.com/api/abastecimentos"),
        fetch("https://backend-frotas.onrender.com/api/caminhoes")
      ]);

      if (!abastecimentosResponse.ok) throw new Error("Erro na requisição de abastecimentos");
      if (!caminhoesResponse.ok) throw new Error("Erro na requisição de caminhões");

      const [abastecimentosData, caminhoesData] = await Promise.all([
        abastecimentosResponse.json(),
        caminhoesResponse.json()
      ]);

      setAbastecimentos(abastecimentosData);
      setCaminhoes(caminhoesData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
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

  const deletarAbastecimento = async (id: string) => {
    try {
      const response = await fetch(`https://backend-frotas.onrender.com/api/abastecimentos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Erro ao excluir abastecimento.");

      setAbastecimentos((prev) => prev.filter((a) => a.id !== id));
      
      toast({
        title: "Abastecimento removido",
        description: "Abastecimento removido com sucesso.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao deletar abastecimento.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("Erro ao deletar abastecimento:", error);
    }
  };

  const abrirModalEditar = (id: string) => {
    const abastecimento = abastecimentos.find((a) => a.id === id);
    if (abastecimento) {
      setAbastecimentoSelecionado({ ...abastecimento });
      onOpenEditar();
    }
  };

  const salvarAbastecimentoAtualizado = (abastecimentoAtualizado: Abastecimento) => {
    setAbastecimentos((prev) =>
      prev.map((a) => (a.id === abastecimentoAtualizado.id ? abastecimentoAtualizado : a))
    );
    toast({
      title: "Abastecimento atualizado",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    onCloseEditar();
  };

  const adicionarAbastecimento = (abastecimento: Abastecimento) => {
    setAbastecimentos((prev) => [...prev, abastecimento]);
  };

  const getStatusColor = (status: string = "Concluído") => {
    switch (status) {
      case "Concluído": return "green";
      case "Pendente": return "orange";
      case "Cancelado": return "red";
      default: return "gray";
    }
  };

  const getCaminhaoLabel = (caminhaoData: string | any): string => {
    if (caminhaoData && typeof caminhaoData === 'object') {
      return `${caminhaoData.placa} - ${caminhaoData.modelo}`;
    }
    
    if (typeof caminhaoData === 'string') {
      const caminhaoEncontrado = caminhoes.find((c) => c.id === caminhaoData);
      return caminhaoEncontrado ? `${caminhaoEncontrado.placa} - ${caminhaoEncontrado.modelo}` : `ID ${caminhaoData}`;
    }
    
    return "Caminhão não encontrado";
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
              <FuelIcon viewBox="0 0 640 512" fill="currentColor">
                <path d="M624 352h-16V243.9c0-12.7-5.1-24.9-14.1-33.9L494 110.1c-9-9-21.2-14.1-33.9-14.1H416V48c0-26.5-21.5-48-48-48H112C85.5 0 64 21.5 64 48v48H8c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h272c4.4 0 8 3.6 8 8v16c0 4.4-3.6 8-8 8H40c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h208c4.4 0 8 3.6 8 8v16c0 4.4-3.6 8-8 8H8c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h208c4.4 0 8 3.6 8 8v16c0 4.4-3.6 8-8 8H64v128c0 53 43 96 96 96s96-43 96-96h128c0 53 43 96 96 96s96-43 96-96h48c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zM160 464c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zm320 0c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zm80-208H416V144h44.1l99.9 99.9V256z" />
              </FuelIcon>
              <Heading 
                size="md" 
                fontFamily="Arial, sans-serif"
                fontWeight="600"
                color="#15457b"
              >
                Gestão de Abastecimentos
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
                Novo Abastecimento
              </Button>
            </Flex>
          </Flex>
        </CardHeader>

        <CardBody p={0} maxH="70vh" overflowY="auto">
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
                  Caminhão
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
                  Tipo Combustível
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
                  Litros
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
                  Valor/Litro
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
                  Valor Total
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
                  Posto
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
                  Odômetro
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
              {abastecimentos.map((abastecimento) => (
                <Tr 
                  key={abastecimento.id} 
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
                    {getCaminhaoLabel(abastecimento.caminhaoId)}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    {new Date(abastecimento.data).toLocaleDateString('pt-BR')}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    {abastecimento.tipoCombustivel}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    {abastecimento.litros.toLocaleString('pt-BR')}L
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    {formatarMoeda(abastecimento.valorLitro)}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                    fontWeight="bold"
                  >
                    {formatarMoeda(abastecimento.valorTotal)}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    {abastecimento.posto}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    {abastecimento.odometro.toLocaleString('pt-BR')} km
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    <Badge 
                      colorScheme={getStatusColor(abastecimento.status)}
                      fontSize="xs"
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      {abastecimento.status || "Concluído"}
                    </Badge>
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
                        aria-label="Editar"
                        icon={<EditIcon />}
                        size="xs"
                        color="#666666"
                        bg="transparent"
                        border="1px solid #d0d0d0"
                        borderRadius="3px"
                        _hover={{ bg: "#e5e5e5" }}
                        onClick={() => abrirModalEditar(abastecimento.id)}
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
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja excluir este abastecimento?')) {
                            deletarAbastecimento(abastecimento.id);
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

      <NovoCombustivelModal
        isOpen={isOpenNovo}
        onClose={onCloseNovo}
        onSalvar={adicionarAbastecimento}
        caminhoes={caminhoes}
      />

      {isOpenEditar && abastecimentoSelecionado && (
        <EditarAbastecimentoModal
          key={abastecimentoSelecionado.id}
          isOpen={isOpenEditar}
          onClose={onCloseEditar}
          abastecimento={abastecimentoSelecionado as any}
          onSalvar={salvarAbastecimentoAtualizado}
          caminhoes={caminhoes}
        />
      )}

      <ModalDashboardAbastecimentoAnalitico 
        isOpen={isOpen} 
        onClose={onClose}
        abastecimentos={abastecimentos as any}
        caminhoes={caminhoes}
      />
    </Box>
  );
};

export default GestaoCombustiveis;