import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Grid,
  GridItem,
  InputLeftElement,
  InputGroup
} from "@chakra-ui/react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (despesa: {
    data: string;
    descricao: string;
    valor: number;
    responsavel: string;
    tipo: "Despesa";
  }) => void;
}

const ModalNovaDespesa: React.FC<Props> = ({ isOpen, onClose, onSalvar }) => {
  const toast = useToast();

  const [data, setData] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [responsavel, setResponsavel] = useState("");

 const handleSalvar = () => {
  if (!data || !descricao || !valor || !responsavel) {
    toast({
      title: "Preencha todos os campos.",
      status: "warning",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  const valorNum = Number(
    valor.replace(/\s/g, "")   
         .replace("R$", "")    
         .replace(/\./g, "")   
         .replace(",", ".")    
  );

  if (isNaN(valorNum) || valorNum <= 0) {
    toast({
      title: "Valor inválido.",
      status: "warning",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  onSalvar({
    data,
    descricao,
    valor: valorNum,
    responsavel,
    tipo: "Despesa",
  });

  setData("");
  setDescricao("");
  setValor("");
  setResponsavel("");
  onClose();
};


  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent
      borderRadius="4px" 
        border="1px solid #a3bde3" 
        boxShadow="0 2px 8px rgba(0,0,0,0.15)">
  
        <ModalHeader
          bg="#dfeaf5" 
          borderBottom="1px solid #a3bde3" 
          py={2} 
          px={3}
          fontSize="15px"
          fontWeight="600"
          color="#15457b"
          fontFamily="Arial, sans-serif"
        >Nova Despesa</ModalHeader>
        <ModalCloseButton
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
            >Data</FormLabel>
            <Input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
               fontSize="13px"
                border="1px solid #d0d0d0"
                borderRadius="3px"
                height="32px"
                _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
            />
          </FormControl>
          </GridItem>

          <GridItem colSpan={2}>
          <FormControl isRequired mb={2}>
            <FormLabel
            fontSize="12px" 
                fontWeight="600" 
                color="#666666" 
                mb={1}
            >Descrição</FormLabel>
            <Input
              placeholder="Descrição da despesa"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
               fontSize="13px"
                border="1px solid #d0d0d0"
                borderRadius="3px"
                height="32px"
                _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
            />
          </FormControl>
          </GridItem>

          <GridItem colSpan={2}>
          <FormControl isRequired mb={2}>
            <FormLabel
            fontSize="12px" 
                fontWeight="600" 
                color="#666666" 
                mb={1}
            >Valor</FormLabel>
            <InputGroup>
            <InputLeftElement
              pointerEvents="none"
              height="40px"
              fontSize="14px"
              color="gray.500"
              children="R$"
            />
            <Input
              type="text"
              placeholder="0,00"
              value={valor}
              height="40px"
              fontSize="14px"
              borderRadius="6px"
              borderColor="gray.300"
              pl="40px"
              pr="12px"
              _hover={{ borderColor: "gray.400" }}
              _focus={{
                borderColor: "blue.400",
                boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)",
              }}
              onChange={(e) => {
                let v = e.target.value;
                
                v = v.replace(/[^\d,.]/g, "");
                
                
                const parts = v.split(/[,.]/);
                if (parts.length > 2) {
                  
                  if (v.includes(',') && v.includes('.')) {
                    
                    const lastComma = v.lastIndexOf(',');
                    const lastDot = v.lastIndexOf('.');
                    const lastSeparator = Math.max(lastComma, lastDot);
                    const decimalSeparator = v.charAt(lastSeparator);
                    
                    
                    v = v.replace(/[,.]/g, '');
                    const beforeDecimal = v.substring(0, lastSeparator - (parts.length - 2));
                    const afterDecimal = v.substring(lastSeparator - (parts.length - 2));
                    v = beforeDecimal + decimalSeparator + afterDecimal;
                  }
                }
                
                setValor(v);
              }}
              onBlur={(e) => {
                let v = e.target.value.trim();
                
                if (v === '') {
                  setValor('');
                  return;
                }
                
                const rawValue = v.replace(/\./g, '');
                
              
                const lastComma = rawValue.lastIndexOf(',');
                const lastDot = rawValue.lastIndexOf('.');
                const lastSeparator = Math.max(lastComma, lastDot);
                
                let numericValue;
                if (lastSeparator !== -1) {
                  const integerPart = rawValue.substring(0, lastSeparator).replace(/[^\d]/g, '');
                  const decimalPart = rawValue.substring(lastSeparator + 1).replace(/[^\d]/g, '');
                  const fullNumber = integerPart + '.' + decimalPart;
                  numericValue = parseFloat(fullNumber) || 0;
                } else {
                  numericValue = parseFloat(rawValue) || 0;
                }
                
                setValor(numericValue.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }));
              }}
            />
          </InputGroup>
          </FormControl>
          </GridItem>

          <GridItem colSpan={2}>
          <FormControl isRequired mb={2}>
            <FormLabel
            fontSize="12px" 
                fontWeight="600" 
                color="#666666" 
                mb={1}
            >Responsável</FormLabel>
            <Input
              placeholder="Nome do responsável"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
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
           <Button onClick={onClose}
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
            _disabled={{
              bg: "#f0f0f0",
              color: "#999999",
              borderColor: "#d0d0d0",
              cursor: "not-allowed"
            }}
          onClick={handleSalvar}>
            Salvar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalNovaDespesa;
