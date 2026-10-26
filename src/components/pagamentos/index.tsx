import { apiFetch } from "../../services/api";

import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Divider,
  Text,
  VStack,
  Box,
  Link,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  HStack,
  Badge,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';
import { ExternalLinkIcon, CopyIcon, CheckCircleIcon } from '@chakra-ui/icons';
import QRCode from 'react-qr-code';

interface Plano {
  id: string;
  nome: string;
  valor: number;
  descricao: string;
  periodo: string;
}

interface ModalPagamentoProps {
  isOpen: boolean;
  onClose: () => void;
  usuario: {
    id: string;
    nome: string;
    email: string;
    cpf?: string;
  } | null;
}

export const ModalPagamento: React.FC<ModalPagamentoProps> = ({
  isOpen,
  onClose,
  usuario
}) => {
  const [selectedPlan, setSelectedPlan] = useState<Plano | null>(null);
  const [step, setStep] = useState<'plans' | 'payment'>('plans');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'checkout'>('pix');
  const [pixCode, setPixCode] = useState('');
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const toast = useToast();

  // Planos disponíveis
  const planos: Plano[] = [
    {
      id: "basico",
      nome: "Plano Básico",
      valor: 80.90,
      descricao: "Ideal para pequenos negócios",
      periodo: "mês"
    },
    // {
    //   id: "profissional",
    //   nome: "Plano Profissional",
    //   valor: 99.90,
    //   descricao: "Para empresas em crescimento",
    //   periodo: "mês"
    // },
    // {
    //   id: "enterprise",
    //   nome: "Plano Enterprise",
    //   valor: 299.90,
    //   descricao: "Solução completa para grandes empresas",
    //   periodo: "mês"
    // }
  ];

  const formatarPreco = (valor: number) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Função para gerar Pix via backend
  const gerarPix = async (plano: Plano) => {
    setLoading(true);
    try {
      const response = await apiFetch('/api/pagamentos/criar-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor: plano.valor,
          descricao: plano.nome,
          email: usuario?.email || 'cliente@email.com',
          nome: usuario?.nome || 'Cliente'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setQrCodeValue(data.data.qrCode);
        setPixCode(data.data.qrCode);
        setPaymentId(data.data.paymentId.toString());
        setPaymentStatus(data.data.status);
        
        toast({
          title: "QR Code gerado!",
          description: `Plano ${plano.nome} - ${formatarPreco(plano.valor)}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        setStep('payment');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Erro ao gerar Pix:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o QR Code",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para criar Checkout Pro
  const criarCheckout = async (plano: Plano) => {
    setProcessingPayment(true);
    try {
      const response = await apiFetch('/api/pagamentos/criar-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor: plano.valor,
          descricao: plano.nome,
          email: usuario?.email,
          nome: usuario?.nome
        }),
      });

      const data = await response.json();
      
      if (data.success && data.url) {
        // Redirecionar para o checkout do Mercado Pago
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Erro ao criar checkout');
      }
    } catch (error) {
      console.error('Erro no checkout:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o checkout. Tente novamente.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  // Processar pagamento baseado no método escolhido
  const processarPagamento = async () => {
    if (!selectedPlan) return;
    
    if (paymentMethod === 'pix') {
      await gerarPix(selectedPlan);
    } else {
      await criarCheckout(selectedPlan);
    }
  };

  // Consultar status do pagamento (apenas para PIX)
  const consultarStatus = async () => {
    if (!paymentId) return;
    
    try {
      const response = await apiFetch(`/api/pagamentos/status/${paymentId}`, { });
      const data = await response.json();
      
      if (data.success) {
        setPaymentStatus(data.data.status);
        
        if (data.data.status === 'approved') {
          toast({
            title: "Pagamento confirmado!",
            description: "Seu plano foi ativado com sucesso",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          setTimeout(() => {
            onClose();
            setStep('plans');
            setSelectedPlan(null);
          }, 3000);
        }
      }
    } catch (error) {
      console.error('Erro ao consultar status:', error);
    }
  };

  // Polling para verificar status do PIX
  useEffect(() => {
    if (isOpen && step === 'payment' && paymentId && paymentStatus === 'pending') {
      const interval = setInterval(consultarStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen, step, paymentId, paymentStatus]);

  // Resetar estado ao fechar modal
  const handleClose = () => {
    setStep('plans');
    setSelectedPlan(null);
    setPixCode('');
    setQrCodeValue('');
    setPaymentId(null);
    setPaymentStatus('pending');
    setPaymentMethod('pix');
    setCheckoutUrl('');
    onClose();
  };

  const handleCopiarPix = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast({
        title: "Código copiado!",
        description: "O código Pix foi copiado para sua área de transferência",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
      <ModalOverlay bg="rgba(12, 28, 41, .48)" backdropFilter="blur(4px)" />
      <ModalContent maxW={step === 'plans' ? "540px" : "500px"} borderRadius="22px" overflow="hidden"
        boxShadow="0 24px 72px rgba(16, 38, 58, .22)" mx={4}>
        <ModalHeader px={7} pt={7} pb={4} borderBottom="1px solid #EDF1F5">
          {step === 'plans' ? (
            <>
              <Badge colorScheme="teal" borderRadius="full" px={3} py={1} fontSize="10px" letterSpacing="1px">STRIX SOLUTIONS</Badge>
              <Text mt={3} color="#1C344B" fontSize="2xl" fontWeight="700" letterSpacing="-.5px">Escolha seu plano</Text>
              <Text mt={1} color="#7C8B9B" fontSize="sm" fontWeight="400">Reative seu acesso e continue usando a plataforma.</Text>
            </>
          ) : `Pagamento - ${selectedPlan?.nome}`}
        </ModalHeader>
        <ModalCloseButton top={5} right={5} borderRadius="full" />
        <ModalBody px={7} py={5}>
          {step === 'plans' ? (
            <VStack spacing={4}>
              <Box w="full" px={4} py={3} borderRadius="13px" bg="#F3F8F7" border="1px solid #E1EFED">
                <Text color="#386D68" fontSize="sm" fontWeight="600">Sua assinatura venceu</Text>
                <Text color="#718985" fontSize="xs" mt={1}>Escolha um plano para renovar o acesso da sua empresa.</Text>
              </Box>
              {planos.map((plano) => (
                <Box key={plano.id} w="full" p={5} bg="white" border="1px solid #DCE8E7"
                  borderRadius="17px" cursor="pointer" role="button" tabIndex={0}
                  aria-label={`Selecionar ${plano.nome} por ${formatarPreco(plano.valor)} por ${plano.periodo}`}
                  transition="all .2s ease" boxShadow="0 8px 24px rgba(23, 63, 60, .06)"
                  _hover={{ borderColor: "#69A9A2", transform: "translateY(-2px)", boxShadow: "0 14px 32px rgba(23, 63, 60, .12)" }}
                  _focusVisible={{ outline: "2px solid #438C86", outlineOffset: "2px" }}
                  onKeyDown={(evento) => {
                    if (evento.key === "Enter" || evento.key === " ") {
                      evento.preventDefault();
                      setSelectedPlan(plano);
                      setPaymentMethod('pix');
                      setStep('payment');
                    }
                  }}
                  onClick={() => {
                    setSelectedPlan(plano);
                    setPaymentMethod('pix');
                    setStep('payment');
                  }}
                >
                  <HStack justify="space-between" align="start" spacing={4}>
                    <Box>
                      <Badge colorScheme="teal" variant="subtle" borderRadius="full" px={2.5} py={1} mb={3}>PLANO DISPON&Iacute;VEL</Badge>
                      <Text color="#203A50" fontWeight="700" fontSize="lg">{plano.nome}</Text>
                      <Text mt={1} fontSize="sm" color="#7C8B9B">{plano.descricao}</Text>
                    </Box>
                    <Box textAlign="right" flexShrink={0}>
                      <Text color="#176D68" fontWeight="800" fontSize="xl">{formatarPreco(plano.valor)}</Text>
                      <Text mt={1} fontSize="xs" color="#8593A1">/{plano.periodo}</Text>
                    </Box>
                  </HStack>
                  <HStack justify="space-between" mt={5} pt={4} borderTop="1px solid #EDF2F1" color="#287A73">
                    <Text fontSize="sm" fontWeight="700">Selecionar este plano</Text>
                    <Text fontSize="lg" aria-hidden="true">&rarr;</Text>
                  </HStack>
                </Box>
              ))}
            </VStack>
          ) : (
            <VStack spacing={4}>
              {/* Abas de métodos de pagamento */}
              <Tabs isFitted variant="enclosed" onChange={(index) => {
                const methods = ['pix', 'checkout'];
                setPaymentMethod(methods[index] as 'pix' | 'checkout');
              }}>
                <TabList mb="1em">
                  <Tab>📱 Pix</Tab>
                  <Tab>💳 Cartão de Crédito/Débito</Tab>
                </TabList>
                <TabPanels>
                  {/* Painel Pix */}
                  <TabPanel p={0}>
                    {loading ? (
                      <VStack spacing={4} py={8}>
                        <Spinner size="xl" color="green.500" />
                        <Text>Gerando QR Code...</Text>
                      </VStack>
                    ) : qrCodeValue ? (
                      <VStack spacing={4}>
                        <Alert status="info" borderRadius="8px" bg="blue.50">
                          <AlertIcon />
                          <Box>
                            <AlertTitle fontSize="sm">
                              Valor a pagar: {formatarPreco(selectedPlan?.valor || 0)}
                            </AlertTitle>
                            <AlertDescription fontSize="xs">
                              Escaneie o QR Code abaixo ou copie o código Pix
                            </AlertDescription>
                          </Box>
                        </Alert>

                        <Box p={4} bg="white" borderRadius="12px" display="flex" justifyContent="center" border="2px solid #e0e0e0">
                          <QRCode value={qrCodeValue} size={200} bgColor="#FFFFFF" fgColor="#000000" level="H" />
                        </Box>

                        <FormControl>
                          <FormLabel>Código Pix Copia e Cola</FormLabel>
                          <InputGroup size="md">
                            <Input
                              pr="4.5rem"
                              type="text"
                              value={pixCode}
                              isReadOnly
                              fontSize="10px"
                              fontFamily="monospace"
                              height="auto"
                              minH="60px"
                              padding="8px"
                            />
                            <InputRightElement width="4.5rem" height="100%">
                              <IconButton
                                h="1.75rem"
                                size="sm"
                                aria-label="Copiar código Pix"
                                icon={copied ? <CheckCircleIcon /> : <CopyIcon />}
                                onClick={handleCopiarPix}
                                colorScheme={copied ? "green" : "blue"}
                                variant="ghost"
                              />
                            </InputRightElement>
                          </InputGroup>
                        </FormControl>

                        {paymentStatus === 'approved' && (
                          <Alert status="success" borderRadius="8px">
                            <AlertIcon />
                            ✅ Pagamento confirmado! Seu plano foi ativado.
                          </Alert>
                        )}
                      </VStack>
                    ) : (
                      <VStack spacing={4}>
                        <Alert status="info" borderRadius="8px">
                          <AlertIcon />
                          Clique no botão abaixo para gerar o QR Code Pix
                        </Alert>
                        <Button
                          w="100%"
                          colorScheme="green"
                          onClick={() => gerarPix(selectedPlan!)}
                          isLoading={loading}
                          loadingText="Gerando..."
                        >
                          Gerar QR Code Pix
                        </Button>
                      </VStack>
                    )}
                  </TabPanel>

                  {/* Painel Checkout Pro */}
                  <TabPanel p={0}>
                    <VStack spacing={4}>
                      <Alert status="info" borderRadius="8px" bg="blue.50">
                        <AlertIcon />
                        <Box>
                          <AlertTitle fontSize="sm">
                            Valor: {formatarPreco(selectedPlan?.valor || 0)}
                          </AlertTitle>
                          <AlertDescription fontSize="xs">
                            Você será redirecionado para o Mercado Pago para concluir o pagamento
                          </AlertDescription>
                        </Box>
                      </Alert>

                      <Button
                        w="100%"
                        colorScheme="green"
                        size="lg"
                        onClick={() => criarCheckout(selectedPlan!)}
                        isLoading={processingPayment}
                        loadingText="Redirecionando..."
                      >
                        Pagar com Cartão
                      </Button>

                      <Text fontSize="12px" color="gray.500" textAlign="center">
                        🔒 Pagamento 100% seguro via Mercado Pago
                      </Text>
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>

              <Button variant="outline" size="sm" onClick={() => setStep('plans')}>
                Voltar para planos
              </Button>
            </VStack>
          )}
          
          <Divider my={4} />

          <Box w="100%">
            <Text fontSize="13px" fontWeight="600" mb={2}>
              Métodos de pagamento aceitos:
            </Text>
            <HStack spacing={2} justify="center" flexWrap="wrap">
              <Badge colorScheme="green">Pix</Badge>
              <Badge colorScheme="blue">Cartão de Crédito</Badge>
              <Badge colorScheme="blue">Cartão de Débito</Badge>
            </HStack>
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Fechar
          </Button>
          <Link href="https://www.mercadopago.com.br/ajuda" target="_blank">
            <Button variant="link" colorScheme="blue" rightIcon={<ExternalLinkIcon />}>
              Precisa de ajuda?
            </Button>
          </Link>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};