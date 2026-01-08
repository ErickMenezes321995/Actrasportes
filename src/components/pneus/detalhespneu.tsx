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
  Badge,
  Grid,
  GridItem,
  FormControl,
  FormLabel
} from "@chakra-ui/react";

interface Pneu {
  id: string;
  caminhaoId: any; 
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

interface DetalhesPneuModalProps {
  isOpen: boolean;
  onClose: () => void;
  pneu: Pneu;
  caminhoes?: Caminhao[];
}

const DetalhesPneuModal: React.FC<DetalhesPneuModalProps> = ({
  isOpen,
  onClose,
  pneu,
  caminhoes = [],
}) => {

  const getCaminhao = () => {
    if (pneu.caminhaoId && typeof pneu.caminhaoId === 'object') {
      const caminhaoIdString = pneu.caminhaoId._id || pneu.caminhaoId.id;
      return caminhoes.find(c => c.id === caminhaoIdString) || pneu.caminhaoId;
    }
    

    if (typeof pneu.caminhaoId === 'string') {
      return caminhoes.find(c => c.id === pneu.caminhaoId);
    }
    
    return null;
  };

  const caminhao = getCaminhao();

  const getCaminhaoIdString = () => {
    if (typeof pneu.caminhaoId === 'string') {
      return pneu.caminhaoId;
    }
    if (pneu.caminhaoId && typeof pneu.caminhaoId === 'object') {
      return pneu.caminhaoId._id || pneu.caminhaoId.id || 'ID não disponível';
    }
    return 'ID não disponível';
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const getBadgeColor = (tipo: string) => {
    switch (tipo) {
      case "Troca": return "green";
      case "Reparo": return "orange";
      case "Preventiva": return "blue";
      default: return "gray";
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
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
        >Detalhes da Troca de Pneu</ModalHeader>
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
                <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                    {caminhao ? 
                  `${caminhao.placa || 'Sem placa'} - ${caminhao.modelo || 'Sem modelo'}` : 
                  `ID ${getCaminhaoIdString()}`
                }
                </Box>
              </FormControl>
            </GridItem>

             <GridItem colSpan={1}>
              <FormControl isRequired mb={2}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Codigo do Pneu</FormLabel>
                <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                   {pneu.codigoPneu}
                </Box>
              </FormControl>
            </GridItem>

            <GridItem colSpan={1}>
              <FormControl isRequired mb={2}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Marca</FormLabel>
                <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                   {pneu.marca}
                </Box>
              </FormControl>
            </GridItem>

            <GridItem colSpan={1}>
              <FormControl isRequired mb={2}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Posição</FormLabel>
                <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                   {pneu.posicao}
                </Box>
              </FormControl>
            </GridItem>

             <GridItem colSpan={1}>
              <FormControl isRequired mb={2}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Tipo</FormLabel>
                <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                   {pneu.tipo}
                </Box>
              </FormControl>
            </GridItem>

             <GridItem colSpan={1}>
              <FormControl isRequired mb={2}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Valor</FormLabel>
                <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                   {formatarValor(pneu.valor)}
                </Box>
              </FormControl>
            </GridItem>

             <GridItem colSpan={1}>
              <FormControl isRequired mb={2}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Data da Troca</FormLabel>
                <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                   {formatarData(pneu.dataTroca)}
                </Box>
              </FormControl>
            </GridItem>

            {pneu.createdAt && (<GridItem colSpan={1}>
              <FormControl isRequired mb={2}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Registrado em</FormLabel>
                <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                   {formatarData(pneu.createdAt)}
                </Box>
              </FormControl>
            </GridItem>)}


             <GridItem colSpan={1}>
              <FormControl isRequired mb={2}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Observação</FormLabel>
                <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                  {pneu.observacao || "Nenhuma observação"}
                </Box>
              </FormControl>
            </GridItem>

            {/* <Box pt={2} borderTopWidth={1} borderTopColor="gray.200" width="100%">
              <b>Informações Técnicas:</b>
              <Box pl={4} mt={1}>
                <Box><b>ID do Registro:</b> {pneu.id}</Box>
                <Box><b>ID do Caminhão:</b> {getCaminhaoIdString()}</Box>
              </Box>
            </Box> */}
          
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
          onClick={onClose}>
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DetalhesPneuModal;