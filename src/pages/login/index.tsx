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
  Link,
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

import { getApiErrorMessage } from "../../services/apiErrors";
import { authenticate } from "../../services/authService";
import { useAuth } from "../../auth/AuthContext";
import { setStoredUser } from "../../auth/userStorage";

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
  const [resetSuccess] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading] = useState(false);
  const [showPaymentLink, setShowPaymentLink] = useState(false);
  const [inactiveUser] = useState<{ id: string; nome: string; email: string; cpf?: string } | null>(null);
  
  const { isOpen: isResetOpen, onOpen: onResetOpen, onClose: onResetClose } = useDisclosure();
  const { isOpen: isPaymentOpen, onOpen: onPaymentOpen, onClose: onPaymentClose } = useDisclosure();
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/Viagens");
    }
  }, [isAuthenticated, navigate]);

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
      const token = await authenticate(email, senha);
      login(token);

      const usuarioLogado = {
        id: email,
        nome: email.split("@")[0],
        email,
      };
      setStoredUser(usuarioLogado);
      setEmail("");
      setSenha("");
      setErro("");

      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo(a), " + usuarioLogado.nome,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      sessionStorage.setItem("strixAnnouncementAfterLogin", "true");
      navigate("/Viagens");
    } catch (error) {
      setErro(getApiErrorMessage(error, error instanceof Error ? error.message : "Erro ao fazer login. Tente novamente."));
      setShowPaymentLink(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => { setResetError("A recuperação de senha ainda não está disponível."); };

  const toggleShowSenha = () => setShowSenha(!showSenha);

  return (
    <>
      {isLoading && <FullScreenLoading />}
      <Flex minH="100vh" bg="#F4F7FA" opacity={isLoading ? 0.5 : 1}
        pointerEvents={isLoading ? "none" : "auto"}>
        <Box display={{ base: "none", lg: "flex" }} position="relative" overflow="hidden"
          flex="1.08" minH="100vh" alignItems="stretch" justifyContent="space-between" flexDirection="column" p={{ lg: 10, xl: 16 }} color="white"
          bgImage="linear-gradient(135deg, rgba(7, 25, 34, .93) 0%, rgba(8, 42, 51, .78) 55%, rgba(8, 35, 48, .55) 100%), url('https://mlqt0se4pk9p.i.optimole.com/q:85/https://www.autodata.com.br/wordpress/wp-content/uploads//2023/05/0d6bffd3a0eecc6d6ef08e787b9c470c-1-scaled.jpeg')"
          bgPosition="center" bgSize="cover">
          <Box position="absolute" top="-130px" right="-130px" boxSize="420px" borderRadius="full"
            border="1px solid rgba(115, 226, 214, .16)" />
          <Box position="absolute" top="-75px" right="-75px" boxSize="310px" borderRadius="full"
            border="1px solid rgba(115, 226, 214, .12)" />
          <Flex align="center" gap={3} position="relative">
            <Flex align="center" justify="center" boxSize="48px" borderRadius="14px" bg="#38BDB0" color="#092C32" fontSize="2xl" fontWeight="800" boxShadow="0 8px 28px rgba(56,189,176,.24)">S</Flex>
            <Box>
              <Text color="white" fontSize="md" fontWeight="800" letterSpacing="1.8px">STRIX</Text>
              <Text color="whiteAlpha.700" fontSize="10px" letterSpacing="3px">SOLUTIONS</Text>
            </Box>
          </Flex>
          <Box position="relative" maxW="620px">
            <Text color="#76D8CD" fontSize="xs" fontWeight="700" letterSpacing="3px" mb={4}>GEST&#195;O INTELIGENTE DE FROTA</Text>
            <Heading fontSize={{ lg: "4xl", xl: "5xl" }} lineHeight="1.12" letterSpacing="-1.4px" fontWeight="700">
              Sua opera&#231;&#227;o em movimento, com clareza e controle.
            </Heading>
            <Text mt={5} maxW="500px" color="whiteAlpha.800" fontSize="md" lineHeight="1.8">
              Acompanhe viagens, equipes e resultados em um s&#243; lugar. Entre para acessar o painel da sua frota.
            </Text>
            <Flex align="center" gap={3} mt={12} color="whiteAlpha.700" fontSize="xs">
              <Box w="28px" h="1px" bg="#76D8CD" />
              <Text>Plataforma de gest&#227;o desenvolvida pela Strix Solutions</Text>
            </Flex>
          </Box>
        </Box>

        <Flex flex=".92" minH="100vh" align="center" justify="center" px={{ base: 5, sm: 8, xl: 14 }} py={10} bg="white">
          <Box w="full" maxW="430px" opacity={isLoading ? 0.5 : 1}>
            <Flex display={{ base: "flex", lg: "none" }} align="center" justify="center" gap={3} mb={10}>
              <Flex align="center" justify="center" boxSize="44px" borderRadius="13px" bg="#176D68" color="white" fontSize="2xl" fontWeight="800">S</Flex>
              <Box textAlign="left">
                <Text color="#172B3D" fontSize="sm" fontWeight="800" letterSpacing="1.5px">STRIX</Text>
                <Text color="#718198" fontSize="10px" letterSpacing="2.5px">SOLUTIONS</Text>
              </Box>
            </Flex>
            <Flex align="center" justify="space-between" gap={3} mb={5}>
              <Text color="#438C86" fontSize="xs" fontWeight="700" letterSpacing="1.5px">PLATAFORMA STRIX SOLUTIONS</Text>
              <Flex align="center" gap={2} px={3} py={1.5} borderRadius="full" bg="#F2F7F7" border="1px solid #E2EEEE">
                <Box boxSize="6px" borderRadius="full" bg="#438C86" />
                <Text color="#52716F" fontSize="10px" fontWeight="700" whiteSpace="nowrap">AC Transportes</Text>
              </Flex>
            </Flex>
            <Heading fontSize={{ base: "2xl", md: "3xl" }} color="#172B3D" letterSpacing="-.8px" fontWeight="700">
              Bem-vindo de volta
            </Heading>
            <Text mt={2} mb={8} color="#7A8999" fontSize="sm">Entre na plataforma para continuar</Text>

            <Stack spacing={5}>
              <FormControl id="email" isRequired>
                <FormLabel color="#34475B" fontSize="sm" fontWeight="600" mb={2}>E-mail</FormLabel>
                <Input type="email" placeholder="usuario@empresa.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} isDisabled={isLoading} size="lg"
                  borderRadius="12px" borderColor="#DCE4EC" bg="#FBFCFD" fontSize="sm"
                  _hover={{ borderColor: "#B8C7D6" }} _focusVisible={{ borderColor: "#438C86", boxShadow: "0 0 0 1px #438C86", bg: "white" }} />
              </FormControl>

              <FormControl id="senha" isRequired>
                <FormLabel color="#34475B" fontSize="sm" fontWeight="600" mb={2}>Senha</FormLabel>
                <InputGroup>
                  <Input type={showSenha ? "text" : "password"} placeholder="Sua senha" value={senha}
                    onChange={(e) => setSenha(e.target.value)} isDisabled={isLoading} size="lg"
                    borderRadius="12px" borderColor="#DCE4EC" bg="#FBFCFD" fontSize="sm"
                    _hover={{ borderColor: "#B8C7D6" }} _focusVisible={{ borderColor: "#438C86", boxShadow: "0 0 0 1px #438C86", bg: "white" }} />
                  <InputRightElement width="3.25rem" height="full">
                    <Button h="2rem" w="2rem" size="sm" onClick={toggleShowSenha} variant="ghost" isDisabled={isLoading}
                      aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"} color="#718198" borderRadius="8px">
                      {showSenha ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              {erro && (
                <Box p={4} bg={showPaymentLink ? "#FFF9F1" : "#FFF5F3"}
                  border="1px solid" borderColor={showPaymentLink ? "#F2E2C9" : "#F5D8D3"} borderRadius="14px">
                  {showPaymentLink ? (
                    <>
                      <Flex align="center" gap={3}>
                        <Flex align="center" justify="center" boxSize="38px" flexShrink={0} borderRadius="12px" bg="#F8EBD6" color="#9A6722" fontWeight="800">!</Flex>
                        <Box>
                          <Text color="#634B2B" fontSize="sm" fontWeight="700">Assinatura vencida</Text>
                          <Text color="#8B765A" fontSize="xs" mt={1}>Renove seu plano para continuar usando a plataforma.</Text>
                        </Box>
                      </Flex>
                      <Button mt={4} w="full" bg="#176D68" color="white" borderRadius="10px"
                        _hover={{ bg: "#125B57" }} onClick={handleOpenPaymentModal} fontWeight="700" size="sm">
                        Ver planos e renovar
                      </Button>
                    </>
                  ) : <Text color="#B5473C" fontSize="sm" fontWeight="500" textAlign="center">{erro}</Text>}
                </Box>
              )}

              <Stack spacing={4} pt={2}>
                <Button bg="#176D68" color="white" _hover={{ bg: "#125B57", transform: "translateY(-1px)", boxShadow: "0 10px 22px rgba(23,109,104,.2)" }}
                  _active={{ bg: "#104F4B", transform: "translateY(0)" }} onClick={handleLogin} w="full" isLoading={isLoading}
                  loadingText="Entrando" size="lg" borderRadius="12px" fontWeight="700" boxShadow="0 7px 16px rgba(23,109,104,.16)" transition="all .18s">
                  Entrar na plataforma
                </Button>
                <Button variant="ghost" color="#438C86" _hover={{ bg: "#F0F7F6", color: "#176D68" }}
                  onClick={onResetOpen} isDisabled={isLoading} fontSize="sm" fontWeight="600">
                  Esqueci minha senha
                </Button>
                <Text color="#718198" fontSize="sm" textAlign="center">
                  Ainda não tem cadastro?{" "}
                  <Button variant="link" color="#287A73" fontWeight="700" fontSize="sm"
                    onClick={() => navigate("/cadastro-usuario")} isDisabled={isLoading}>
                    Cadastre-se
                  </Button>
                </Text>
              </Stack>
            </Stack>

            <Box mt={7} p={4} bg="#F5F8FA" border="1px solid #E6EDF2" borderRadius="14px">
              <Flex align={{ base: "flex-start", sm: "center" }} justify="space-between" gap={3} direction={{ base: "column", sm: "row" }}>
                <Box>
                  <Text color="#34475B" fontSize="sm" fontWeight="700">Para mais informa&ccedil;&otilde;es</Text>
                  <Text color="#7A8999" fontSize="xs" mt={1}>
                    Fale com a equipe Strix Solutions: {" "}
                    <Link href="tel:+5592993847070" color="#287A73" fontWeight="700" whiteSpace="nowrap">(92) 99384-7070</Link>
                  </Text>
                </Box>
                <Button as="a" href="https://wa.me/5592993847070" target="_blank" rel="noopener noreferrer"
                  size="sm" bg="#E6F3F1" color="#287A73" borderRadius="9px" flexShrink={0}
                  _hover={{ bg: "#D9ECE9" }}>
                  WhatsApp
                </Button>
              </Flex>
            </Box>

            <Flex align="center" gap={3} mt={10} color="#9AA6B4" fontSize="xs">
              <Box flex="1" h="1px" bg="#E9EEF2" />
              <Text whiteSpace="nowrap">ACESSO SEGURO</Text>
              <Box flex="1" h="1px" bg="#E9EEF2" />
            </Flex>
            <Text fontSize="xs" color="#9AA6B4" textAlign="center" mt={6}>
              &#169; {new Date().getFullYear()} Strix Solutions
            </Text>
          </Box>
        </Flex>
      </Flex>

      <Modal isOpen={isResetOpen} onClose={onResetClose} isCentered size="sm">
        <ModalOverlay bg="rgba(12, 28, 41, .48)" backdropFilter="blur(4px)" />
        <ModalContent maxW="440px" mx={4} borderRadius="22px" overflow="hidden"
          boxShadow="0 24px 72px rgba(16, 38, 58, .22)">
          <ModalHeader px={6} pt={6} pb={4}>
            <Flex align="center" gap={3}>
              <Flex align="center" justify="center" boxSize="46px" borderRadius="14px"
                bg="#EAF5F4" color="#287A73" fontSize="xl" fontWeight="700">@</Flex>
              <Box>
                <Text color="#1C344B" fontSize="lg" fontWeight="700">Recuperar senha</Text>
                <Text mt={1} color="#7C8B9B" fontSize="xs" fontWeight="400">Acesso seguro pela Strix Solutions</Text>
              </Box>
            </Flex>
          </ModalHeader>
          <ModalCloseButton top={5} right={5} borderRadius="full" />
          <ModalBody px={6} pt={2} pb={5}>
            <Text mb={5} color="#718198" fontSize="sm" lineHeight="1.7">
              Informe o e-mail da sua conta. Enviaremos um link para criar uma nova senha.
            </Text>
            <FormControl isRequired>
              <FormLabel color="#34475B" fontSize="sm" fontWeight="600" mb={2}>E-mail cadastrado</FormLabel>
              <Input type="email" placeholder="voce@empresa.com" value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)} isDisabled={isResetLoading}
                size="lg" borderRadius="12px" borderColor="#DCE4EC" bg="#FBFCFD" fontSize="sm"
                _hover={{ borderColor: "#B8C7D6" }}
                _focusVisible={{ borderColor: "#438C86", boxShadow: "0 0 0 1px #438C86", bg: "white" }} />
            </FormControl>

            {resetError && (
              <Box role="alert" mt={4} px={3.5} py={3} borderRadius="12px" bg="#FFF5F3" border="1px solid #F5D8D3">
                <Text color="#B5473C" fontSize="sm">{resetError}</Text>
              </Box>
            )}
            {resetSuccess && (
              <Box role="status" mt={4} px={3.5} py={3} borderRadius="12px" bg="#F0F8F3" border="1px solid #D8EBDD">
                <Text color="#34734C" fontSize="sm">{resetSuccess}</Text>
              </Box>
            )}
          </ModalBody>
          <ModalFooter px={6} pt={0} pb={6} gap={3} flexDirection={{ base: "column-reverse", sm: "row" }}>
            <Button variant="ghost" color="#63758A" borderRadius="11px" onClick={onResetClose}
              isDisabled={isResetLoading} w={{ base: "full", sm: "auto" }} _hover={{ bg: "#F3F6F8" }}>
              Cancelar
            </Button>
            <Button bg="#176D68" color="white" borderRadius="11px" onClick={handlePasswordReset}
              isLoading={isResetLoading} loadingText="Enviando" w={{ base: "full", sm: "auto" }} flex={{ sm: 1 }}
              _hover={{ bg: "#125B57" }} fontWeight="700">
              Enviar link de recupera&ccedil;&atilde;o
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
