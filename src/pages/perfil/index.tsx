import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Flex,
  Heading,
  Avatar,
  Text,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Spacer,
  Select,
  VStack,
  HStack,
  Badge,
  Divider,
  ThemeProvider,
  CSSReset,
  extendTheme
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import { ModalPagamento } from "../../components/pagamentos";
import { getStoredUser, setStoredUser } from "../../auth/userStorage";

const extjsTheme = extendTheme({
  colors: {
    extjs: {
      blue: "#157fcc",
      darkBlue: "#0e639e",
      lightGray: "#f5f5f5",
      borderGray: "#d0d0d0",
      textGray: "#4d4d4d",
    }
  },
  components: {
    Button: {
      variants: {
        extjs: {
          bg: "linear-gradient(to bottom, #157fcc, #0e639e)",
          color: "white",
          border: "none",
          borderRadius: "4px",
          fontWeight: "500",
          fontSize: "13px",
          height: "34px",
          _hover: {
            bg: "linear-gradient(to bottom, #0e639e, #0b4d7c)",
          },
          _active: {
            bg: "#0b4d7c",
          },
          _disabled: {
            bg: "#a0a0a0",
            cursor: "not-allowed",
          }
        },
        payment: {
          bg: "linear-gradient(to bottom, #00a859, #008f4c)",
          color: "white",
          border: "none",
          borderRadius: "4px",
          fontWeight: "600",
          fontSize: "13px",
          height: "34px",
          _hover: {
            bg: "linear-gradient(to bottom, #008f4c, #007a41)",
            transform: "translateY(-1px)",
          },
          _active: {
            bg: "#007a41",
          }
        }
      }
    },
    FormLabel: {
      baseStyle: {
        fontSize: "13px",
        fontWeight: "500",
        color: "#4d4d4d",
        mb: "5px"
      }
    },
    Input: {
      variants: {
        extjs: {
          field: {
            border: "1px solid #d0d0d0",
            borderRadius: "3px",
            fontSize: "13px",
            height: "34px",
            _focus: {
              borderColor: "#157fcc",
              boxShadow: "0 0 3px rgba(21, 127, 204, 0.4)"
            }
          }
        }
      }
    },
    Select: {
      variants: {
        extjs: {
          field: {
            border: "1px solid #d0d0d0",
            borderRadius: "3px",
            fontSize: "13px",
            height: "34px",
            _focus: {
              borderColor: "#157fcc",
              boxShadow: "0 0 3px rgba(21, 127, 204, 0.4)"
            }
          }
        }
      }
    },
    Modal: {
      baseStyle: {
        header: {
          bg: "linear-gradient(to bottom, #f9f9f9, #eaeaea)",
          borderBottom: "1px solid #d0d0d0",
          py: "12px",
          px: "15px",
          fontWeight: "bold",
          color: "#4d4d4d",
          fontSize: "15px"
        },
        body: {
          p: 4
        },
        footer: {
          p: 4,
          borderTop: "1px solid #d0d0d0"
        }
      }
    }
  }
});

interface UserProfile {
  uid: string;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  nascimento: string;
  cargo: string;
  departamento: string;
  status: string;
  tipo: string;
  createdAt: any;
  updatedAt: any;
}

const Perfil: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [editUser, setEditUser] = useState<Partial<UserProfile> | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isPaymentOpen, onOpen: onPaymentOpen, onClose: onPaymentClose } = useDisclosure();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  

  const showError = useCallback((message: string) => {
    toast({
      title: "Erro",
      description: message,
      status: "error",
      duration: 4000,
      isClosable: true,
      position: "top-right"
    });
  }, [toast]);

  
  const showSuccess = useCallback((message: string) => {
    toast({
      title: "Sucesso",
      description: message,
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top-right"
    });
  }, [toast]);


  useEffect(() => {
    try {
      const usuario = getStoredUser<UserProfile>();
      if (!usuario) { showError("Perfil de usuário indisponível."); return; }
      setUser(usuario); setEditUser(usuario);
    } catch { showError("Não foi possível carregar os dados do perfil."); }
  }, [showError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editUser) return;
    setEditUser({ ...editUser, [e.target.name]: e.target.value });
  };

