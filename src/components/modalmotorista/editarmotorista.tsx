import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  Grid,
  GridItem,
} from "@chakra-ui/react";

interface Motorista {
  id: number;
  nome: string;
  telefone: string;
  cnh: string;
  email: string;
  cpf: string;
  rg: string;
  validadeCnh: string;
  endereco: string;
  status: string;
}

interface EditarMotoristaModalProps {
  isOpen: boolean;
  onClose: () => void;
  motorista: Motorista;
  onSalvar: (motoristaAtualizado: Motorista) => void;
}

const EditarMotoristaModal: React.FC<EditarMotoristaModalProps> = ({
  isOpen,
  onClose,
  motorista,
  onSalvar,
}) => {
  const [formData, setFormData] = useState<Motorista>(motorista);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setFormData(motorista);
  }, [motorista]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const response = await axios.put<Motorista>(
        `https://backend-frotas.onrender.com/api/motoristas/${formData.id}`,
        formData
      );
      onSalvar(response.data);
      onClose();
      toast({
        title: "Motorista atualizado com sucesso.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Erro ao atualizar motorista", error);
      toast({
        title: "Erro ao atualizar motorista.",
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
        >
          Editar Motorista
        </ModalHeader>
        <ModalCloseButton 
          color="#666666"
          _hover={{ color: "#15457b", bg: "#c5d5e6" }}
          borderRadius="3px"
          size="sm"
          mt={1}
          mr={1}
        />
        <ModalBody pb={3} px={3} pt={3}>
          <Grid templateColumns="repeat(2, 1fr)" gap={2}>
            {/* Primeira coluna */}
            <GridItem colSpan={2}>
              <FormControl mb={2}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Nome</FormLabel>
                <Input 
                  name="nome" 
                  value={formData.nome} 
                  onChange={handleChange}
                  fontSize="13px"
                  border="1px solid #d0d0d0"
                  borderRadius="3px"
                  height="30px"
                  _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl mb={2}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Telefone</FormLabel>
                <Input
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  fontSize="13px"
                  border="1px solid #d0d0d0"
                  borderRadius="3px"
                  height="30px"
                  _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl mb={2}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>CNH</FormLabel>
                <Input 
                  name="cnh" 
                  value={formData.cnh} 
                  onChange={handleChange}
                  fontSize="13px"
                  border="1px solid #d0d0d0"
                  borderRadius="3px"
                  height="30px"
                  _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl mb={2}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Email</FormLabel>
                <Input 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  fontSize="13px"
                  border="1px solid #d0d0d0"
                  borderRadius="3px"
                  height="30px"
                  _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl mb={2}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>CPF</FormLabel>
                <Input 
                  name="cpf" 
                  value={formData.cpf} 
                  onChange={handleChange}
                  fontSize="13px"
                  border="1px solid #d0d0d0"
                  borderRadius="3px"
                  height="30px"
                  _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl mb={2}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>RG</FormLabel>
                <Input 
                  name="rg" 
                  value={formData.rg} 
                  onChange={handleChange}
                  fontSize="13px"
                  border="1px solid #d0d0d0"
                  borderRadius="3px"
                  height="30px"
                  _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                />
              </FormControl>
            </GridItem>

            {/* Segunda coluna */}
            <GridItem>
              <FormControl mb={2}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Validade CNH</FormLabel>
                <Input
                  type="date"
                  name="validadeCnh"
                  value={formData.validadeCnh}
                  onChange={handleChange}
                  fontSize="13px"
                  border="1px solid #d0d0d0"
                  borderRadius="3px"
                  height="30px"
                  _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl mb={2}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Status</FormLabel>
                <Select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange}
                  fontSize="13px"
                  border="1px solid #d0d0d0"
                  borderRadius="3px"
                  height="30px"
                  _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </Select>
              </FormControl>
            </GridItem>

            <GridItem colSpan={2}>
              <FormControl mb={2}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Endereço</FormLabel>
                <Input
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  fontSize="13px"
                  border="1px solid #d0d0d0"
                  borderRadius="3px"
                  height="30px"
                  _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                />
              </FormControl>
            </GridItem>
          </Grid>
        </ModalBody>

        <ModalFooter 
          bg="#f5f5f5" 
          borderTop="1px solid #e0e0e0" 
          py={2} 
          px={3}
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
            height="26px"
            px={3}
            mr={2}
            onClick={onClose}
          >
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
            height="26px"
            px={3}
            onClick={handleSubmit}
            isLoading={isSaving}
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

export default EditarMotoristaModal;