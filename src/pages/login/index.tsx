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
import { getUserById, Usuario } from "../../services/userService";
import { ModalPagamento } from "../../components/pagamentos";

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
  const [erro, setErro] = useState<string>("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [showPaymentLink, setShowPaymentLink] = useState(false);
  const [inactiveUser, setInactiveUser] = useState<{ id: string; nome: string; email: string; cpf?: string } | null>(null);
  
  const { isOpen: isResetOpen, onOpen: onResetOpen, onClose: onResetClose } = useDisclosure();
  const { isOpen: isPaymentOpen, onOpen: onPaymentOpen, onClose: onPaymentClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const checkStoredUserStatus = async () => {
      const userStorage = localStorage.getItem("usuarioLogado");
      
      if (userStorage) {
        try {
          const usuario = JSON.parse(userStorage);
          
          
          const userData = await getUserById(usuario.id);
          
          if (userData && userData.status === true) {
           
            localStorage.setItem("usuarioLogado", JSON.stringify(userData));
            navigate("/Viagens");
          } else {
           
            localStorage.removeItem("usuarioLogado");
            setErro("Sua conta está inativa. Entre em contato com o suporte.");
            setShowPaymentLink(false);
          }
        } catch (error) {
          console.error("Erro ao verificar status:", error);
          localStorage.removeItem("usuarioLogado");
        }
      }
    };
    
    checkStoredUserStatus();
  }, [navigate]);

  const handleOpenPaymentModal = () => {
    setShowPaymentLink(false);
    setErro("");
    onPaymentOpen();
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setErro("");
    setShowPaymentLink(false);

    try {
      
      const userCredential = await signInWithEmailAndPassword(auth, email, senha);
      const firebaseUser = userCredential.user;

      const userData = await getUserById(firebaseUser.uid);

      if (!userData) {
        setErro("Usuário não encontrado no sistema. Contate o administrador.");
        await auth.signOut();
        setIsLoading(false);
        return;
      }

      
      if (userData.status === false) {
        setInactiveUser({
          id: firebaseUser.uid,
          nome: userData.nome,
          email: userData.email,
          cpf: userData.cpf
        });
        
        setErro("Sua assinatura está vencida.");
        setShowPaymentLink(true);
        
        await auth.signOut();
        setIsLoading(false);
        return;
      }

      localStorage.setItem("usuarioLogado", JSON.stringify(userData));

      setEmail("");
      setSenha("");
      setErro("");

      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo(a), ${userData.nome}`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right"
      });

      navigate("/Viagens");

    } catch (error: any) {
      console.error("Erro no login:", error);
      
      if (error.code === "permission-denied") {
        setErro("Erro de permissão. Verifique as regras do Firestore.");
      } else {
        switch (error.code) {
          case "auth/invalid-email":
            setErro("E-mail inválido");
            break;
          case "auth/user-disabled":
            setErro("Usuário desativado no sistema");
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
      setShowPaymentLink(false);
    } finally {
      setIsLoading(false);
    }
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
        onResetClose();
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
    } finally {
      setIsResetLoading(false);
    }
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
          bg="rgba(255, 255, 255, 0.95)"
          p={8}
          borderRadius="lg"
          boxShadow="2xl"
          maxW="lg"
          w="100%"
          opacity={isLoading ? 0.5 : 1}
          pointerEvents={isLoading ? "none" : "auto"}
        >
          <Stack spacing={6} align="center" mb={4}>
            <Heading fontSize="3xl" textAlign="center" color="teal.600">
              Sistema de Gestão de Frota
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Acesse sua conta para continuar
            </Text>
          </Stack>

          <Stack spacing={4}>
            <FormControl id="email" isRequired>
              <FormLabel>E-mail</FormLabel>
              <Input
                type="email"
                placeholder="usuario@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isDisabled={isLoading}
                size="lg"
              />
            </FormControl>
           
            <FormControl id="senha" isRequired>
              <FormLabel>Senha</FormLabel>
              <InputGroup>
                <Input
                  type={showSenha ? "text" : "password"}
                  placeholder="********"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  isDisabled={isLoading}
                  size="lg"
                />
                <InputRightElement width="3rem" height="full">
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
              <Box textAlign="center">
                <Text color="red.500" fontSize="sm" fontWeight="medium" mb={showPaymentLink ? 2 : 0}>
                  {erro}
                </Text>
                {showPaymentLink && (
                  <Button
                    variant="link"
                    color="teal.500"
                    onClick={handleOpenPaymentModal}
                    fontWeight="bold"
                    fontSize="sm"
                  >
                    Clique aqui para renovar sua assinatura
                  </Button>
                )}
              </Box>
            )}

            <Stack spacing={6} pt={4}>
              <Button
                bg="teal.500"
                color="white"
                _hover={{ bg: "teal.600" }}
                _active={{ bg: "teal.700" }}
                onClick={handleLogin}
                width="100%"
                isLoading={isLoading}
                loadingText="Entrando"
                size="lg"
              >
                Entrar
              </Button>

              <Button
                variant="link"
                color="teal.500"
                _hover={{ textDecoration: "none", color: "teal.600" }}
                onClick={onResetOpen}
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
      <Modal isOpen={isResetOpen} onClose={onResetClose} isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
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
            <Button variant="outline" mr={3} onClick={onResetClose} isDisabled={isResetLoading}>
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

     <ModalPagamento
        isOpen={isPaymentOpen}
        onClose={onPaymentClose}
        usuario={inactiveUser}
      />
    </>
  );
};

export default LoginPage;