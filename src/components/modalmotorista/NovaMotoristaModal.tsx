import React, { useState } from "react";
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
  useDisclosure,
  useToast,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import axios from "axios";

interface NovaMotoristaModalProps {
  onSalvar: () => void;
}

interface MotoristaForm {
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

const NovaMotoristaModal: React.FC<NovaMotoristaModalProps> = ({ onSalvar }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [formData, setFormData] = useState<MotoristaForm>({
    nome: "",
    telefone: "",
    cnh: "",
    email: "",
    cpf: "",
    rg: "",
    validadeCnh: "",
    endereco: "",
    status: "Ativo",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSalvar = async () => {
    setIsSaving(true);
    try {
      await axios.post("https://gestaofrota.onrender.com/api/motoristas", formData);

      toast({
        title: "Motorista cadastrado com sucesso.",
        description: `${formData.nome} foi salvo.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setFormData({
        nome: "",
        telefone: "",
        cnh: "",
        email: "",
        cpf: "",
        rg: "",
        validadeCnh: "",
        endereco: "",
        status: "Ativo",
      });

      onClose();
      setTimeout(() => {
        onSalvar();
      }, 200);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao salvar motorista.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button 
        leftIcon={<AddIcon />} 
        bg="#e6f4e6"
        color="#2a6b2a"
        border="1px solid #9ecf9e"
        borderRadius="3px"
        fontWeight="normal"
        _hover={{ bg: "#d5e8d5" }}
        fontSize="13px"
        height="28px"
        px={3}
        onClick={onOpen}
      >
        Novo Motorista
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
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
            Cadastrar Motorista
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
              onClick={handleSalvar}
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
    </>
  );
};

export default NovaMotoristaModal;