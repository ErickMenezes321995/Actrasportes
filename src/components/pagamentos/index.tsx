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
  } | null;
}

export const ModalPagamento: React.FC<ModalPagamentoProps> = ({
  isOpen,
  onClose,
  usuario
}) => {
  const [selectedPlan, setSelectedPlan] = useState<Plano | null>(null);
  const [step, setStep] = useState<'plans' | 'payment'>('plans');
  const [pixCode, setPixCode] = useState('');
  const [qrCodeValue, setQrCodeValue] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');
  const toast = useToast();

  // Planos disponíveis
  const planos: Plano[] = [
    {
      id: "basico",
      nome: "Plano Básico",
      valor: 1.00,
      descricao: "Ideal para pequenos negócios",
      periodo: "mês"
    },
    {
      id: "profissional",
      nome: "Plano Profissional",
      valor: 99.90,
      descricao: "Para empresas em crescimento",
      periodo: "mês"
    },
    {
      id: "enterprise",
      nome: "Plano Enterprise",
      valor: 299.90,
      descricao: "Solução completa para grandes empresas",
      periodo: "mês"
    }
  ];

  // Função para gerar Pix via backend
  const gerarPix = async (plano: Plano) => {
    setLoading(true);
    try {
      const response = await fetch('https://backend-frotas.onrender.com/api/pagamentos/criar-pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
          description: `Plano ${plano.nome} - R$ ${plano.valor.toFixed(2)}`,
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

  // Consultar status do pagamento
  const consultarStatus = async () => {
    if (!paymentId) return;
    
    try {
      const response = await fetch(`https://backend-frotas.onrender.com/api/pagamentos/status/${paymentId}`);
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

  // Polling para verificar status a cada 5 segundos
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
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {step === 'plans' ? 'Escolha seu Plano' : `Pagamento - ${selectedPlan?.nome}`}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={4}>
          {step === 'plans' ? (
            <VStack spacing={4}>
              {planos.map((plano) => (
                <Box
                  key={plano.id}
                  p={4}
                  border="2px solid"
                  borderColor="gray.200"
                  borderRadius="lg"
                  w="100%"
                  cursor="pointer"
                  transition="all 0.3s"
                  _hover={{ borderColor: "blue.500", transform: "scale(1.02)" }}
                  onClick={() => {
                    setSelectedPlan(plano);
                    gerarPix(plano);
                  }}
                >
                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="bold" fontSize="lg">{plano.nome}</Text>
                      <Text fontSize="sm" color="gray.500">{plano.descricao}</Text>
                    </Box>
                    <Box textAlign="right">
                      <Text fontWeight="bold" fontSize="xl" color="blue.500">
                        R$ {plano.valor.toFixed(2)}
                      </Text>
                      <Text fontSize="xs" color="gray.400">/{plano.periodo}</Text>
                    </Box>
                  </HStack>
                </Box>
              ))}
            </VStack>
          ) : loading ? (
            <VStack spacing={4} py={8}>
              <Spinner size="xl" color="blue.500" />
              <Text>Gerando QR Code...</Text>
            </VStack>
          ) : (
            <VStack spacing={4}>
              <Alert 
                status="info" 
                borderRadius="8px"
                bg="blue.50"
              >
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">
                    Valor a pagar: R$ {selectedPlan?.valor.toFixed(2)}
                  </AlertTitle>
                  <AlertDescription fontSize="xs">
                    Escaneie o QR Code abaixo ou copie o código Pix
                  </AlertDescription>
                </Box>
              </Alert>

              <Box 
                p={4} 
                bg="white" 
                borderRadius="12px"
                display="flex"
                justifyContent="center"
                alignItems="center"
                border="2px solid #e0e0e0"
              >
                {qrCodeValue && (
                  <QRCode 
                    value={qrCodeValue}
                    size={200}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    level="H"
                  />
                )}
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

              <Text fontSize="12px" color="gray.500" textAlign="center">
                ⏱️ Após o pagamento, a confirmação pode levar alguns minutos
              </Text>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep('plans')}
              >
                Voltar para planos
              </Button>
            </VStack>
          )}
          
          <Divider my={4} />

          <Box w="100%">
            <Text fontSize="13px" fontWeight="600" mb={2}>
              Como pagar:
            </Text>
            <VStack align="start" spacing={1} fontSize="12px" color="gray.600">
              <Text>1. Escolha o plano desejado</Text>
              <Text>2. Escaneie o QR Code com o app do seu banco</Text>
              <Text>3. Confirme o pagamento no app</Text>
              <Text>4. Aguarde a confirmação automática</Text>
            </VStack>
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