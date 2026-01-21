import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useToast
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/config";

interface Usuario {
  id: string;
  nome: string;
  cpf: string;
  nascimento: string;
  email: string;
  telefone: string;
  cargo: string;
  departamento: string;
  status: string;
  tipo: string;
}

const FullScreenLoading = () => {
  return (
    <Flex
      position="fixed"
      top={0}
      left={0}
      w="100vw"
      h="100vh"
      bg="rgba(26, 32, 44, 0.75)"
      zIndex={9999}
      align="center"
      justify="center"
      flexDirection="column"
      gap={6}
      userSelect="none"
      backdropFilter="blur(4px)"
    >
      <Spinner
        thickness="6px"
        speed="0.8s"
        emptyColor="gray.500"
        color="gray.200"
        size="xl"
        style={{ filter: "drop-shadow(0 0 8px rgba(255, 255, 255, 0.4))" }}
      />
      <Text
        fontSize="2xl"
        fontWeight="semibold"
        color="gray.100"
        textShadow="0 0 4px rgba(0, 0, 0, 0.3)"
        animation="pulse 2s ease-in-out infinite"
      >
        Entrando...
      </Text>
    </Flex>
  );
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [erro, setErro] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const user = localStorage.getItem("usuarioLogado");
    if (user) navigate("/Viagens");
  }, [navigate]);

  const handleLogin = async () => {
    setIsLoading(true);
    setErro("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      const usuario: Usuario = {
        id: user.uid,
        nome: user.displayName || "Usuário",
        email: user.email || email,
        cpf: "",
        nascimento: "",
        telefone: "",
        cargo: "",
        departamento: "",
        status: "ativo",
        tipo: "usuario" 
      };

      localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
      setEmail("");
      setSenha("");
      setErro("");
      navigate("/Viagens");
      
    } catch (error: any) {
      console.error("Erro no login:", error);
      
      switch (error.code) {
        case "auth/invalid-email":
          setErro("E-mail inválido");
          break;
        case "auth/user-disabled":
          setErro("Usuário desativado");
          break;
        case "auth/user-not-found":
          setErro("Usuário não encontrado");
          break;
        case "auth/wrong-password":
          setErro("Senha incorreta");
          break;
        default:
          setErro("Erro ao fazer login. Tente novamente.");
      }
    }

    setIsLoading(false);
  };

  const handlePasswordReset = async () => {
    setIsResetLoading(true);
    setResetError("");
    setResetSuccess("");

    if (!resetEmail) {
      setResetError("Por favor, informe seu e-mail");
      setIsResetLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
      setResetError("");
      
      toast({
        title: "E-mail enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right"
      });
      
      setTimeout(() => {
        onClose();
        setResetEmail("");
        setResetSuccess("");
      }, 3000);
      
    } catch (error: any) {
      console.error("Erro ao enviar e-mail de recuperação:", error);
      
      switch (error.code) {
        case "auth/invalid-email":
          setResetError("E-mail inválido");
          break;
        case "auth/user-not-found":
          setResetError("Nenhuma conta encontrada com este e-mail");
          break;
        default:
          setResetError("Erro ao enviar e-mail de recuperação. Tente novamente.");
      }
    }

    setIsResetLoading(false);
  };

  const toggleShowSenha = () => setShowSenha(!showSenha);

  return (
    <>
      {isLoading && <FullScreenLoading />}
      <Flex
        minH="100vh"
        align="center"
        justify="center"
        bgImage="url('https://mlqt0se4pk9p.i.optimole.com/q:85/https://www.autodata.com.br/wordpress/wp-content/uploads//2023/05/0d6bffd3a0eecc6d6ef08e787b9c470c-1-scaled.jpeg')"
        bgPosition="center"
        bgRepeat="no-repeat"
        bgSize="cover"
      >
        <Box
          bg="rgba(255, 255, 255, 0.9)"
          p={8}
          borderRadius="md"
          boxShadow="lg"
          maxW="lg"
          w="100%"
          opacity={isLoading ? 0.5 : 1}
          pointerEvents={isLoading ? "none" : "auto"}
        >
          <Stack spacing={6} align="center" mb={4}>
            <Heading fontSize="3xl" textAlign="center">
              Sistema de Gestão de Frota
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Acesse sua conta para continuar
            </Text>
          </Stack>

          <Stack spacing={4}>
            <FormControl id="email">
              <FormLabel>E-mail</FormLabel>
              <Input
                type="email"
                placeholder="usuario@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isDisabled={isLoading}
              />
            </FormControl>
           
           
            <FormControl id="senha">
              <FormLabel>Senha</FormLabel>
              <InputGroup>
                <Input
                  type={showSenha ? "text" : "password"}
                  placeholder="********"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  isDisabled={isLoading}
                />
                <InputRightElement width="3rem">
                  <Button
                    h="1.5rem"
                    size="sm"
                    onClick={toggleShowSenha}
                    variant="ghost"
                    isDisabled={isLoading}
                  >
                    {showSenha ? <ViewOffIcon /> : <ViewIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            {erro && (
              <Text color="red.500" fontSize="sm" textAlign="center">
                {erro}
              </Text>
            )}

            <Stack spacing={6} pt={4}>
              <Button
                bg="teal.500"
                color="white"
                _hover={{ bg: "teal.600" }}
                onClick={handleLogin}
                width="100%"
                isLoading={isLoading}
                loadingText="Entrando"
              >
                Entrar
              </Button>

              <Button
                variant="link"
                color="teal.500"
                _hover={{ textDecoration: "none", color: "teal.600" }}
                onClick={onOpen}
                isDisabled={isLoading}
              >
                Esqueci minha senha
              </Button>
            </Stack>
          </Stack>

          <Text fontSize="xs" color="gray.500" textAlign="center" mt={6}>
            © {new Date().getFullYear()} Todos os direitos reservados • Strix_Solutions
          </Text>
        </Box>
      </Flex>

      {/* Modal de Recuperação de Senha */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Recuperar Senha</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={4}>
              Informe seu e-mail para receber um link de recuperação de senha.
            </Text>
            
            <FormControl>
              <FormLabel>E-mail</FormLabel>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                isDisabled={isResetLoading}
              />
            </FormControl>

            {resetError && (
              <Text color="red.500" fontSize="sm" mt={2}>
                {resetError}
              </Text>
            )}

            {resetSuccess && (
              <Text color="green.500" fontSize="sm" mt={2}>
                {resetSuccess}
              </Text>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose} isDisabled={isResetLoading}>
              Cancelar
            </Button>
            <Button
              colorScheme="teal"
              onClick={handlePasswordReset}
              isLoading={isResetLoading}
              loadingText="Enviando"
            >
              Enviar Link de Recuperação
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default LoginPage;