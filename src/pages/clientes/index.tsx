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
import NovoClienteModal from "../../components/clientes/novocliente";
import EditarClienteModal from "../../components/clientes/modeleditar";
import DetalhesClienteModal from "../../components/clientes/detalhes";

export interface Cliente {
  id: number;
  nome: string;
  cnpj: string;
  cidade: string;
  estado: string;
  email: string;
  telefone: string;
  endereco: string;
  cep: string;
  responsavel: string;
  dataCadastro: string;
  status: string;
  observacoes: string;
}

const ClientIcon = chakra("svg", {
  baseStyle: {
    boxSize: 7,
    color: "#15457b",
  },
});

function StatusTag({ status }: { status: string }) {
  const normalized = status?.trim().toLowerCase();

  const statusMap: Record<string, { bg: string; color: string; border: string; label: string }> = {
    ativo: { 
      bg: "#e6f4e6", 
      color: "#2a6b2a", 
      border: "#9ecf9e",
      label: "Ativo" 
    },
    inativo: { 
      bg: "#f9e6e6", 
      color: "#a33d3d", 
      border: "#e0a8a8",
      label: "Inativo" 
    },
  };

  const statusInfo = statusMap[normalized] || {
    bg: "#f0f0f0",
    color: "#666666",
    border: "#d0d0d0",
    label: status || "Desconhecido",
  };

  return (
    <Box
      as="span"
      px={2}
      py={1}
      borderRadius="3px"
      fontWeight="600"
      fontSize="12px"
      color={statusInfo.color}
      bg={statusInfo.bg}
      border="1px solid"
      borderColor={statusInfo.border}
      userSelect="none"
    >
      {statusInfo.label}
    </Box>
  );
}

const GestaoClientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [clienteDetalhes, setClienteDetalhes] = useState<Cliente | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { isOpen: isOpenNovo, onOpen: onOpenNovo, onClose: onCloseNovo } = useDisclosure();
  const { isOpen: isOpenEditar, onOpen: onOpenEditar, onClose: onCloseEditar } = useDisclosure();
  const { isOpen: isOpenDetalhes, onOpen: onOpenDetalhes, onClose: onCloseDetalhes } = useDisclosure();

  const toast = useToast();

  useEffect(() => {
    setIsLoading(true);

    fetch("https://gestaofrota.onrender.com/api/clientes")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar os dados do cliente");
        return res.json();
      })
      .then((dados) => setClientes(dados))
      .catch((err) => {
        console.error(err);
        toast({
          title: "Erro ao carregar clientes",
          description: err.message,
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const adicionarCliente = async () => {
    try {
      const response = await fetch("https://gestaofrota.onrender.com/api/clientes");
      if (!response.ok) throw new Error("Erro ao buscar clientes");
      const data = await response.json();
      setClientes(data);
    } catch (error) {
      console.error("Erro ao atualizar lista de clientes", error);
    }
  };

  const deletarCliente = async (id: number) => {
    try {
      const response = await fetch(`https://gestaofrota.onrender.com/api/clientes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erro ao remover cliente");
      }

      setClientes((prev) => prev.filter((c) => c.id !== id));

      toast({
        title: "Cliente removido",
        description: `Cliente removido com sucesso.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao remover cliente",
        description: String(error),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const abrirModalEditar = (id: number) => {
    const cliente = clientes.find((c) => c.id === id);
    if (cliente) {
      setClienteSelecionado({ ...cliente });
      onOpenEditar();
    }
  };

  const abrirModalDetalhes = (id: number) => {
    const cliente = clientes.find((c) => c.id === id);
    if (cliente) {
      setClienteDetalhes({ ...cliente });
      onOpenDetalhes();
    }
  };

  const salvarClienteAtualizado = (clienteAtualizado: Cliente) => {
    setClientes((prevClientes) =>
      prevClientes.map((cliente) =>
        cliente.id === clienteAtualizado.id ? clienteAtualizado : cliente
      )
    );
    toast({
      title: "Cliente atualizado com sucesso",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
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
    <Box mt="80px" px={4} bg="transparent" minH="calc(100vh - 80px)" fontFamily="Arial, sans-serif">
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
              <ClientIcon viewBox="0 0 640 512" fill="currentColor">
                 <path d="M624 352h-16V275.1c0-16.9-6.7-33.1-18.7-45.2L494.1 139.7c-12-12-28.3-18.7-45.2-18.7H400V80c0-26.5-21.5-48-48-48H48C21.5 32 0 53.5 0 80v272c0 26.5 21.5 48 48 48h16c0 35.3 28.7 64 64 64s64-28.7 64-64h256c0 35.3 28.7 64 64 64s64-28.7 64-64h16c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zM112 416c-17.6 0-32-14.4-32-32s14.4-32 32-32 32 14.4 32 32-14.4 32-32 32zm352 0c-17.6 0-32-14.4-32-32s14.4-32 32-32 32 14.4 32 32-14.4 32-32 32zm80-96h-80V160h45.3L544 198.7V320z" />
              </ClientIcon>
              <Heading size="lg" color="#15457b" fontWeight="600" fontFamily="Arial, sans-serif">
                Gestão de Clientes
              </Heading>
            </Flex>
            <Button 
              bg="#e6f4e6"
              color="#2a6b2a"
              border="1px solid #9ecf9e"
              borderRadius="3px"
              fontWeight="normal"
              _hover={{ bg: "#d5e8d5" }}
              fontSize="13px"
              height="28px"
              px={3}
              leftIcon={<AddIcon />}
              onClick={onOpenNovo}
            >
              Novo Cliente
            </Button>
          </Flex>
        </CardHeader>

        <CardBody overflowX="auto" px={0}>
          <Table variant="simple" size="sm" fontFamily="Arial, sans-serif">
            <Thead bg="#f5f5f5">
              <Tr>
                <Th borderColor="#e0e0e0" color="#666666" fontSize="12px" fontWeight="600" py={2}>Nome</Th>
                <Th borderColor="#e0e0e0" color="#666666" fontSize="12px" fontWeight="600" py={2}>CNPJ</Th>
                <Th borderColor="#e0e0e0" color="#666666" fontSize="12px" fontWeight="600" py={2}>Cidade</Th>
                <Th borderColor="#e0e0e0" color="#666666" fontSize="12px" fontWeight="600" py={2}>Contato</Th>
                <Th borderColor="#e0e0e0" color="#666666" fontSize="12px" fontWeight="600" py={2}>Status</Th>
                <Th borderColor="#e0e0e0" color="#666666" fontSize="12px" fontWeight="600" py={2}>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {clientes.map((cliente) => (
                <Tr key={cliente.id} _hover={{ bg: "#f0f7ff" }} fontFamily="Arial, sans-serif">
                  <Td borderColor="#e0e0e0" fontWeight="500" fontSize="13px" py={2}>{cliente.nome}</Td>
                  <Td borderColor="#e0e0e0" fontWeight="500" fontSize="13px" py={2}>{cliente.cnpj}</Td>
                  <Td borderColor="#e0e0e0" fontWeight="500" fontSize="13px" py={2}>{cliente.cidade}</Td>
                  <Td borderColor="#e0e0e0" fontWeight="500" fontSize="13px" py={2}>{cliente.telefone}</Td>
                  <Td borderColor="#e0e0e0" py={2}>
                    <StatusTag status={cliente.status} />
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
                        onClick={() => abrirModalDetalhes(cliente.id)}
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
                        onClick={() => abrirModalEditar(cliente.id)}
                      />
                      <IconButton
                        aria-label="Excluir"
                        icon={<DeleteIcon />}
                        size="xs"
                        color="#a33d3d"
                        bg="transparent"
                        border="1px solid #e0a8a8"
                        borderRadius="3px"
                        _hover={{ bg: "#f9e6e6" }}
                        onClick={() => deletarCliente(cliente.id)}
                      />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      <NovoClienteModal isOpen={isOpenNovo} onClose={onCloseNovo} onSalvar={adicionarCliente} />
      
      {clienteSelecionado && isOpenEditar && (
        <EditarClienteModal
          key={clienteSelecionado.id}
          isOpen={isOpenEditar}
          onClose={onCloseEditar}
          cliente={clienteSelecionado}
          onSalvar={salvarClienteAtualizado}
        />
      )}

      {clienteDetalhes && (
        <DetalhesClienteModal
          isOpen={isOpenDetalhes}
          onClose={onCloseDetalhes}
          cliente={clienteDetalhes}
        />
      )}
    </Box>
  );
};

export default GestaoClientes;