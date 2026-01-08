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
  GridItem,
  Textarea,
} from "@chakra-ui/react";

interface Cliente {
  id: number;
  nome: string;
  cnpj: string;
  cidade: string;
  estado: string;
  email: string;
  telefone: string;
  endereco: string;
  cep: string;
  responsavel: string;
  dataCadastro: string;
  status: string;
  observacoes: string;
}

interface EditarClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente;
  onSalvar: (clienteAtualizado: Cliente) => void;
}

const EditarClienteModal: React.FC<EditarClienteModalProps> = ({
  isOpen,
  onClose,
  cliente,
  onSalvar,
}) => {
  const toast = useToast();
  const [formData, setFormData] = useState<Cliente>(cliente);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(cliente);
  }, [cliente]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch(
        `https://gestaofrota.onrender.com/api/clientes/${formData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao atualizar cliente");
      }

      const atualizado = await response.json();
      onSalvar(atualizado);
      toast({
        title: "Cliente atualizado com sucesso",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao salvar cliente",
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
          py={3} 
          px={4}
          fontSize="16px"
          fontWeight="600"
          color="#15457b"
          fontFamily="Arial, sans-serif"
        >
          Editar Cliente
        </ModalHeader>
        <ModalCloseButton 
          color="#666666"
          _hover={{ color: "#15457b", bg: "#c5d5e6" }}
          borderRadius="3px"
          size="sm"
          mt={1}
          mr={1}
        />
        <ModalBody pb={4} px={4} pt={4} maxH="70vh" overflowY="auto">
          <Grid templateColumns="repeat(2, 1fr)" gap={3}>
            {/* Primeira coluna */}
            <GridItem colSpan={2}>
              <FormControl isRequired mb={3}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Nome</FormLabel>
                <Input 
                  name="nome" 
                  value={formData.nome} 
                  onChange={handleChange}
                  fontSize="13px"
                  border="1px solid #d0d0d0"
                  borderRadius="3px"
                  height="32px"
                  _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl isRequired mb={3}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>CNPJ</FormLabel>
                <Input 
                  name="cnpj" 
                  value={formData.cnpj} 
                  onChange={handleChange}
                  fontSize="13px"
                  border="1px solid #d0d0d0"
                  borderRadius="3px"
                  height="32px"
                  _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl isRequired mb={3}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Email</FormLabel>
                <Input 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  fontSize="13px"
                  border="1px solid #d0d0d0"
                  borderRadius="3px"
                  height="32px"
                  _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl isRequired mb={3}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Telefone</FormLabel>
                <Input 
                  name="telefone" 
                  value={formData.telefone} 
                  onChange={handleChange}
                  fontSize="13px"
                  border="1px solid #d0d0d0"
                  borderRadius="3px"
                  height="32px"
                  _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl isRequired mb={3}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Responsável</FormLabel>
                <Input 
                  name="responsavel" 
                  value={formData.responsavel} 
                  onChange={handleChange}
                  fontSize="13px"
                  border="1px solid #d0d0d0"
                  borderRadius="3px"
                  height="32px"
                  _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl isRequired mb={3}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Status</FormLabel>
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
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </Select>
              </FormControl>
            </GridItem>

            {/* Segunda coluna */}
            <GridItem>
              <FormControl isRequired mb={3}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Cidade</FormLabel>
                <Input 
                  name="cidade" 
                  value={formData.cidade} 
                  onChange={handleChange}
                  fontSize="13px"
                  border="1px solid #d0d0d0"
                  borderRadius="3px"
                  height="32px"
                  _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl isRequired mb={3}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Estado</FormLabel>
                <Input 
                  name="estado" 
                  value={formData.estado} 
                  onChange={handleChange}
                  fontSize="13px"
                  border="1px solid #d0d0d0"
                  borderRadius="3px"
                  height="32px"
                  _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                />
              </FormControl>
            </GridItem>

            <GridItem colSpan={2}>
              <FormControl isRequired mb={3}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Endereço</FormLabel>
                <Input 
                  name="endereco" 
                  value={formData.endereco} 
                  onChange={handleChange}
                  fontSize="13px"
                  border="1px solid #d0d0d0"
                  borderRadius="3px"
                  height="32px"
                  _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl isRequired mb={3}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>CEP</FormLabel>
                <Input 
                  name="cep" 
                  value={formData.cep} 
                  onChange={handleChange}
                  fontSize="13px"
                  border="1px solid #d0d0d0"
                  borderRadius="3px"
                  height="32px"
                  _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                />
              </FormControl>
            </GridItem>

            <GridItem>
              <FormControl isRequired mb={3}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Data de Cadastro</FormLabel>
                <Input
                  name="dataCadastro"
                  type="date"
                  value={formData.dataCadastro}
                  onChange={handleChange}
                  fontSize="13px"
                  border="1px solid #d0d0d0"
                  borderRadius="3px"
                  height="32px"
                  _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                />
              </FormControl>
            </GridItem>

            <GridItem colSpan={2}>
              <FormControl mb={3}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Observações</FormLabel>
                <Textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleChange}
                  fontSize="13px"
                  border="1px solid #d0d0d0"
                  borderRadius="3px"
                  _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                  resize="vertical"
                  minH="80px"
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
            height="28px"
            px={4}
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

export default EditarClienteModal;