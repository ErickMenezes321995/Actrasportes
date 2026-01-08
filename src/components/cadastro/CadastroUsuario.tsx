import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
  Heading,
  Select,
  Grid,
  GridItem,
  CSSReset,
  ThemeProvider,
  extendTheme
} from "@chakra-ui/react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/config";

// Tema personalizado para imitar o estilo do ExtJS
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
    }
  }
});

const CadastroUsuario: React.FC = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    cpf: "",
    nascimento: "",
    telefone: "",
    cargo: "",
    departamento: "",
    status: "ativo",
    tipo: "usuario"
  });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Criar usuário no Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.senha
      );
      
      const user = userCredential.user;
      
      // 2. Salvar dados adicionais no Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        nome: formData.nome,
        email: formData.email,
        cpf: formData.cpf,
        nascimento: formData.nascimento,
        telefone: formData.telefone,
        cargo: formData.cargo,
        departamento: formData.departamento,
        status: formData.status,
        tipo: formData.tipo,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      toast({
        title: "Sucesso",
        description: "Usuário cadastrado com sucesso!",
        status: "success",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });
      
      // Limpar formulário
      setFormData({
        nome: "",
        email: "",
        senha: "",
        cpf: "",
        nascimento: "",
        telefone: "",
        cargo: "",
        departamento: "",
        status: "ativo",
        tipo: "usuario"
      });
      
    } catch (error: any) {
      console.error("Erro ao cadastrar usuário:", error);
      
      let errorMessage = "Erro ao cadastrar usuário.";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este email já está em uso.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "A senha deve ter pelo menos 6 caracteres.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email inválido.";
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        status: "error",
        duration: 3000,
        position: "top-right",
        isClosable: true,
      });
    }

    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <ThemeProvider theme={extjsTheme}>
      <CSSReset />
      <Box 
        bg="transparent" 
        minH="100vh" 
        display="flex" 
        justifyContent="center" 
        alignItems="flex-start" 
        pt="20px"
        px="20px"
        marginTop={35}
      >
        <Box 
          w="700px" 
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
            Cadastrar Usuário
          </Box>
          
          <Box p="20px">
            <form onSubmit={handleSubmit}>
              <Grid templateColumns="repeat(2, 1fr)" gap="15px" w="100%">
                <GridItem colSpan={2}>
                  <FormControl isRequired>
                    <FormLabel>Nome Completo</FormLabel>
                    <Input
                      variant="extjs"
                      name="nome"
                      value={formData.nome}
                      onChange={handleChange}
                      placeholder="Digite o nome completo"
                    />
                  </FormControl>
                </GridItem>

                <GridItem colSpan={2}>
                  <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                      variant="extjs"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="usuario@empresa.com"
                    />
                  </FormControl>
                </GridItem>

                <GridItem colSpan={2}>
                  <FormControl isRequired>
                    <FormLabel>Senha</FormLabel>
                    <Input
                      variant="extjs"
                      type="password"
                      name="senha"
                      value={formData.senha}
                      onChange={handleChange}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl>
                    <FormLabel>CPF</FormLabel>
                    <Input
                      variant="extjs"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleChange}
                      placeholder="000.000.000-00"
                    />
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <Input
                      variant="extjs"
                      type="date"
                      name="nascimento"
                      value={formData.nascimento}
                      onChange={handleChange}
                    />
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl>
                    <FormLabel>Telefone</FormLabel>
                    <Input
                      variant="extjs"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleChange}
                      placeholder="(11) 99999-9999"
                    />
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>Cargo</FormLabel>
                    <Select
                      variant="extjs"
                      name="cargo"
                      value={formData.cargo}
                      onChange={handleChange}
                      placeholder="Selecione o cargo"
                    >
                      <option value="Desenvolvedor">Desenvolvedor</option>
                      <option value="Administrador">Administrador</option>
                      <option value="Gerente">Gerente</option>
                      <option value="Coordenador">Coordenador</option>
                      <option value="Assistente">Assistente</option>
                      <option value="Motorista">Motorista</option>
                    </Select>
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl>
                    <FormLabel>Departamento</FormLabel>
                    <Input
                      variant="extjs"
                      name="departamento"
                      value={formData.departamento}
                      onChange={handleChange}
                      placeholder="Ex: Transportes, Logística"
                    />
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>Status</FormLabel>
                    <Select
                      variant="extjs"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                      <option value="pendente">Pendente</option>
                    </Select>
                  </FormControl>
                </GridItem>

                <GridItem>
                  <FormControl isRequired>
                    <FormLabel>Tipo de Usuário</FormLabel>
                    <Select
                      variant="extjs"
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleChange}
                    >
                      <option value="administrador">Administrador</option>
                      <option value="usuario">Usuário</option>
                      <option value="motorista">Motorista</option>
                    </Select>
                  </FormControl>
                </GridItem>
              </Grid>

              <Button
                variant="extjs"
                type="submit"
                isLoading={loading}
                loadingText="Cadastrando"
                w="100%"
                mt="10px"
              >
                Cadastrar Usuário
              </Button>
            </form>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default CadastroUsuario;