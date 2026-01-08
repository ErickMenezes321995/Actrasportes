import React, { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
  Textarea,
  GridItem,
  Grid
} from "@chakra-ui/react";

interface Caminhao {
  id: string;
  placa: string;
  modelo: string;
}

interface Pneu {
  id: string;
  caminhaoId: string;
  codigoPneu: string;
  dataTroca: string;
  posicao: string;
  marca: string;
  observacao: string;
  valor: number;        
  tipo: string;        
  createdAt?: string;  
  updatedAt?: string;   
}

interface NovoPneuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (pneu: Pneu) => void;
  caminhoes: Caminhao[];
}

const formDataInicial: Omit<Pneu, "id"> = {
  caminhaoId: "",
  codigoPneu: "",
  dataTroca: "",
  posicao: "",
  marca: "",
  observacao: "",
  valor: 0,
  tipo: "Troca",
};

const NovoPneuModal: React.FC<NovoPneuModalProps> = ({
  isOpen,
  onClose,
  onSalvar,
  caminhoes,
}) => {
  const toast = useToast();
  const [formData, setFormData] = useState<Omit<Pneu, "id">>(formDataInicial);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(formDataInicial);
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
        
    if (name === "valor") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {

    if (formData.caminhaoId === "") {
      toast({
        title: "Erro",
        description: "Selecione um caminhão.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (!formData.codigoPneu || !formData.dataTroca || !formData.posicao || 
        !formData.marca || formData.valor <= 0 || !formData.tipo) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSaving(true);
    try {
      
      const response = await fetch("https://gestaofrota.onrender.com/api/trocaPneus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Erro do servidor:", errorText);
        throw new Error(`Erro ao criar pneu: ${errorText}`);
      }

      const novoPneu: Pneu = await response.json();

      toast({
        title: "Pneu registrado com sucesso",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onSalvar(novoPneu);
      onClose();
    } catch (error) {
      console.error("❌ Erro ao cadastrar pneu:", error);
      toast({
        title: "Erro ao cadastrar pneu",
        description: String(error),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent borderRadius="4px" border="1px solid #a3bde3" boxShadow="0 2px 8px rgba(0,0,0,0.15)">
        <ModalHeader 
         bg="#dfeaf5" 
          borderBottom="1px solid #a3bde3" 
          py={2} 
          px={3}
          fontSize="15px"
          fontWeight="600"
          color="#15457b"
          fontFamily="Arial, sans-serif"
        >Nova Troca de Pneu</ModalHeader>
        <ModalCloseButton 
        color="#666666"
          _hover={{ color: "#15457b", bg: "#c5d5e6" }}
          borderRadius="3px"
          size="sm"
          mt={1}
          mr={1}
        />
        <ModalBody pb={4} px={4} pt={4} maxH="70vh" overflowY="auto">
          <Grid templateColumns="repeat(2, 1fr)" gap={2}>
          <GridItem colSpan={2}>
            <FormControl isRequired mb={2}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Caminhão</FormLabel>
                  <Select
                      name="caminhaoId"
                      value={formData.caminhaoId}
                      onChange={handleChange}
                      placeholder="Selecione um caminhão"                
                      fontSize="13px"
                      border="1px solid #d0d0d0"
                      borderRadius="3px"
                      height="32px"
                      _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                    >
                      {caminhoes.map((caminhao) => (
                        <option key={caminhao.id} value={caminhao.id}>
                          {caminhao.placa} - {caminhao.modelo}
                        </option>
                      ))}
                  </Select>
              </FormControl>
          </GridItem>
          

          <FormControl isRequired>
            <FormLabel  fontSize="12px" fontWeight="600" color="#666666" mb={1}>Código do Pneu</FormLabel>
            <Input
              name="codigoPneu"
              value={formData.codigoPneu}
              onChange={handleChange}
              placeholder="Ex: MIC-235-001"
              fontSize="13px"
              border="1px solid #d0d0d0"
              borderRadius="3px"
              height="32px"
              _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel  fontSize="12px" fontWeight="600" color="#666666" mb={1}>Data da Troca</FormLabel>
            <Input
              name="dataTroca"
              type="date"
              value={formData.dataTroca}
              onChange={handleChange}
               fontSize="13px"
              border="1px solid #d0d0d0"
              borderRadius="3px"
              height="32px"
              _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel  fontSize="12px" fontWeight="600" color="#666666" mb={1}>Posição</FormLabel>
            <Select
              name="posicao"
              value={formData.posicao}
              onChange={handleChange}
              placeholder="Selecione a posição"
               fontSize="13px"
              border="1px solid #d0d0d0"
              borderRadius="3px"
              height="32px"
              _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
            >
              <option value="Dianteira Esquerda">Dianteira Esquerda</option>
              <option value="Dianteira Direita">Dianteira Direita</option>
              <option value="Traseira Externa Esquerda">Traseira Externa Esquerda</option>
              <option value="Traseira Interna Esquerda">Traseira Interna Esquerda</option>
              <option value="Traseira Externa Direita">Traseira Externa Direita</option>
              <option value="Traseira Interna Direita">Traseira Interna Direita</option>
              <option value="Step">Step</option>
              <option value="Reserva">Reserva</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel  fontSize="12px" fontWeight="600" color="#666666" mb={1}>Marca</FormLabel>
            <Input
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              placeholder="Ex: Michelin, Pirelli, etc."
               fontSize="13px"
              border="1px solid #d0d0d0"
              borderRadius="3px"
              height="32px"
              _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel  fontSize="12px" fontWeight="600" color="#666666" mb={1}>Valor (R$)</FormLabel>
           <Input
              name="valor"
              type="text"
              value={formData.valor ? 
                `R$ ${formData.valor.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.')}` 
                : ''
              }
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, '');
                value = value.padStart(3, '0');
                
                const integerPart = value.slice(0, -2);
                const decimalPart = value.slice(-2);
                const formattedValue = `R$ ${integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimalPart}`;
                
                const numericValue = value ? parseInt(value, 10) / 100 : 0;
                
                setFormData(prev => ({
                  ...prev,
                  valor: numericValue
                }));
                
                e.target.value = formattedValue === 'R$ 0,00' ? '' : formattedValue;
              }}
              placeholder="R$ 0,00"
              fontSize="13px"
              border="1px solid #d0d0d0"
              borderRadius="3px"
              height="32px"
              _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel  fontSize="12px" fontWeight="600" color="#666666" mb={1}>Tipo</FormLabel>
            <Select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
               fontSize="13px"
              border="1px solid #d0d0d0"
              borderRadius="3px"
              height="32px"
              _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
            >
              <option value="Troca">Troca</option>
              <option value="Reparo">Reparo</option>
              <option value="Preventiva">Manutenção Preventiva</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel  fontSize="12px" fontWeight="600" color="#666666" mb={1}>Observações</FormLabel>
            <Textarea
              name="observacao"
              value={formData.observacao}
              onChange={handleChange}
              placeholder="Observações adicionais..."
              rows={3}
               fontSize="13px"
              border="1px solid #d0d0d0"
              borderRadius="3px"
              _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
            />
          </FormControl>
          </Grid>
        </ModalBody>

        <ModalFooter
         bg="#f5f5f5" 
          borderTop="1px solid #e0e0e0" 
          py={3} 
          px={4}
          borderRadius="0 0 4px 4px"
        >
          <Button 
           bg="#f0f0f0"
            color="#666666"
            border="1px solid #d0d0d0"
            borderRadius="3px"
            fontWeight="normal"
            _hover={{ bg: "#e5e5e5" }}
            fontSize="13px"
            height="28px"
            px={4}
            mr={2}
          onClick={onClose} 
          isDisabled={isSaving}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            isLoading={isSaving}
            loadingText="Salvando..."

              bg="#e6f4e6"
            color="#2a6b2a"
            border="1px solid #9ecf9e"
            borderRadius="3px"
            fontWeight="normal"
            _hover={{ bg: "#d5e8d5" }}
            fontSize="13px"
            height="28px"
            px={4}
            _disabled={{
              bg: "#f0f0f0",
              color: "#999999",
              borderColor: "#d0d0d0",
              cursor: "not-allowed"
            }}
          >
            Salvar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NovoPneuModal;