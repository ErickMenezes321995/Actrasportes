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
  Grid,
  GridItem
} from "@chakra-ui/react";

interface Caminhao {
  id: string;
  placa: string;
  modelo: string;
}

interface TrocaOleo {
  id: string;
  caminhaoId: string;
  dataTroca: string;
  quilometragem: number;
  tipoOleo: string;
  observacoes?: string;
  status: string; 
}

interface EditarOleoModalProps {
  isOpen: boolean;
  onClose: () => void;
  troca: TrocaOleo;
  caminhoes: Caminhao[];
  onSalvar: (trocaAtualizada: TrocaOleo) => void;
}

const EditarOleoModal: React.FC<EditarOleoModalProps> = ({
  isOpen,
  onClose,
  troca,
  caminhoes,
  onSalvar,
}) => {
  const toast = useToast();
  const [formData, setFormData] = useState<TrocaOleo>(troca);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(troca);
  }, [troca]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quilometragem" ? Number(value) : value,
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
    if (!formData.dataTroca || formData.quilometragem <= 0 || !formData.tipoOleo || !formData.status) {
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
      const response = await fetch(
        `https://backend-frotas.onrender.com/api/trocaOleo/${formData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao atualizar troca de óleo: ${errorText}`);
      }

      const atualizado: TrocaOleo = await response.json();

      toast({
        title: "Troca de óleo atualizada com sucesso",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onSalvar(atualizado);
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar troca de óleo:", error);
      toast({
        title: "Erro ao salvar troca de óleo",
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
      <ModalContent  borderRadius="4px" border="1px solid #a3bde3" boxShadow="0 2px 8px rgba(0,0,0,0.15)">
        <ModalHeader
         bg="#dfeaf5" 
          borderBottom="1px solid #a3bde3" 
          py={2} 
          px={3}
          fontSize="15px"
          fontWeight="600"
          color="#15457b"
          fontFamily="Arial, sans-serif"
        >Editar Troca de Óleo</ModalHeader>
        <ModalCloseButton
         color="#666666"
          _hover={{ color: "#15457b", bg: "#c5d5e6" }}
          borderRadius="3px"
          size="sm"
          mt={1}
          mr={1}
        />
        <ModalBody  pb={4} px={4} pt={4} maxH="70vh" overflowY="auto">
          <Grid templateColumns="repeat(2, 1fr)" gap={2}>
            <GridItem colSpan={2}>
              <FormControl isRequired mb={2}>
                  <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Caminhão</FormLabel>
                    <Select
                      name="caminhaoId"
                      value={formData.caminhaoId}
                      onChange={handleChange}                
                      fontSize="13px"
                      border="1px solid #d0d0d0"
                      borderRadius="3px"
                      height="32px"
                      _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                    >
                      <option value="" disabled>
                        Selecione um caminhão
                      </option>
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
                  <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Data da Troca</FormLabel>
                   <Input
                    name="dataTroca"
                    type="date"
                    value={formData.dataTroca}
                    onChange={handleChange}
                    border="1px solid #d0d0d0"
                      borderRadius="3px"
                      height="32px"
                      _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                  />
                </FormControl>
            </GridItem>


              <GridItem colSpan={1}>
              <FormControl isRequired mb={2}>
                  <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Quilometragem</FormLabel>
                   <Input
                     name="quilometragem"
                      type="number"
                      value={formData.quilometragem}
                      onChange={handleChange}
                      min={0}
                       border="1px solid #d0d0d0"
                      borderRadius="3px"
                      height="32px"
                      _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                  />
                </FormControl>
            </GridItem>
        
          <GridItem colSpan={1}>
              <FormControl isRequired mb={2}>
                  <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Tipo de Oleo</FormLabel>
                   <Input
                      name="tipoOleo"
                      value={formData.tipoOleo}
                      onChange={handleChange}
                      placeholder="Ex: Sintético 15W-40"
                      min={0}
                       border="1px solid #d0d0d0"
                      borderRadius="3px"
                      height="32px"
                      _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                  />
                </FormControl>
            </GridItem>


            <GridItem colSpan={1}>
              <FormControl isRequired mb={2}>
                  <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Tipo de Oleo</FormLabel>
                   <Input
                      name="tipoOleo"
                      value={formData.tipoOleo}
                      onChange={handleChange}
                      placeholder="Ex: Sintético 15W-40"
                      min={0}
                       border="1px solid #d0d0d0"
                      borderRadius="3px"
                      height="32px"
                      _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                  />
                </FormControl>
            </GridItem>

        

          <FormControl isRequired>
            <FormLabel>Status</FormLabel>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Pendente">Pendente</option>
              <option value="Concluída">Concluída</option>
              <option value="Cancelada">Cancelada</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Observações</FormLabel>
            <Input
              name="observacoes"
              value={formData.observacoes || ""}
              onChange={handleChange}
              placeholder="Opcional"
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
          >
            Salvar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditarOleoModal;