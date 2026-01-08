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
  Center,
  Spinner
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import NovoPneuModal from "../../components/pneus/novo";
import EditarPneuModal from "../../components/pneus/editar";
import ModalDashboardTrocaPneu from "../../components/pneus/dashboard";
import DetalhesPneuModal from "../../components/pneus/detalhespneu";

interface Pneu {
  id: string;
  caminhaoId: string;
  codigoPneu: string;
  dataTroca: string;
  posicao: string;
  marca: string;
  observacao: string;
  valor: number;
  tipo: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Caminhao {
  id: string;
  nome: string;
  placa: string;
  modelo: string;
}

const TireIcon = chakra("svg", {
  baseStyle: {
    boxSize: 7,
    color: "#15457b",
  },
});

const GestaoPneus: React.FC = () => {
  const [pneus, setPneus] = useState<Pneu[]>([]);
  const [caminhoes, setCaminhoes] = useState<Caminhao[]>([]);
  const [pneuSelecionado, setPneuSelecionado] = useState<Pneu | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOpenNovo, onOpen: onOpenNovo, onClose: onCloseNovo } = useDisclosure();
  const { isOpen: isOpenEditar, onOpen: onOpenEditar, onClose: onCloseEditar } = useDisclosure();
  const [pneuDetalhes, setPneuDetalhes] = useState<Pneu | null>(null);
  const { isOpen: isOpenDetalhes, onOpen: onOpenDetalhes, onClose: onCloseDetalhes } = useDisclosure();

  const toast = useToast();

  useEffect(() => {
    const fetchDados = async () => {
      setIsLoading(true);

      try {
        const responsePneus = await fetch("https://gestaofrota.onrender.com/api/trocaPneus");
        if (!responsePneus.ok) throw new Error("Erro ao buscar dados de pneus");
        const dataPneus: Pneu[] = await responsePneus.json();
        setPneus(dataPneus);

        const responseCaminhoes = await fetch("https://gestaofrota.onrender.com/api/caminhoes");
        if (!responseCaminhoes.ok) throw new Error("Erro ao buscar dados de caminhões");
        const dataCaminhoes: Caminhao[] = await responseCaminhoes.json();
        setCaminhoes(dataCaminhoes);

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
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
    };

    fetchDados();
  }, [toast]);

  const getNomeCaminhao = (caminhao: any) => {
    if (caminhao && typeof caminhao === 'object') {
      return `${caminhao.placa} - ${caminhao.modelo}`;
    }
    
    if (typeof caminhao === 'string') {
      const caminhaoEncontrado = caminhoes.find((c) => c.id === caminhao);
      return caminhaoEncontrado ? `${caminhaoEncontrado.placa} - ${caminhaoEncontrado.modelo}` : `ID ${caminhao}`;
    }
    
    return "Caminhão não encontrado";
  };

  const deletarPneu = async (id: string) => {
    try {
      const response = await fetch(`https://gestaofrota.onrender.com/api/trocaPneus/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar pneu");
      }

      const data = await response.json();

      setPneus((prev) => prev.filter((p) => p.id !== id));

      toast({
        title: "Pneu removido",
        description: `Pneu ${data.marca} removido com sucesso.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao deletar pneu.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("Erro ao deletar pneu:", error);
    }
  };

  const abrirModalDetalhes = (pneu: Pneu) => {
    setPneuDetalhes(pneu);
    onOpenDetalhes();
  };

  const abrirModalEditar = (id: string) => {
    const pneu = pneus.find((p) => p.id === id);
    if (pneu) {
      setPneuSelecionado({ ...pneu });
      onOpenEditar();
    }
  };

  const salvarPneuAtualizado = (pneuAtualizado: Pneu) => {
    setPneus((prev) =>
      prev.map((p) => (p.id === pneuAtualizado.id ? pneuAtualizado : p))
    );
    toast({
      title: "Pneu atualizado",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    onCloseEditar();
  };

  const adicionarPneu = (pneu: Pneu) => {
    setPneus((prev) => [...prev, pneu]);
  };

  const prepararDadosDashboard = () => {
    return pneus.map(pneu => ({
      id: pneu.id,
      caminhaoId: pneu.caminhaoId,
      placa: getNomeCaminhao(pneu.caminhaoId).split(' - ')[0] || 'N/A',
      marca: pneu.marca,
      modelo: pneu.tipo,
      posicao: pneu.posicao,
      dataTroca: pneu.dataTroca,
      status: "Concluída"
    }));
  };

  const prepararCaminhoesDashboard = () => {
    return caminhoes.map(caminhao => ({
      id: caminhao.id,
      placa: caminhao.placa,
      modelo: caminhao.modelo,
      ano: "2020",
      status: "Ativo"
    }));
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
              <TireIcon viewBox="0 0 640 512" fill="currentColor">
                {/* <path d="M320 32C132.3 32 0 132.3 0 320s132.3 288 320 288 320-132.3 320-288S507.7 32 320 32zm0 512c-105.9 0-192-78.4-192-176 0-61.8 52.1-112 116-112 44.7 0 82.3 29.7 98.3 70.4a128.42 128.42 0 0 1 39.7-6.4c66.3 0 120 50.1 120 112 0 97.6-86.1 176-182 176z" /> */}
              </TireIcon>
              <Heading 
                size="md" 
                fontFamily="Arial, sans-serif"
                fontWeight="600"
                color="#15457b"
              >
                Gestão de Troca de Pneus
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
                Novo Pneu
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
                  Marca
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
                  Código Pneu
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
                  Posição
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
                  Data Troca
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
              {pneus.map((pneu) => (
                <Tr 
                  key={pneu.id} 
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
                    {getNomeCaminhao(pneu.caminhaoId)}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    {pneu.marca}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    {pneu.codigoPneu}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    {pneu.posicao}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    {pneu.dataTroca || "-"}
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
                        onClick={() => abrirModalDetalhes(pneu)}
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
                        onClick={() => abrirModalEditar(pneu.id)}
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
                        onClick={() => deletarPneu(pneu.id)}
                      />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      <NovoPneuModal
        isOpen={isOpenNovo}
        onClose={onCloseNovo}
        onSalvar={adicionarPneu}
        caminhoes={caminhoes} 
      />

      {isOpenEditar && pneuSelecionado && (
        <EditarPneuModal
          key={pneuSelecionado.id}
          isOpen={isOpenEditar}
          onClose={onCloseEditar}
          pneu={pneuSelecionado}
          onSalvar={salvarPneuAtualizado}
          caminhoes={caminhoes}
        />
      )}

      {isOpenDetalhes && pneuDetalhes && (
        <DetalhesPneuModal
          isOpen={isOpenDetalhes}
          onClose={onCloseDetalhes}
          pneu={pneuDetalhes}
          caminhoes={caminhoes}
        />
      )}

      <ModalDashboardTrocaPneu 
        isOpen={isOpen} 
        onClose={onClose}
        trocasPneus={prepararDadosDashboard()}
        caminhoes={prepararCaminhoesDashboard()}
      /> 
    </Box>
  );
};

export default GestaoPneus;