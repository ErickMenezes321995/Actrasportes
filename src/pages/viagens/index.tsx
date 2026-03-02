import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Spinner,
  useBreakpointValue,
  SimpleGrid,
  Text,
  HStack
} from "@chakra-ui/react";
import { EditIcon, TriangleDownIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import NovaViagemModal from "../../components/modalviagem/NovaViagemModal";
import SelecionarMotoristaEquipamentoModal from "../../components/modalviagem/iniciarviagem";
import EditarViagemModal from "../../components/modalviagem/EditarViagemModal";

import axios from "axios";

type StatusViagem = "Pendente" | "Em andamento" | "Concluída" | "Cancelada";

interface Viagem {
  id: number;
  origem: string;
  destino: string; 
  motorista: string;
  viatura: string;
  dataInicio: string;
  dataTermino: string;
  status: StatusViagem;
  odometro?: number;
}

const TruckIcon = chakra("svg", {
  baseStyle: {
    boxSize: 6,
    color: "#15457b",
  },
});

function StatusTag({ status }: { status: StatusViagem }) {
  const statusConfig = {
    "Concluída": {
      bgColor: "#e6f4e6",
      color: "#2a6b2a",
      borderColor: "#9ecf9e",
      icon: "✓"
    },
    "Em andamento": {
      bgColor: "#e6f0f5",
      color: "#1f5c7a",
      borderColor: "#9ec5d9",
      icon: "↻"
    },
    "Pendente": {
      bgColor: "#fef0e6",
      color: "#b35926",
      borderColor: "#f5c9a4",
      icon: "⏱"
    },
    "Cancelada": {
      bgColor: "#f9e6e6",
      color: "#a33d3d",
      borderColor: "#e0a8a8",
      icon: "✕"
    }
  };

  const { bgColor, color, borderColor, icon } = statusConfig[status];
  
  return (
    <Flex 
      align="center" 
      justify="center" 
      bg={bgColor}
      color={color}
      border="1px"
      borderColor={borderColor}
      borderRadius="3px"
      py={1}
      px={2}
      minW="100px"
      fontSize="12px"
      fontWeight="600"
      fontFamily="Arial, sans-serif"
    >
      <Box mr={1} fontSize="10px" fontWeight="bold">{icon}</Box>
      <Box>{status}</Box>
    </Flex>
  );
}

// Componente de badge circular para contagens
function CircularBadge({ count, colorScheme }: { count: number, colorScheme: string }) {
  const colorMap = {
    blue: { bg: "#1f5c7a", color: "white" },
    green: { bg: "#2a6b2a", color: "white" },
    orange: { bg: "#b35926", color: "white" },
    red: { bg: "#a33d3d", color: "white" },
    gray: { bg: "#666666", color: "white" }
  };

  const { bg, color } = colorMap[colorScheme as keyof typeof colorMap] || colorMap.gray;

  return (
    <Flex
      align="center"
      justify="center"
      bg={bg}
      color={color}
      borderRadius="full"
      w="18px"
      h="18px"
      fontSize="10px"
      fontWeight="bold"
      ml={1}
    >
      {count}
    </Flex>
  );
}

// Componente de card para visualização mobile
function ViagemCard({ viagem, onEdit, onView, onStart, onDelete }: { 
  viagem: Viagem; 
  onEdit: () => void; 
  onView: () => void;
  onStart: () => void;
  onDelete: () => void;
}) {
  return (
    <Box 
      p={3} 
      border="1px" 
      borderColor="#d0d0d0" 
      borderRadius="4px" 
      mb={3}
      bg="white"
      boxShadow="0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)"
    >
      <Flex justify="space-between" align="start" mb={2}>
        <Box>
          <Text fontSize="13px" fontWeight="600" color="#15457b">{viagem.origem} → {viagem.destino}</Text>
          <Text fontSize="12px" color="#666666" mt={1}>
            Motorista: {viagem.motorista || <i>Não atribuído</i>}
          </Text>
          <Text fontSize="12px" color="#666666">
            Viatura: {viagem.viatura || <i>Não atribuído</i>}
          </Text>
        </Box>
        <StatusTag status={viagem.status} />
      </Flex>
      
      <Flex justify="space-between" align="center" mt={2}>
        <Box>
          <Text fontSize="11px" color="#999999">Início: {viagem.dataInicio}</Text>
          <Text fontSize="11px" color="#999999">Término: {viagem.dataTermino}</Text>
        </Box>
        <HStack spacing={1}>
          <IconButton
            aria-label="Visualizar"
            icon={<ViewIcon />}
            size="xs"
            color="#15457b"
            bg="transparent"
            border="1px solid #a3bde3"
            borderRadius="3px"
            _hover={{ bg: "#dfeaf5" }}
            onClick={onView}
          />
          <IconButton
            aria-label="Editar"
            icon={<EditIcon />}
            size="xs"
            color="#15457b"
            bg="transparent"
            border="1px solid #a3bde3"
            borderRadius="3px"
            _hover={{ bg: "#dfeaf5" }}
            onClick={onEdit}
          />
          {viagem.status === "Pendente" && (
            <IconButton
              aria-label="Iniciar"
              icon={<TriangleDownIcon transform="rotate(90deg)" />}
              size="xs"
              color="#1f5c7a"
              bg="transparent"
              border="1px solid #9ec5d9"
              borderRadius="3px"
              _hover={{ bg: "#e6f0f5" }}
              onClick={onStart}
            />
          )}
          {(viagem.status === "Concluída" || viagem.status === "Pendente") && (
            <IconButton
              aria-label="Deletar"
              icon={<DeleteIcon />}
              size="xs"
              color="#a33d3d"
              bg="transparent"
              border="1px solid #e0a8a8"
              borderRadius="3px"
              _hover={{ bg: "#f9e6e6" }}
              onClick={onDelete}
            />
          )}
        </HStack>
      </Flex>
    </Box>
  );
}

const GestaoViagens: React.FC = () => {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [viagemSelecionada, setViagemSelecionada] = useState<Viagem | null>(null);
  const [viagemParaEditar, setViagemParaEditar] = useState<Viagem | null>(null);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  const toast = useToast();

  const {
    isOpen: isModalSelecionarOpen,
    onOpen: onModalSelecionarOpen,
    onClose: onModalSelecionarClose,
  } = useDisclosure();

  const {
    isOpen: isModalEditarOpen,
    onOpen: onModalEditarOpen,
    onClose: onModalEditarClose,
  } = useDisclosure();


  const isMobile = useBreakpointValue({ base: true, md: false });


  const statusCounts = {
    Pendente: viagens.filter(v => v.status === "Pendente").length,
    "Em andamento": viagens.filter(v => v.status === "Em andamento").length,
    Concluída: viagens.filter(v => v.status === "Concluída").length,
    Cancelada: viagens.filter(v => v.status === "Cancelada").length
  };

  useEffect(() => {
    const fetchViagens = async () => {
      try {
        setIsLoading(true);
        
        const timeout = setTimeout(() => {
          setIsLoading(false);
        }, 20000);

        const res = await axios.get<Viagem[]>("https://backend-frotas.onrender.com/api/viagens");
        
        clearTimeout(timeout);
        setViagens(res.data);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        toast({
          title: "Erro ao carregar viagens",
          description: "Não foi possível obter os dados do servidor.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      }
    };
    fetchViagens();
  }, [toast]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="100vh">
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="#15457b"
          size="xl"
        />
      </Flex>
    );
  }

  const iniciarViagem = async (id: number) => {
    const viagem = viagens.find((v) => v.id === id);
    if (!viagem) return;

    setViagemSelecionada(viagem);
    onModalSelecionarOpen();
  };

  const salvarMotoristaViatura = async (
    motorista: string,
    viatura: string,
    dataInicio: string,
    odometro: number
  ) => {
    if (!viagemSelecionada) return;

    try {
      const res = await axios.put(`https://backend-frotas.onrender.com/api/viagens/${viagemSelecionada.id}`, {
        motorista,
        viatura,
        dataInicio,
        odometro,
        status: "Em andamento",
      });

      setViagens((old): Viagem[] =>
        old.map((v) => (v.id === viagemSelecionada.id ? res.data as Viagem : v))
      );

      toast({
        title: "Viagem iniciada.",
        description: "Motorista, equipamento e odômetro atualizados.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setViagemSelecionada(null);
    } catch {
      toast({
        title: "Erro ao atualizar viagem",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const deletarViagem = async (id: number) => {
    try {
      await axios.delete(`https://backend-frotas.onrender.com/api/viagens/${id}`);
      setViagens((old): Viagem[] => old.filter((v) => v.id !== id));
      toast({
        title: "Viagem excluída.",
        description: "Viagem removida com sucesso.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch {
      toast({
        title: "Erro ao excluir viagem",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const ordemStatus: StatusViagem[] = ["Pendente", "Em andamento", "Concluída", "Cancelada"];
  const viagensOrdenadas = [...viagens].sort(
    (a, b) => ordemStatus.indexOf(a.status) - ordemStatus.indexOf(b.status)
  );

  return (
    <Box mt="70px" px={{ base: 2, md: 4 }} bg="transparent" minH="calc(100vh - 70px)" fontFamily="Arial, sans-serif">
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
          <Flex justify="space-between" align="center" direction={{ base: "column", md: "row" }} gap={3}>
            <Flex align="center" gap={3}>
              <TruckIcon viewBox="0 0 640 512" fill="currentColor">
                <path d="M624 352h-16V275.1c0-16.9-6.7-33.1-18.7-45.2L494.1 139.7c-12-12-28.3-18.7-45.2-18.7H400V80c0-26.5-21.5-48-48-48H48C21.5 32 0 53.5 0 80v272c0 26.5 21.5 48 48 48h16c0 35.3 28.7 64 64 64s64-28.7 64-64h256c0 35.3 28.7 64 64 64s64-28.7 64-64h16c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zM112 416c-17.6 0-32-14.4-32-32s14.4-32 32-32 32 14.4 32 32-14.4 32-32 32zm352 0c-17.6 0-32-14.4-32-32s14.4-32 32-32 32 14.4 32 32-14.4 32-32 32zm80-96h-80V160h45.3L544 198.7V320z" />
              </TruckIcon>
              <Heading size={{ base: "md", md: "lg" }} color="#15457b" fontWeight="600" fontFamily="Arial, sans-serif">
                Gestão de Viagens
              </Heading>
            </Flex>
            <NovaViagemModal
              triggerText="Nova Viagem"
              onSalvar={async (novaViagem) => {
                try {
                  const res = await axios.post("https://backend-frotas.onrender.com/api/viagens", {
                    ...novaViagem,
                    status: "Pendente",
                    transacoes: [],
                  });

                  setViagens((prev): Viagem[] => [...prev, res.data as Viagem]);
                } catch {
                  toast({
                    title: "Erro ao criar viagem",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                  });
                }
              }}
            />
          </Flex>
          
          {/* Barra de status com contadores */}
        <SimpleGrid columns={{ base: 2, sm: 4 }} spacing={0} mt={3} gap={0}>
          <Flex align="center" justify="center" borderRight="1px solid #e0e0e0" py={1}>
            <StatusTag status="Pendente" />
            <CircularBadge count={statusCounts.Pendente} colorScheme="orange" />
          </Flex>
          <Flex align="center" justify="center" borderRight="1px solid #e0e0e0" py={1}>
            <StatusTag status="Em andamento" />
            <CircularBadge count={statusCounts["Em andamento"]} colorScheme="blue" />
          </Flex>
          <Flex align="center" justify="center" borderRight="1px solid #e0e0e0" py={1}>
            <StatusTag status="Concluída" />
            <CircularBadge count={statusCounts.Concluída} colorScheme="green" />
          </Flex>
          <Flex align="center" justify="center" py={1}>
            <StatusTag status="Cancelada" />
            <CircularBadge count={statusCounts.Cancelada} colorScheme="red" />
          </Flex>
        </SimpleGrid>
        </CardHeader>

        <CardBody overflowX="auto" px={0} fontFamily="Arial, sans-serif">
          {!isMobile ? (
            <Table variant="simple" size="sm" fontFamily="Arial, sans-serif">
              <Thead bg="#f5f5f5">
                <Tr>
                  <Th borderColor="#e0e0e0" color="#666666" fontWeight="600" fontSize="12px" fontFamily="Arial, sans-serif" py={2}>Origem</Th>
                  <Th borderColor="#e0e0e0" color="#666666" fontWeight="600" fontSize="12px" fontFamily="Arial, sans-serif" py={2}>Destino</Th>
                  <Th borderColor="#e0e0e0" color="#666666" fontWeight="600" fontSize="12px" fontFamily="Arial, sans-serif" py={2}>Motorista</Th>
                  <Th borderColor="#e0e0e0" color="#666666" fontWeight="600" fontSize="12px" fontFamily="Arial, sans-serif" py={2}>Viatura</Th>
                  <Th borderColor="#e0e0e0" color="#666666" fontWeight="600" fontSize="12px" fontFamily="Arial, sans-serif" py={2}>Início</Th>
                  <Th borderColor="#e0e0e0" color="#666666" fontWeight="600" fontSize="12px" fontFamily="Arial, sans-serif" py={2}>Término</Th>
                  <Th borderColor="#e0e0e0" color="#666666" fontWeight="600" fontSize="12px" fontFamily="Arial, sans-serif" py={2}>Status</Th>
                  <Th borderColor="#e0e0e0" color="#666666" fontWeight="600" fontSize="12px" fontFamily="Arial, sans-serif" py={2}>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {viagensOrdenadas.map((viagem) => (
                  <Tr key={viagem.id} _hover={{ bg: "#f0f7ff" }} fontFamily="Arial, sans-serif">
                    <Td borderColor="#e0e0e0" fontWeight="500" fontSize="13px" py={2}>{viagem.origem}</Td>
                    <Td borderColor="#e0e0e0" fontWeight="500" fontSize="13px" py={2}>{viagem.destino}</Td>
                    <Td borderColor="#e0e0e0" fontWeight="500" fontSize="13px" py={2}>{viagem.motorista || <i>Não atribuído</i>}</Td>
                    <Td borderColor="#e0e0e0" fontWeight="500" fontSize="13px" py={2}>{viagem.viatura || <i>Não atribuído</i>}</Td>
                    <Td borderColor="#e0e0e0" fontWeight="500" fontSize="13px" py={2}>{viagem.dataInicio}</Td>
                    <Td borderColor="#e0e0e0" fontWeight="500" fontSize="13px" py={2}>{viagem.dataTermino}</Td>
                    <Td borderColor="#e0e0e0" py={2}>
                      <StatusTag status={viagem.status} />
                    </Td>
                    <Td borderColor="#e0e0e0" py={2}>
                      <Flex gap={1}>
                        <IconButton
                          aria-label="Visualizar"
                          icon={<ViewIcon />}
                          size="xs"
                          color="#15457b"
                          bg="transparent"
                          border="1px solid #a3bde3"
                          borderRadius="3px"
                          _hover={{ bg: "#dfeaf5" }}
                          onClick={() => {
                            navigate(`/historico/${viagem.id}`);
                          }}
                        />
                        <IconButton
                          aria-label="Editar"
                          icon={<EditIcon />}
                          size="xs"
                          color="#15457b"
                          bg="transparent"
                          border="1px solid #a3bde3"
                          borderRadius="3px"
                          _hover={{ bg: "#dfeaf5" }}
                          onClick={() => {
                            setViagemParaEditar(viagem);
                            onModalEditarOpen();
                          }}
                        />
                        <IconButton
                          aria-label="Iniciar"
                          icon={<TriangleDownIcon transform="rotate(90deg)" />}
                          size="xs"
                          color="#1f5c7a"
                          bg="transparent"
                          border="1px solid #9ec5d9"
                          borderRadius="3px"
                          _hover={{ bg: "#e6f0f5" }}
                          onClick={() => iniciarViagem(viagem.id)}
                          visibility={viagem.status === "Pendente" ? "visible" : "hidden"}
                        />
                        <IconButton
                          aria-label="Deletar"
                          icon={<DeleteIcon />}
                          size="xs"
                          color="#a33d3d"
                          bg="transparent"
                          border="1px solid #e0a8a8"
                          borderRadius="3px"
                          _hover={{ bg: "#f9e6e6" }}
                          onClick={() => deletarViagem(viagem.id)}
                          visibility={
                            viagem.status === "Concluída" || viagem.status === "Pendente"
                              ? "visible"
                              : "hidden"
                          }
                        />
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Box>
              {viagensOrdenadas.map((viagem) => (
                <ViagemCard
                  key={viagem.id}
                  viagem={viagem}
                  onView={() => navigate(`/historico/${viagem.id}`)}
                  onEdit={() => {
                    setViagemParaEditar(viagem);
                    onModalEditarOpen();
                  }}
                  onStart={() => iniciarViagem(viagem.id)}
                  onDelete={() => deletarViagem(viagem.id)}
                />
              ))}
            </Box>
          )}
        </CardBody>
      </Card>

      {viagemSelecionada && (
        <SelecionarMotoristaEquipamentoModal
          isOpen={isModalSelecionarOpen}
          onClose={() => {
            onModalSelecionarClose();
            setViagemSelecionada(null);
          }}
          onSalvar={salvarMotoristaViatura}
          motoristaAtual={viagemSelecionada.motorista}
          viaturaAtual={viagemSelecionada.viatura}
          dataInicioAtual={viagemSelecionada.dataInicio}
          odometroAtual={viagemSelecionada.odometro || 0}
        />
      )}

      {viagemParaEditar && (
        <EditarViagemModal
          isOpen={isModalEditarOpen}
          onClose={() => {
            setViagemParaEditar(null);
            onModalEditarClose();
          }}
          viagem={viagemParaEditar}
          onSalvar={async (dadosEditados) => {
            try {
              const res = await axios.put(`https://backend-frotas.onrender.com/api/viagens/${dadosEditados.id}`, dadosEditados);
              setViagens((old): Viagem[] =>
                old.map((v) => (v.id === dadosEditados.id ? res.data as Viagem : v))
              );
              toast({
                title: "Viagem atualizada com sucesso",
                status: "success",
                duration: 3000,
                isClosable: true,
              });
            } catch {
              toast({
                title: "Erro ao editar viagem",
                status: "error",
                duration: 3000,
                isClosable: true,
              });
            }
          }}
        />
      )}
    </Box>
  );
};

export default GestaoViagens;