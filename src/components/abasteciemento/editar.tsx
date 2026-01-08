import React, { useEffect, useState } from "react";
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Grid,
  GridItem,
} from "@chakra-ui/react";

interface Caminhao {
  id: string;
  placa: string;
  modelo: string;
}

interface Abastecimento {
  id: string;
  caminhaoId: string;
  data: string;
  litros: number;
  valorLitro: number;
  valorTotal: number;
  posto: string;
  odometro: number;
  tipoCombustivel: string;
  observacoes?: string;
}

interface EditarAbastecimentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  abastecimento: Abastecimento;
  onSalvar: (atualizado: Abastecimento) => void;
  caminhoes: Caminhao[];
}

const EditarAbastecimentoModal: React.FC<EditarAbastecimentoModalProps> = ({
  isOpen,
  onClose,
  abastecimento,
  onSalvar,
  caminhoes,
}) => {
  const toast = useToast();
  const [formData, setFormData] = useState<Abastecimento>(abastecimento);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(abastecimento);
  }, [abastecimento]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "caminhaoId" ? value : value,
    }));
  };

  const handleNumberChange = (name: string, value: string | number) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: numValue,
      };

     
      if (name === 'litros' || name === 'valorLitro') {
        const litros = name === 'litros' ? numValue : prev.litros;
        const valorLitro = name === 'valorLitro' ? numValue : prev.valorLitro;
        newData.valorTotal = litros * valorLitro;
      }

      return newData;
    });
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

    if (!formData.data) {
      toast({
        title: "Erro",
        description: "Informe a data do abastecimento.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (formData.litros <= 0) {
      toast({
        title: "Erro",
        description: "Informe a quantidade de litros.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (formData.valorLitro <= 0) {
      toast({
        title: "Erro",
        description: "Informe o valor por litro.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.posto.trim()) {
      toast({
        title: "Erro",
        description: "Informe o posto de abastecimento.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (formData.odometro <= 0) {
      toast({
        title: "Erro",
        description: "Informe a quilometragem do odômetro.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.tipoCombustivel.trim()) {
      toast({
        title: "Erro",
        description: "Informe o tipo de combustível.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `https://gestaofrota.onrender.com/api/abastecimentos/${formData.id}`,
        {
          method: "PUT",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      const atualizado: Abastecimento = await response.json();
      
      onSalvar(atualizado);
      toast({
        title: "Abastecimento atualizado com sucesso!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error: any) {
      console.error("Erro ao atualizar abastecimento:", error);
      toast({
        title: "Erro ao atualizar abastecimento",
        description: error.message || "Erro desconhecido",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const tiposCombustivel = [
    "Diesel S10",
    "Diesel S500",
    "Gasolina Comum",
    "Gasolina Aditivada",
    "Etanol",
    "GNV",
    "Outro"
  ];

  const getCaminhaoLabel = (caminhaoId: string) => {
    const caminhao = caminhoes.find((c) => c.id === caminhaoId);
    return caminhao ? `${caminhao.placa} - ${caminhao.modelo}` : "Desconhecido";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent
      borderRadius="4px"
      border="1px solid #a3bde3"
      boxShadow="0 2px 8px rgba(0,0,0, 0.15)"
      >
        <ModalHeader
        bg="#dfeaf5" 
          borderBottom="1px solid #a3bde3" 
          py={2} 
          px={3}
          fontSize="15px"
          fontWeight="600"
          color="#15457b"
          fontFamily="Arial, sans-serif"
        >Editar Abastecimento</ModalHeader>
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
              <FormLabel fontSize="12px" fontWeight="bold" color="#666666">Caminhão</FormLabel>
              <Select
                name="caminhaoId"
                value={formData.caminhaoId}
                onChange={handleChange}
                fontSize="13px"
                border="1px solid #d0d0d0"
                borderRadius="3px"
                height="32px"
                _focus={{borderColor:"#a3bde3", boxShadow:"0 0 0 1px #a3bde3"}}
              >
                {caminhoes.map((caminhao) => (
                  <option key={caminhao.id} value={caminhao.id}>
                    {caminhao.placa} - {caminhao.modelo}
                  </option>
                ))}
              </Select>
            </FormControl>
          </GridItem>

          <GridItem colSpan={1}>
            <FormControl isRequired mb={2}>
              <FormLabel 
              fontSize="12px"
              fontWeight="bold"
              color="#666666"
              >Data do Abastecimento</FormLabel>
              <Input
                name="data"
                type="date"
                value={formData.data}
                onChange={handleChange}
                fontSize="13px"
                border="1px solid #d0d0d0"
                borderRadius="3px"
                height="32px"
                _focus={{borderColor:"#abde3", boxShadow:"0 0 0 1px #a3bde3"}}
              />
            </FormControl>
          </GridItem>
          

          <GridItem colSpan={1}>
            <FormControl isRequired mb={2}>
              <FormLabel
              fontSize="12px"
              fontWeight="bold"
              color="#666666"
              >Litros Abastecidos</FormLabel>
              <NumberInput
                value={formData.litros}
                min={0}
                step={1}
                precision={2}
                onChange={(value) => handleNumberChange("litros", value)}
              >
                <NumberInputField
                 height="40px"
                  fontSize="14px"
                  borderRadius="6px"
                  borderColor="gray.300"
                  _hover={{ borderColor: "gray.400" }}
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
                  }}
                  px="12px"
                />
                <NumberInputStepper>
                  <NumberIncrementStepper
                   border="none"
                    color="gray.500"
                    _hover={{ color: "blue.500" }}
                  />
                  <NumberDecrementStepper 
                    border="none"
                    color="gray.500"
                    _hover={{ color: "blue.500" }}
                  />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </GridItem>

          <GridItem colSpan={1}>
            <FormControl isRequired mb={2}>
              <FormLabel
              fontSize="12px"
              fontWeight="bold"
              color="#666666"
              >Valor por Litro (R$)</FormLabel>
              <NumberInput
                value={formData.valorLitro}
                min={0}
                step={0.01}
                precision={3}
                onChange={(value) => handleNumberChange("valorLitro", value)}
              >
                <NumberInputField
                 height="40px"
                  fontSize="14px"
                  borderRadius="6px"
                  borderColor="gray.300"
                  _hover={{ borderColor: "gray.400" }}
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
                  }}
                  px="12px"
                />
                <NumberInputStepper>
                  <NumberIncrementStepper 
                   border="none"
                    color="gray.500"
                    _hover={{ color: "blue.500" }}
                  />
                  <NumberDecrementStepper
                   border="none"
                    color="gray.500"
                    _hover={{ color: "blue.500" }}
                  />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </GridItem>
        

          <GridItem colSpan={1}>
            <FormControl isRequired mb={2}>
              <FormLabel
              fontSize="12px"
              fontWeight="bold"
              color="#666666"
              >Valor Total</FormLabel>
              <Input
                name="valorTotal"
                value={formData.valorTotal.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
                isReadOnly
                fontSize="13px"
                border="1px solid #d0d0d0"
                borderRadius="3px"
                height="32px"
                _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
              />
            </FormControl>
           </GridItem>
           
           <GridItem colSpan={1}>
            <FormControl isRequired mb={2}>
              <FormLabel
              fontSize="12px"
              fontWeight="bold"
              color="#666666"
              >Odômetro (km)</FormLabel>
              <NumberInput
                value={formData.odometro}
                min={0}
                step={1}
                onChange={(value) => handleNumberChange("odometro", value)}
              >
                <NumberInputField
                 height="40px"
                  fontSize="14px"
                  borderRadius="6px"
                  borderColor="gray.300"
                  _hover={{ borderColor: "gray.400" }}
                  _focus={{
                    borderColor: "blue.400",
                    boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
                  }}
                  px="12px"
                />
                <NumberInputStepper>
                  <NumberIncrementStepper 
                  border="none"
                    color="gray.500"
                    _hover={{ color: "blue.500" }}
                  />
                  <NumberDecrementStepper 
                  border="none"
                    color="gray.500"
                    _hover={{ color: "blue.500" }}
                  />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
          </GridItem>
         
          <GridItem colSpan={1}>
            <FormControl isRequired mb={2}>
              <FormLabel
              fontSize="12px"
              fontWeight="bold"
              color="#666666"
              >Posto</FormLabel>
              <Input
                name="posto"
                value={formData.posto}
                onChange={handleChange}
                placeholder="Ex: Shell, Petrobras, etc."
                 fontSize="13px"
                border="1px solid #d0d0d0"
                borderRadius="3px"
                height="32px"
                _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
              />
            </FormControl>
          </GridItem>

          <GridItem colSpan={1}>
            <FormControl isRequired mb={2}>
              <FormLabel
              fontSize="12px"
              fontWeight="bold"
              color="#666666"
              >Tipo de Combustível</FormLabel>
              <Select
                name="tipoCombustivel"
                value={formData.tipoCombustivel}
                onChange={handleChange}
                fontSize="13px"
                border="1px solid #d0d0d0"
                borderRadius="3px"
                height="32px"
                _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}                
              >
                {tiposCombustivel.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </Select>
            </FormControl>
          </GridItem>
         
          <GridItem colSpan={1}>
            <FormControl isRequired mb={2}>
              <FormLabel
              fontSize="12px"
              fontWeight="bold"
              color="#666666"
              >Observações</FormLabel>
              <Input
                name="observacoes"
                value={formData.observacoes || ""}
                onChange={handleChange}
                placeholder="Observações adicionais (opcional)"
                 fontSize="13px"
                border="1px solid #d0d0d0"
                borderRadius="3px"
                height="32px"
                _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}    
              />
            </FormControl>
          </GridItem>
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
            onClick={handleSubmit} 
            isLoading={isSaving}
            loadingText="Salvando..."
          >
            Salvar Alterações
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditarAbastecimentoModal;