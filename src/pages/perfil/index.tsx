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
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../firebase/config";
import { onAuthStateChanged, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

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
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);


  
  // ✅ showError com useCallback
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

  // ✅ showSuccess com useCallback
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

  // ✅ loadUserData com useCallback
  const loadUserData = useCallback(async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        setUser(userData);
        setEditUser(userData);
        localStorage.setItem("usuarioLogado", JSON.stringify(userData));
      } else {
        showError("Perfil do usuário não encontrado.");
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
      showError("Não foi possível carregar os dados do perfil.");
    }
  }, [showError]);

  // ✅ useEffect corrigido
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await loadUserData(user.uid);
      } else {
        const usuarioLogadoStr = localStorage.getItem("usuarioLogado");
        if (usuarioLogadoStr) {
          try {
            const usuarioLogado = JSON.parse(usuarioLogadoStr);
            setUser(usuarioLogado);
            setEditUser(usuarioLogado);
          } catch (error) {
            console.error("Erro ao carregar dados do usuário:", error);
            showError("Não foi possível carregar os dados do perfil.");
          }
        } else {
          showError("Usuário não está logado.");
        }
      }
    });

    return () => unsubscribe();
  }, [loadUserData, showError]);
 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editUser) return;
    setEditUser({ ...editUser, [e.target.name]: e.target.value });
  };

const handleSave = async () => {
  // 🔍 DEBUG - Verifique se os dados estão presentes
  console.log("🔄 Iniciando atualização do perfil...");
  console.log("user:", user);
  console.log("user.uid:", user?.uid);
  console.log("editUser:", editUser);

  // ✅ Verificação robusta antes de prosseguir
  if (!user || !user.uid || typeof user.uid !== 'string' || user.uid.length < 5) {
    console.error("❌ user ou user.uid inválido:", user);
    showError("Dados do usuário incompletos. Faça login novamente.");
    setLoading(false);
    return;
  }

  if (!editUser) {
    console.error("❌ editUser está vazio");
    showError("Dados de edição não carregados.");
    setLoading(false);
    return;
  }

  setLoading(true);
  
  try {
    // ✅ Forma mais segura de criar a referência
    console.log("📝 Tentando atualizar documento para UID:", user.uid);
    
    const userRef = doc(db, "users", user.uid);
    
    // ✅ Dados para atualização (garantindo que não há undefined)
    const updateData = {
      nome: editUser.nome || "",
      email: editUser.email || "",
      telefone: editUser.telefone || "",
      cpf: editUser.cpf || "",
      nascimento: editUser.nascimento || "",
      cargo: editUser.cargo || "",
      departamento: editUser.departamento || "",
      status: editUser.status || "ativo",
      tipo: editUser.tipo || "usuario",
      updatedAt: new Date()
    };

    console.log("📦 Dados para atualização:", updateData);
    
    await updateDoc(userRef, updateData);
    
    // ✅ Atualizar estado local
    const updatedUser = { 
      ...user, 
      ...updateData,
      updatedAt: new Date() 
    };
    
    setUser(updatedUser);
    setEditUser(updatedUser);
    localStorage.setItem("usuarioLogado", JSON.stringify(updatedUser));
    
    showSuccess("Suas informações foram salvas com sucesso.");
    onClose();
  } catch (error: any) {
    console.error("❌ Erro detalhado ao atualizar:", error);
    
    // 🔍 Log mais detalhado para debugging
    if (error.code) {
      console.log("Código do erro:", error.code);
      console.log("Mensagem do erro:", error.message);
    }
    
    showError(error.message || "Não foi possível atualizar o perfil.");
  }

  setLoading(false);
};

  const handlePasswordChange = async () => {
    if (!auth.currentUser) {
      showError("Usuário não autenticado.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showError("As senhas não coincidem.");
      return;
    }

    if (newPassword.length < 6) {
      showError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setPasswordLoading(true);
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email!,
        currentPassword
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      
      showSuccess("Sua senha foi atualizada com sucesso.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Erro ao alterar senha:", error);
      
      let errorMessage = "Não foi possível alterar a senha.";
      if (error.code === "auth/wrong-password") {
        errorMessage = "Senha atual incorreta.";
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage = "Por favor, faça login novamente para alterar sua senha.";
      }
      
      showError(errorMessage);
    }
    setPasswordLoading(false);
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
        <Box bg="#e0e0e0" minH="100vh" pt="90px" px={4}>
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
      <Box bg="trasnparent" minH="100vh" pt="90px" px={4} marginTop={35}>
        <Box maxW="800px" mx="auto">
          {/* Card de Informações do Perfil */}
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
                    <Badge colorScheme={getStatusColor(user.status)}>{user.status}</Badge>
                    <Badge colorScheme={getTipoColor(user.tipo)}>{user.tipo}</Badge>
                  </HStack>
                </Box>
                <Spacer />
                <Button
                  variant="extjs"
                  leftIcon={<EditIcon />}
                  onClick={onOpen}
                >
                  Editar Perfil
                </Button>
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

          {/* Card para alteração de senha */}
          <Box 
            bg="white" 
            borderRadius="4px" 
            boxShadow="0 2px 4px rgba(0, 0, 0, 0.15)" 
            overflow="hidden"
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
              Alterar Senha
            </Box>
            
            <Box p={5}>
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Senha Atual</FormLabel>
                  <Input
                    variant="extjs"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha atual"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Nova Senha</FormLabel>
                  <Input
                    variant="extjs"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite a nova senha (mín. 6 caracteres)"
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Confirmar Nova Senha</FormLabel>
                  <Input
                    variant="extjs"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme a nova senha"
                  />
                </FormControl>
                
                <Button
                  variant="extjs"
                  onClick={handlePasswordChange}
                  isLoading={passwordLoading}
                  loadingText="Alterando Senha"
                >
                  Alterar Senha
                </Button>
              </VStack>
            </Box>
          </Box>
        </Box>

        {/* Modal para edição */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Editar Perfil</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
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
                  <FormLabel>Status</FormLabel>
                  <Select
                    variant="extjs"
                    name="status"
                    value={editUser?.status || ""}
                    onChange={handleChange}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="pendente">Pendente</option>
                  </Select>
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
      </Box>
    </ThemeProvider>
  );
};

export default Perfil;