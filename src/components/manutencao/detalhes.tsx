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
} from "@chakra-ui/react";

interface CaminhaoInfo {
  _id?: string;
  id?: string;
  placa: string;
  modelo: string;
}

interface ManutencaoPreventiva {
  id: string;
  caminhaoId: string | CaminhaoInfo;
  data: string;
  tipo: string;
  quilometragem: number;
  oficina: string;
  custo: number;
  proximaRevisao: string;
  observacoes?: string;
  status: string;
}

interface DetalhesManutencaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  manutencao: ManutencaoPreventiva;
  getNomeCaminhao: (caminhaoData: string | CaminhaoInfo) => string;
}

const DetalhesManutencaoModal: React.FC<DetalhesManutencaoModalProps> = ({
  isOpen,
  onClose,
  manutencao,
  getNomeCaminhao,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluída":
        return "green";
      case "Agendada":
        return "yellow";
      case "Cancelada":
        return "red";
      case "Atrasada":
        return "orange";
      default:
        return "gray";
    }
  };

  const formatarData = (dataString: string) => {
    try {
      return new Date(dataString).toLocaleDateString('pt-BR');
    } catch {
      return dataString;
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
      <ModalOverlay />
      <ModalContent 
      borderRadius="4px" 
      border="1px solid #a3bde3" 
      boxShadow="0 2px 8px rgba(0,0,0,0.15)">
        <ModalHeader
        bg="#dfeaf5" 
          borderBottom="1px solid #a3bde3" 
          py={3} 
          px={4}
          fontSize="16px"
          fontWeight="600"
          color="#15457b"
          fontFamily="Arial, sans-serif"
        >Detalhes da Manutenção</ModalHeader>
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
              <Box 
              fontSize="12px" 
              fontWeight="600" 
              color="#666666" 
              mb={1}
              >Veículo</Box>
              <Box 
              fontSize="13px" 
              color="#333333" 
              bg="#f9f9f9" 
              p={2} 
              borderRadius="3px" 
              border="1px solid 
              #e0e0e0">
                {getNomeCaminhao(manutencao.caminhaoId)}
                </Box>
            </Box>
            </GridItem>
          
          <GridItem colSpan={1}>
            <Box mb={3}>
              <Box  fontSize="12px" 
              fontWeight="600" 
              color="#666666" 
              mb={1}
              >Data da Manutenção</Box>
              <Box
               fontSize="13px" 
              color="#333333" 
              bg="#f9f9f9" 
              p={2} 
              borderRadius="3px" 
              border="1px solid 
              #e0e0e0"
              >{formatarData(manutencao.data)}</Box>
            </Box>
          </GridItem>
          
          <GridItem colSpan={1}>
            <Box mb={3}>
              <Box 
             fontSize="12px" 
              fontWeight="600" 
              color="#666666">Tipo</Box>
              <Box 
               fontSize="13px" 
              color="#333333" 
              bg="#f9f9f9" 
              p={2} 
              borderRadius="3px" 
              border="1px solid 
              #e0e0e0"
              >{manutencao.tipo}</Box>
            </Box>
          </GridItem>
          
          <GridItem colSpan={1}>
            <Box mb={3}>
              <Box 
             fontSize="12px" 
              fontWeight="600" 
              color="#666666" 
              mb={1}>Quilometragem</Box>
              <Box
               fontSize="13px" 
              color="#333333" 
              bg="#f9f9f9" 
              p={2} 
              borderRadius="3px" 
              border="1px solid 
              #e0e0e0"
              >{manutencao.quilometragem.toLocaleString('pt-BR')}</Box>
            </Box>
          </GridItem>
          
          <GridItem colSpan={1}>
            <Box mb={3}>
              <Box 
               fontSize="12px" 
              fontWeight="600" 
              color="#666666" 
              mb={1}
              >Oficina</Box>
              <Box
                fontSize="13px" 
              color="#333333" 
              bg="#f9f9f9" 
              p={2} 
              borderRadius="3px" 
              border="1px solid 
              #e0e0e0"
              >{manutencao.oficina}</Box>
            </Box>
          </GridItem>
          
          <GridItem colSpan={1}>
            <Box mb={3}>
              <Box 
              fontSize="12px" 
              fontWeight="600" 
              color="#666666" 
              mb={1}
              >Custo</Box>
              <Box
               fontSize="13px" 
              color="#333333" 
              bg="#f9f9f9" 
              p={2} 
              borderRadius="3px" 
              border="1px solid 
              #e0e0e0"
              >{formatarMoeda(manutencao.custo)}</Box>
            </Box>
          </GridItem>

          <GridItem colSpan={1}>
            <Box mb={3}>
              <Box 
              fontSize="12px" 
              fontWeight="600" 
              color="#666666" 
              mb={1}
              >Próxima Revisão</Box>
              <Box
              fontSize="13px" 
              color="#333333" 
              bg="#f9f9f9" 
              p={2} 
              borderRadius="3px" 
              border="1px solid 
              #e0e0e0"
              >{formatarData(manutencao.proximaRevisao)}</Box>
            </Box>
          </GridItem>
          
          <GridItem colSpan={1}>
            <Box mb={3}>
              <Box 
              fontSize="12px" 
              fontWeight="600" 
              color="#666666" 
              mb={1}
              >Status</Box>
              <Badge 
              colorScheme={getStatusColor(manutencao.status)}
                fontSize="13px"  
              p={2} 
              borderRadius="3px" 
              border="1px solid 
              #e0e0e0"
              >
                {manutencao.status}
              </Badge>
            </Box>
          </GridItem>
          
          <GridItem colSpan={1}>
            <Box mb={3}>
              <Box 
               fontSize="12px" 
              fontWeight="600" 
              color="#666666" 
              mb={1}
              >Observações</Box>
              <Box 
                bg={manutencao.observacoes ? "gray.50" : "transparent"}
                p={manutencao.observacoes ? 3 : 0}
                borderRadius="md"
                border={manutencao.observacoes ? "1px" : "none"}
                borderColor="gray.200"
                minHeight={manutencao.observacoes ? "30px" : "auto"}
                fontSize="13px" 
              color="#333333" 
              >
                {manutencao.observacoes || "Nenhuma observação registrada"}
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
            mr={2}
          onClick={onClose} >
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DetalhesManutencaoModal;