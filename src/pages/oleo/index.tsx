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
  Spinner,
  Badge
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import NovoOleoModal from "../../components/oleo/novo";
import EditarOleoModal from "../../components/oleo/editar";
import ModalDashboardTrocaOleoAnalitico from "../../components/oleo/dashboard";

interface TrocaOleo {
  id: string;
  caminhaoId: any;
  dataTroca: string;
  quilometragem: number;
  tipoOleo: string;
  observacao?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Caminhao {
  id: string;
  nome: string;
  placa: string;
  modelo: string;
}

const OilIcon = chakra("svg", {
  baseStyle: {
    boxSize: 7,
    color: "#15457b",
  },
});

const GestaoTrocaOleo: React.FC = () => {
  const [oleos, setOleos] = useState<TrocaOleo[]>([]);
  const [caminhoes, setCaminhoes] = useState<Caminhao[]>([]);
  const [oleoSelecionado, setOleoSelecionado] = useState<TrocaOleo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOpenNovo, onOpen: onOpenNovo, onClose: onCloseNovo } = useDisclosure();
  const { isOpen: isOpenEditar, onOpen: onOpenEditar, onClose: onCloseEditar } = useDisclosure();

  const toast = useToast();

  useEffect(() => {
    const fetchDados = async () => {
      setIsLoading(true);

      try {
        const [responseOleos, responseCaminhoes] = await Promise.all([
          fetch("https://backend-frotas.onrender.com/api/trocaOleo"),
          fetch("https://backend-frotas.onrender.com/api/caminhoes")
        ]);

        if (!responseOleos.ok) throw new Error("Erro ao buscar dados de trocas de óleo");
        if (!responseCaminhoes.ok) throw new Error("Erro ao buscar dados de caminhões");

        const [dataOleos, dataCaminhoes] = await Promise.all([
          responseOleos.json(),
          responseCaminhoes.json()
        ]);

        setOleos(dataOleos);
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

  const deletarOleo = async (id: string) => {
    try {
      const response = await fetch(`https://backend-frotas.onrender.com/api/trocaOleo/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao deletar troca de óleo");
      }

      setOleos((prev) => prev.filter((o) => o.id !== id));

      toast({
        title: "Troca de óleo removida",
        description: "Troca de óleo removida com sucesso.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao deletar troca de óleo.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error("Erro ao deletar troca de óleo:", error);
    }
  };

  const abrirModalEditar = (id: string) => {
    const oleo = oleos.find((o) => o.id === id);
    if (oleo) {
      setOleoSelecionado({ ...oleo });
      onOpenEditar();
    }
  };

  const salvarOleoAtualizado = (oleoAtualizado: TrocaOleo) => {
    setOleos((prev) =>
      prev.map((o) => (o.id === oleoAtualizado.id ? oleoAtualizado : o))
    );
    toast({
      title: "Troca de óleo atualizada",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    onCloseEditar();
  };

  const adicionarOleo = (oleo: TrocaOleo) => {
    setOleos((prev) => [...prev, oleo]);
  };

  const getStatusColor = (status: string = "Concluída") => {
    switch (status) {
      case "Concluída": return "green";
      case "Pendente": return "orange";
      case "Cancelada": return "red";
      default: return "gray";
    }
  };

  const prepararDadosDashboard = () => {
    return oleos.map(oleo => ({
      id: oleo.id,
      caminhaoId: oleo.caminhaoId,
      placa: getNomeCaminhao(oleo.caminhaoId).split(' - ')[0] || 'N/A',
      tipoOleo: oleo.tipoOleo,
      dataTroca: oleo.dataTroca,
      kmAtual: oleo.quilometragem,
      proximaTrocaKm: oleo.quilometragem + 10000,
      status: oleo.status || "Concluída"
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
              <OilIcon viewBox="0 0 512 512" fill="currentColor">
                <path d="M96 64v192h320V64H96zm64 144h64v32h-64v-32zm112 0h64v32h-64v-32zM48 256v192h416V256H48z" />
              </OilIcon>
              <Heading 
                size="md" 
                fontFamily="Arial, sans-serif"
                fontWeight="600"
                color="#15457b"
              >
                Gestão de Troca de Óleo
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
                Nova Troca
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
                  Tipo Óleo
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
              {oleos.map((oleo) => (
                <Tr 
                  key={oleo.id} 
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
                    {getNomeCaminhao(oleo.caminhaoId)}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    {new Date(oleo.dataTroca).toLocaleDateString('pt-BR')}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    {oleo.quilometragem.toLocaleString('pt-BR')} km
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    {oleo.tipoOleo}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    <Badge 
                      colorScheme={getStatusColor(oleo.status)}
                      fontSize="xs"
                      px={2}
                      py={1}
                      borderRadius="md"
                    >
                      {oleo.status || "Concluída"}
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
                        onClick={() => abrirModalEditar(oleo.id)}
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
                          if (window.confirm('Tem certeza que deseja excluir esta troca de óleo?')) {
                            deletarOleo(oleo.id);
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

      <NovoOleoModal
        isOpen={isOpenNovo}
        onClose={onCloseNovo}
        onSalvar={adicionarOleo}
        caminhoes={caminhoes}
      />

      {isOpenEditar && oleoSelecionado && (
        <EditarOleoModal
          key={oleoSelecionado.id}
          isOpen={isOpenEditar}
          onClose={onCloseEditar}
          troca={oleoSelecionado}
          onSalvar={salvarOleoAtualizado}
          caminhoes={caminhoes}
        />
      )}

      <ModalDashboardTrocaOleoAnalitico 
        isOpen={isOpen} 
        onClose={onClose}
        trocasOleo={prepararDadosDashboard()}
        caminhoes={prepararCaminhoesDashboard()}
      />
    </Box>
  );
};

export default GestaoTrocaOleo;