const handleSave = async () => {
    if (!user || !editUser) return;
    const updatedUser = { ...user, ...editUser, updatedAt: new Date().toISOString() };
    setStoredUser(updatedUser);
    setUser(updatedUser); setEditUser(updatedUser);
    showSuccess("Perfil atualizado neste dispositivo."); onClose();
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "—";
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "—";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo": return "green";
      case "inativo": return "red";
      case "pendente": return "yellow";
      default: return "gray";
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "administrador": return "purple";
      case "motorista": return "blue";
      case "usuario": return "teal";
      default: return "gray";
    }
  };

  if (!user) {
    return (
      <ThemeProvider theme={extjsTheme}>
        <CSSReset />
        <Box>
          <Box maxW="800px" mx="auto">
            <Text>Carregando...</Text>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={extjsTheme}>
      <CSSReset />
      <Box bg="transparent">
        <Box maxW="800px" mx="auto">
          <Box 
            bg="white" 
            borderRadius="4px" 
            boxShadow="0 2px 4px rgba(0, 0, 0, 0.15)" 
            overflow="hidden"
            mb={6}
          >
            <Box
              bg="linear-gradient(to bottom, #f9f9f9, #eaeaea)"
              borderBottom="1px solid #d0d0d0"
              py="12px"
              px="15px"
              fontWeight="bold"
              color="#4d4d4d"
              fontSize="15px"
            >
              Perfil do Usuário
            </Box>
            
            <Box p={5}>
              <Flex align="center" gap={4} mb={6}>
                <Avatar name={user.nome} size="xl" bg="#157fcc" color="white" />
                <Box>
                  <Heading size="lg" color="#4d4d4d" fontFamily="inherit">
                    {user.nome}
                  </Heading>
                  <Text color="#666">{user.email}</Text>
                  <HStack mt={2} spacing={2}>
                    <Badge colorScheme={getTipoColor(user.tipo)}>{user.tipo}</Badge>
                  </HStack>
                </Box>
                <Spacer />
                <HStack spacing={3}>
                  <Button
                    variant="payment"
                    onClick={onPaymentOpen}
                  >
                    💳 Assinar Plano
                  </Button>
                  <Button
                    variant="extjs"
                    leftIcon={<EditIcon />}
                    onClick={onOpen}
                  >
                    Editar Perfil
                  </Button>
                </HStack>
              </Flex>

              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Box>
                    <Text fontSize="13px" fontWeight="500" color="#4d4d4d" mb={1}>CPF</Text>
                    <Text color="#666">{user.cpf || "—"}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="13px" fontWeight="500" color="#4d4d4d" mb={1}>Telefone</Text>
                    <Text color="#666">{user.telefone || "—"}</Text>
                  </Box>
                </HStack>
                
                <HStack justify="space-between">
                  <Box>
                    <Text fontSize="13px" fontWeight="500" color="#4d4d4d" mb={1}>Data de Nascimento</Text>
                    <Text color="#666">{user.nascimento || "—"}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="13px" fontWeight="500" color="#4d4d4d" mb={1}>Cargo</Text>
                    <Text color="#666">{user.cargo || "—"}</Text>
                  </Box>
                </HStack>
                
                <Box>
                  <Text fontSize="13px" fontWeight="500" color="#4d4d4d" mb={1}>Departamento</Text>
                  <Text color="#666">{user.departamento || "—"}</Text>
                </Box>
                
                <Divider borderColor="#d0d0d0" />
                
                <HStack justify="space-between">
                  <Box>
                    <Text fontSize="12px" color="#999" mb={1}>Criado em</Text>
                    <Text fontSize="12px" color="#666">{formatDate(user.createdAt)}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="12px" color="#999" mb={1}>Última atualização</Text>
                    <Text fontSize="12px" color="#666">{formatDate(user.updatedAt)}</Text>
                  </Box>
                </HStack>
              </VStack>
            </Box>
          </Box>

        {/* Modal para edição */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Editar Perfil</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={4} px={4} pt={4} maxH="70vh" overflowY="auto">
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Nome Completo</FormLabel>
                  <Input
                    variant="extjs"
                    name="nome"
                    value={editUser?.nome || ""}
                    onChange={handleChange}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    variant="extjs"
                    name="email"
                    type="email"
                    value={editUser?.email || ""}
                    onChange={handleChange}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Telefone</FormLabel>
                  <Input
                    variant="extjs"
                    name="telefone"
                    value={editUser?.telefone || ""}
                    onChange={handleChange}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>CPF</FormLabel>
                  <Input
                    variant="extjs"
                    name="cpf"
                    value={editUser?.cpf || ""}
                    onChange={handleChange}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <Input
                    variant="extjs"
                    name="nascimento"
                    type="date"
                    value={editUser?.nascimento || ""}
                    onChange={handleChange}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Cargo</FormLabel>
                  <Input
                    variant="extjs"
                    name="cargo"
                    value={editUser?.cargo || ""}
                    onChange={handleChange}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Departamento</FormLabel>
                  <Input
                    variant="extjs"
                    name="departamento"
                    value={editUser?.departamento || ""}
                    onChange={handleChange}
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Tipo de Usuário</FormLabel>
                  <Select
                    variant="extjs"
                    name="tipo"
                    value={editUser?.tipo || ""}
                    onChange={handleChange}
                  >
                    <option value="administrador">Administrador</option>
                    <option value="usuario">Usuário</option>
                    <option value="motorista">Motorista</option>
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>

            <ModalFooter>
              <Button variant="outline" mr={3} onClick={onClose}>
                Cancelar
              </Button>
              <Button
                variant="extjs"
                onClick={handleSave}
                isLoading={loading}
                loadingText="Salvando"
              >
                Salvar Alterações
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal de Pagamento */}
        <ModalPagamento 
          isOpen={isPaymentOpen}
          onClose={onPaymentClose}
          usuario={{
            id: user.uid,
            nome: user.nome,
            email: user.email
          }}
        />
      </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Perfil;
