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
  Center,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import NovoFornecedorModal from "../../components/fornecedores/novo";
import EditarFornecedorModal from "../../components/fornecedores/editarfornecedor";
import DetalhesFornecedorModal from "../../components/fornecedores/detalhes";

interface Fornecedor {
  id: number;
  nomeFantasia: string;
  email: string;
  telefone: string;
  status: string;
  cidade?: string;
  responsavel?: string;
}

const SupplierIcon = chakra("svg", {
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

const GestaoFornecedores: React.FC = () => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [fornecedorSelecionado, setFornecedorSelecionado] = useState<Fornecedor | null>(null);
  const [fornecedorDetalhes, setFornecedorDetalhes] = useState<Fornecedor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { isOpen: isOpenNovo, onOpen: onOpenNovo, onClose: onCloseNovo } = useDisclosure();
  const { isOpen: isOpenEditar, onOpen: onOpenEditar, onClose: onCloseEditar } = useDisclosure();
  const { isOpen: isOpenDetalhes, onOpen: onOpenDetalhes, onClose: onCloseDetalhes } = useDisclosure();

  const toast = useToast();

  useEffect(() => {
    setIsLoading(true);
    fetch("https://gestaofrota.onrender.com/api/fornecedores")
      .then((res) => {
        if (!res.ok) throw new Error("Erro na requisição");
        return res.json();
      })
      .then((data) => {
        setFornecedores(data);
      })
      .catch((error) => {
        console.error("Erro ao buscar fornecedores:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os fornecedores.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [toast]);

  const deletarFornecedor = (id: number) => {
    const fornecedorRemovido = fornecedores.find((f) => f.id === id);

    fetch(`https://gestaofrota.onrender.com/api/fornecedores/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erro ao excluir fornecedor.");
        }

        setFornecedores((prev) => prev.filter((f) => f.id !== id));

        toast({
          title: "Fornecedor removido",
          description: `Fornecedor ${fornecedorRemovido?.nomeFantasia} removido com sucesso.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      })
      .catch((error) => {
        console.error("Erro ao excluir fornecedor:", error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o fornecedor.",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      });
  };

  const abrirModalEditar = (id: number) => {
    const fornecedor = fornecedores.find((f) => f.id === id);
    if (fornecedor) {
      setFornecedorSelecionado({
        ...fornecedor,
        email: fornecedor.email || "",       
        telefone: fornecedor.telefone || "", 
        cidade: fornecedor.cidade || "",     
        responsavel: fornecedor.responsavel || "",
      });
      onOpenEditar();
    }
  };

  const abrirModalDetalhes = (id: number) => {
    const fornecedor = fornecedores.find((f) => f.id === id);
    if (fornecedor) {
      setFornecedorDetalhes({ ...fornecedor });
      onOpenDetalhes();
    }
  };

  const salvarFornecedorAtualizado = (fornecedorAtualizado: Fornecedor) => {
    setFornecedores((prev) =>
      prev.map((f) => (f.id === fornecedorAtualizado.id ? fornecedorAtualizado : f))
    );
    toast({
      title: "Fornecedor atualizado",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    fecharEditarModal();
  };

  const adicionarFornecedor = (novoFornecedorRecebido: any) => {
    if (!novoFornecedorRecebido.id) {
      toast({
        title: "Erro",
        description: "Fornecedor sem ID recebido. Tente novamente.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setFornecedores((prev) => [novoFornecedorRecebido as Fornecedor, ...prev]);
    toast({
      title: "Fornecedor cadastrado com sucesso!",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const fecharEditarModal = () => {
    setFornecedorSelecionado(null);
    onCloseEditar();
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
          <Flex justify="space-between" align="center" >
            <Flex align="center" gap={3}>
              <SupplierIcon viewBox="0 0 640 512" fill="currentColor">
                <path d="M624 352h-16V275.1c0-16.9-6.7-33.1-18.7-45.2L494.1 139.7c-12-12-28.3-18.7-45.2-18.7H400V80c0-26.5-21.5-48-48-48H48C21.5 32 0 53.5 0 80v272c0 26.5 21.5 48 48 48h16c0 35.3 28.7 64 64 64s64-28.7 64-64h256c0 35.3 28.7 64 64 64s64-28.7 64-64h16c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zM112 416c-17.6 0-32-14.4-32-32s14.4-32 32-32 32 14.4 32 32-14.4 32-32 32zm352 0c-17.6 0-32-14.4-32-32s14.4-32 32-32 32 14.4 32 32-14.4 32-32 32zm80-96h-80V160h45.3L544 198.7V320z" />
              </SupplierIcon>
              <Heading size="lg" color="#15457b" fontWeight="600" fontFamily="Arial, sans-serif">
                Gestão de Fornecedores
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
              Novo Fornecedor
            </Button>
          </Flex>
        </CardHeader>

        <CardBody overflowX="auto" px={0}>
          <Table variant="simple" size="sm" fontFamily="Arial, sans-serif">
            <Thead bg="#f5f5f5">
              <Tr>
                <Th borderColor="#e0e0e0" color="#666666" fontSize="12px" fontWeight="600" py={2}>Empresa</Th>
                <Th borderColor="#e0e0e0" color="#666666" fontSize="12px" fontWeight="600" py={2}>Email</Th>
                <Th borderColor="#e0e0e0" color="#666666" fontSize="12px" fontWeight="600" py={2}>Telefone</Th>
                <Th borderColor="#e0e0e0" color="#666666" fontSize="12px" fontWeight="600" py={2}>Cidade</Th>
                <Th borderColor="#e0e0e0" color="#666666" fontSize="12px" fontWeight="600" py={2}>Responsável</Th>
                <Th borderColor="#e0e0e0" color="#666666" fontSize="12px" fontWeight="600" py={2}>Status</Th>
                <Th borderColor="#e0e0e0" color="#666666" fontSize="12px" fontWeight="600" py={2}>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {fornecedores.map((fornecedor) => (
                <Tr key={fornecedor.id} _hover={{ bg: "#f0f7ff" }} fontFamily="Arial, sans-serif">
                  <Td borderColor="#e0e0e0" fontWeight="500" fontSize="13px" py={2}>{fornecedor.nomeFantasia}</Td>
                  <Td borderColor="#e0e0e0" fontWeight="500" fontSize="13px" py={2}>{fornecedor.email}</Td>
                  <Td borderColor="#e0e0e0" fontWeight="500" fontSize="13px" py={2}>{fornecedor.telefone}</Td>
                  <Td borderColor="#e0e0e0" fontWeight="500" fontSize="13px" py={2}>{fornecedor.cidade || "-"}</Td>
                  <Td borderColor="#e0e0e0" fontWeight="500" fontSize="13px" py={2}>{fornecedor.responsavel || "-"}</Td>
                  <Td borderColor="#e0e0e0" py={2}>
                    <StatusTag status={fornecedor.status} />
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
                        onClick={() => abrirModalDetalhes(fornecedor.id)}
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
                        onClick={() => abrirModalEditar(fornecedor.id)}
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
                        onClick={() => deletarFornecedor(fornecedor.id)}
                      />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>

      <NovoFornecedorModal
        isOpen={isOpenNovo}
        onClose={onCloseNovo}
        onSalvar={adicionarFornecedor}
      />

      {fornecedorSelecionado && (
        <EditarFornecedorModal
          key={fornecedorSelecionado.id}
          isOpen={isOpenEditar}
          onClose={fecharEditarModal}       
          fornecedor={fornecedorSelecionado}
          onSalvar={salvarFornecedorAtualizado}  
        />
      )}

      {fornecedorDetalhes && (
        <DetalhesFornecedorModal
          isOpen={isOpenDetalhes}
          onClose={onCloseDetalhes}
          fornecedor={fornecedorDetalhes}
        />
      )}
    </Box>
  );
};

export default GestaoFornecedores;