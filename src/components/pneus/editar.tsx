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

interface Caminhao {
  id: string;
  placa: string;
  modelo: string;
}

interface EditarPneuModalProps {
  isOpen: boolean;
  onClose: () => void;
  pneu: Pneu;
  caminhoes: Caminhao[];
  onSalvar: (pneuAtualizado: Pneu) => void;
}

const EditarPneuModal: React.FC<EditarPneuModalProps> = ({
  isOpen,
  onClose,
  pneu,
  caminhoes,
  onSalvar,
}) => {
  const toast = useToast();
  const [formData, setFormData] = useState<Pneu>(pneu);

  useEffect(() => {
    setFormData(pneu);
  }, [pneu]);

  const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;
  setFormData({ ...formData, [name]: name === "caminhaoId" ? Number(value) : value });
};

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `https://gestaofrota.onrender.com/api/trocaPneus/${formData.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao atualizar pneu");
      }

      const atualizado = await response.json();
      onSalvar(atualizado);
      toast({
        title: "Pneu atualizado com sucesso",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao salvar pneu",
        description: String(error),
        status: "error",
        duration: 3000,
        isClosable: true,
      });
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
        >Editar Pneu</ModalHeader>
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
                <FormLabel  fontSize="12px" fontWeight="600" color="#666666" mb={1}>Caminhão</FormLabel>
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
                  <option value={0} disabled>
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
            <Input
              name="posicao"
              value={formData.posicao}
              onChange={handleChange}
               fontSize="13px"
              border="1px solid #d0d0d0"
              borderRadius="3px"
              height="32px"
              _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel  fontSize="12px" fontWeight="600" color="#666666" mb={1}>Marca</FormLabel>
            <Input
              name="marca"
              value={formData.marca}
              onChange={handleChange}
               fontSize="13px"
              border="1px solid #d0d0d0"
              borderRadius="3px"
              height="32px"
              _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel  fontSize="12px" fontWeight="600" color="#666666" mb={1}>Código do Pneu</FormLabel>
            <Input
              name="codigoPneu"
              value={formData.codigoPneu}
              onChange={handleChange}
               fontSize="13px"
              border="1px solid #d0d0d0"
              borderRadius="3px"
              height="32px"
              _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
            />
          </FormControl>

          <FormControl>
            <FormLabel  fontSize="12px" fontWeight="600" color="#666666" mb={1}>Observação</FormLabel>
            <Input
              name="observacao"
              value={formData.observacao}
              onChange={handleChange}
               fontSize="13px"
              border="1px solid #d0d0d0"
              borderRadius="3px"
              height="32px"
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
          variant="ghost" onClick={onClose}>
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
              cursor: "not-allowed",}}
          onClick={handleSubmit}>
            Salvar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditarPneuModal;
