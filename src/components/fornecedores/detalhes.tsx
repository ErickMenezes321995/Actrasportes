import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Box,
  VStack,
  Grid,
  GridItem,
} from "@chakra-ui/react";

interface Fornecedor {
  id: number;
  nomeFantasia: string;
  razaoSocial?: string;
  cnpj?: string;
  cidade?: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cep?: string;
  responsavel?: string;
  observacoes?: string;
  dataCadastro?: string;
  status: string;
}

interface DetalhesFornecedorModalProps {
  isOpen: boolean;
  onClose: () => void;
  fornecedor: Fornecedor;
}

const DetalhesFornecedorModal: React.FC<DetalhesFornecedorModalProps> = ({
  isOpen,
  onClose,
  fornecedor,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
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
          Detalhes do Fornecedor
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
            <GridItem colSpan={2}>
              <Box mb={3}>
                <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Nome Fantasia</Box>
                <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                  {fornecedor.nomeFantasia}
                </Box>
              </Box>
            </GridItem>

            <GridItem colSpan={2}>
              <Box mb={3}>
                <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Razão Social</Box>
                <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                  {fornecedor.razaoSocial || "Não informado"}
                </Box>
              </Box>
            </GridItem>

            <GridItem>
              <Box mb={3}>
                <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>CNPJ</Box>
                <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                  {fornecedor.cnpj || "Não informado"}
                </Box>
              </Box>
            </GridItem>

            <GridItem>
              <Box mb={3}>
                <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Responsável</Box>
                <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                  {fornecedor.responsavel || "Não informado"}
                </Box>
              </Box>
            </GridItem>

            <GridItem>
              <Box mb={3}>
                <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Email</Box>
                <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                  {fornecedor.email || "Não informado"}
                </Box>
              </Box>
            </GridItem>

            <GridItem>
              <Box mb={3}>
                <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Telefone</Box>
                <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                  {fornecedor.telefone || "Não informado"}
                </Box>
              </Box>
            </GridItem>

            <GridItem colSpan={2}>
              <Box mb={3}>
                <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Endereço</Box>
                <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                  {fornecedor.endereco || "Não informado"}
                </Box>
              </Box>
            </GridItem>

            <GridItem>
              <Box mb={3}>
                <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>CEP</Box>
                <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                  {fornecedor.cep || "Não informado"}
                </Box>
              </Box>
            </GridItem>

            <GridItem>
              <Box mb={3}>
                <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Cidade</Box>
                <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                  {fornecedor.cidade || "Não informado"}
                </Box>
              </Box>
            </GridItem>

            <GridItem>
              <Box mb={3}>
                <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Status</Box>
                <Box 
                  fontSize="13px" 
                  color={fornecedor.status === "ativo" ? "#2a6b2a" : "#a33d3d"} 
                  bg={fornecedor.status === "ativo" ? "#e6f4e6" : "#f9e6e6"} 
                  p={2} 
                  borderRadius="3px" 
                  border="1px solid"
                  borderColor={fornecedor.status === "ativo" ? "#9ecf9e" : "#e0a8a8"}
                  fontWeight="600"
                  textTransform="capitalize"
                >
                  {fornecedor.status}
                </Box>
              </Box>
            </GridItem>

            <GridItem>
              <Box mb={3}>
                <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Data de Cadastro</Box>
                <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                  {fornecedor.dataCadastro || "Não informado"}
                </Box>
              </Box>
            </GridItem>

            <GridItem colSpan={2}>
              <Box mb={3}>
                <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Observações</Box>
                <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0" minH="60px">
                  {fornecedor.observacoes || "Nenhuma"}
                </Box>
              </Box>
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
            onClick={onClose}
          >
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DetalhesFornecedorModal;