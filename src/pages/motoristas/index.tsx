import React, { useEffect, useState } from "react";
import axios from "axios";
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
  Center,
  Button
} from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import NovaMotoristaModal from "../../components/modalmotorista/NovaMotoristaModal";
import EditarMotoristaModal from "../../components/modalmotorista/editarmotorista";

interface Motorista {
  id: number;
  nome: string;
  telefone: string;
  cnh: string;
  email: string;
  cpf: string;
  rg: string;
  validadeCnh: string;
  endereco: string;
  status: string;
}

const UserIcon = chakra("svg", {
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

const GestaoMotoristas: React.FC = () => {
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [motoristaSelecionado, setMotoristaSelecionado] = useState<Motorista | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchMotoristas = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get<Motorista[]>("https://backend-frotas.onrender.com/api/motoristas");
      setMotoristas(res.data);
    } catch (error) {
      toast({
        title: "Erro ao carregar motoristas",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMotoristas();
  }, []);

  const deletarMotorista = async (id: number) => {
    try {
      await axios.delete(`https://backend-frotas.onrender.com/api/motoristas/${id}`);
      setMotoristas((prev) => prev.filter((m) => m.id !== id));
      toast({
        title: "Motorista removido",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Erro ao deletar motorista",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const abrirModalEditar = (id: number) => {
    const motorista = motoristas.find((m) => m.id === id);
    if (motorista) {
      setMotoristaSelecionado({ ...motorista });
      onOpen();
    }
  };

  const salvarMotoristaAtualizado = (motoristaAtualizado: Motorista) => {
    setMotoristas((prev) =>
      prev.map((m) => (m.id === motoristaAtualizado.id ? motoristaAtualizado : m))
    );
    onClose();
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
              <UserIcon viewBox="0 0 448 512" fill="currentColor">
                <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm89.6 32h-179.2C60.4 288 0 348.4 0 423.2V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-40.8c0-74.8-60.4-135.2-134.4-135.2z" />
              </UserIcon>
              <Heading 
                size="md" 
                fontFamily="Arial, sans-serif"
                fontWeight="600"
                color="#15457b"
              >
                Gestão de Motoristas
              </Heading>
            </Flex>

            <NovaMotoristaModal onSalvar={fetchMotoristas} />
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
                  Nome
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
                  Telefone
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
                  CNH
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
              {motoristas.map((motorista) => (
                <Tr 
                  key={motorista.id} 
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
                    {motorista.nome}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    {motorista.telefone}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    {motorista.cnh}
                  </Td>
                  <Td 
                    border="1px solid #e0e0e0" 
                    py={2} 
                    px={3}
                    fontSize="13px"
                    color="#333333"
                  >
                    <StatusTag status={motorista.status} />
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
                        onClick={() => abrirModalEditar(motorista.id)}
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
                        onClick={() => deletarMotorista(motorista.id)}
                      />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      {motoristaSelecionado && (
        <EditarMotoristaModal
          key={motoristaSelecionado.id}
          isOpen={isOpen}
          onClose={onClose}
          motorista={motoristaSelecionado}
          onSalvar={salvarMotoristaAtualizado}
        />
      )}
    </Box>
  );
};

export default GestaoMotoristas;