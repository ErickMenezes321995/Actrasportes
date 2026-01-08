import React, { useState } from "react";
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

interface ManutencaoPreventiva {
  id: string;
  caminhaoId: string;
  data: string;
  tipo: string;
  quilometragem: number;
  oficina: string;
  custo: number;
  proximaRevisao: string;
  observacoes?: string;
  status: string;
}

interface NovoManutencaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (nova: ManutencaoPreventiva) => void;
  caminhoes: Caminhao[];
}

const NovoManutencaoModal: React.FC<NovoManutencaoModalProps> = ({
  isOpen,
  onClose,
  onSalvar,
  caminhoes,
}) => {
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<Omit<ManutencaoPreventiva, "id">>({
    caminhaoId: "",
    data: new Date().toISOString().split('T')[0],
    tipo: "Preventiva",
    quilometragem: 0,
    oficina: "",
    custo: 0,
    proximaRevisao: "",
    observacoes: "",
    status: "Concluída",
  });

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
    setFormData((prev) => ({
      ...prev,
      [name]: numValue,
    }));
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
        description: "Informe a data da manutenção.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (formData.quilometragem <= 0) {
      toast({
        title: "Erro",
        description: "Informe a quilometragem.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.oficina.trim()) {
      toast({
        title: "Erro",
        description: "Informe a oficina.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (formData.custo <= 0) {
      toast({
        title: "Erro",
        description: "Informe o custo da manutenção.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!formData.proximaRevisao) {
      toast({
        title: "Erro",
        description: "Informe a data da próxima revisão.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        "https://gestaofrota.onrender.com/api/manuPrev",
        {
          method: "POST",
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

      const novaManutencao: ManutencaoPreventiva = await response.json();

      toast({
        title: "Manutenção preventiva cadastrada com sucesso!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onSalvar(novaManutencao);
      onClose();
      
      setFormData({
        caminhaoId: "",
        data: new Date().toISOString().split('T')[0],
        tipo: "Preventiva",
        quilometragem: 0,
        oficina: "",
        custo: 0,
        proximaRevisao: "",
        observacoes: "",
        status: "Concluída",
      });
    } catch (error: any) {
      console.error("Erro ao cadastrar manutenção preventiva:", error);
      toast({
        title: "Erro ao cadastrar manutenção preventiva",
        description: error.message || "Erro desconhecido",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent
       borderRadius="4px" 
      border="1px solid #a3bde3" 
      boxShadow="0 2px 8px rgba(0,0,0,0.15)"
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
        >Nova Manutenção Preventiva</ModalHeader>
        <ModalCloseButton 
         color="#666666"
          _hover={{ color: "#15457b", bg: "#c5d5e6" }}
          borderRadius="3px"
          size="sm"
          mt={1}
          mr={1}
        />
        <ModalBody pb={4} px={4} pt={4} maxH="70vh" overflowY="auto">
          <Grid templateColumns="1fr 1fr" gap={4}>

           <GridItem colSpan={2}>
            <FormControl isRequired mb={2}>
              <FormLabel
              fontSize="12px" 
              fontWeight="600" 
              color="#666666" 
              mb={1}
              >Caminhão</FormLabel>
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
                {caminhoes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.placa} - {c.modelo}
                  </option>
                ))}
              </Select>
            </FormControl>
           </GridItem>
           
           <GridItem colSpan={1}>
            <FormControl isRequired mb={2}>
              <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Data da Manutenção</FormLabel>
              <Input
                name="data"
                type="date"
                value={formData.data}
                onChange={handleChange}
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
              <FormLabel  fontSize="12px" fontWeight="600" color="#666666" mb={1}>Tipo de Manutenção</FormLabel>
              <Select 
               fontSize="13px"
                border="1px solid #d0d0d0"
                borderRadius="3px"
                height="32px"
                _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
              name="tipo" value={formData.tipo} onChange={handleChange}>
                <option value="Preventiva">Preventiva</option>
                <option value="Corretiva">Corretiva</option>
                <option value="Preditiva">Preditiva</option>
              </Select>
            </FormControl>
          </GridItem>
           
           <GridItem colSpan={1}>
            <FormControl isRequired mb={2}>
              <FormLabel  fontSize="12px" fontWeight="600" color="#666666" mb={1}>Status</FormLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                fontSize="13px"
                border="1px solid #d0d0d0"
                borderRadius="3px"
                height="32px"
                _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
              >
                <option value="Concluída">Concluída</option>
                <option value="Agendada">Agendada</option>
                <option value="Cancelada">Cancelada</option>
                <option value="Atrasada">Atrasada</option>
              </Select>
            </FormControl>
          </GridItem>
         

          <GridItem colSpan={1}>
            <FormControl isRequired mb={2}>
              <FormLabel
              fontSize="12px"
              fontWeight="bold"
              color="#666666"
              >Quilometragem (km)</FormLabel>
              <NumberInput
                value={formData.quilometragem}
                min={0}
                step={1}
                onChange={(value) => handleNumberChange("quilometragem", value)}
              >
                <NumberInputField 
                 height="33px"
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
              >Custo (R$)</FormLabel>
              <NumberInput
                value={formData.custo}
                min={0}
                step={0.01}
                precision={2}
                onChange={(value) => handleNumberChange("custo", value)}
              >
                <NumberInputField
                 height="33px"
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
              >Oficina</FormLabel>
              <Input
                name="oficina"
                value={formData.oficina}
                onChange={handleChange}
                placeholder="Nome da oficina"
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
              >Próxima Revisão</FormLabel>
              <Input
                name="proximaRevisao"
                type="date"
                value={formData.proximaRevisao}
                onChange={handleChange}
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
              >Observações</FormLabel>
              <Input
                name="observacoes"
                value={formData.observacoes}
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
            Salvar Manutenção
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NovoManutencaoModal;