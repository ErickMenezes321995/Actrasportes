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
  GridItem,
  Grid,
} from "@chakra-ui/react";

interface Documentacao {
  crlv?: string;
  ipvaPago?: boolean;
  seguro?: string;
  seguroVeicular?: string; 
}

interface Caminhao {
  id: number;
  placa: string;
  modelo: string;
  ano: string;
  renavam: string;
  chassi: string;
  status: string;
  mecanico?: string;
  trocaOleoData?: string;
  ultimaManutencao?: string;
  observacoes?: string;
  cor?: string;
  tipoCombustivel?: string;
  quilometragemAtual?: number;
  numeroEixos?: number;
  proximaRevisao?: string;
  pesoTotal?: string;
  capacidadeTanque?: string;

  documentacao?: Documentacao; 
}

interface DetalhesCaminhaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  caminhao: Caminhao;
}

const DetalhesCaminhaoModal: React.FC<DetalhesCaminhaoModalProps> = ({
  isOpen,
  onClose,
  caminhao,
}) => {
  return (
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
          Detalhes do Caminhão
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
              <GridItem colSpan={1}>
                <Box mb={3}>
                  <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Placa</Box>
                  <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                    {caminhao.placa}
                  </Box>
                </Box>
              </GridItem>

              <GridItem colSpan={1}>
                <Box mb={3}>
                  <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Modelo</Box>
                  <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                    {caminhao.modelo}
                  </Box>
                </Box>
              </GridItem>

              <GridItem colSpan={1}>
                <Box mb={3}>
                  <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Ano</Box>
                  <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                    {caminhao.ano}
                  </Box>
                </Box>
              </GridItem>

              <GridItem colSpan={1}>
                <Box mb={3}>
                  <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Renavam</Box>
                  <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                    {caminhao.renavam}
                  </Box>
                </Box>
              </GridItem>

              <GridItem colSpan={1}>
                <Box mb={3}>
                  <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Chassi</Box>
                  <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                    {caminhao.chassi}
                  </Box>
                </Box>
              </GridItem>

              <GridItem colSpan={1}>
                <Box mb={3}>
                  <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Status</Box>
                  <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                    {caminhao.status}
                  </Box>
                </Box>
              </GridItem>

              <GridItem colSpan={1}>
                <Box mb={3}>
                  <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Cor</Box>
                  <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                    {caminhao.cor}
                  </Box>
                </Box>
              </GridItem>

              <GridItem colSpan={1}>
                <Box mb={3}>
                  <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Tipo de Combustível</Box>
                  <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                    {caminhao.tipoCombustivel}
                  </Box>
                </Box>
              </GridItem>

              <GridItem colSpan={1}>
                <Box mb={3}>
                  <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Quilometragem Atual</Box>
                  <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                    {caminhao.quilometragemAtual?.toLocaleString() || "Não informado"}
                  </Box>
                </Box>
              </GridItem>

              <GridItem colSpan={1}>
                <Box mb={3}>
                  <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Número de Eixos</Box>
                  <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                    {caminhao.numeroEixos || "Não informado"}
                  </Box>
                </Box>
              </GridItem>

              <GridItem colSpan={1}>
                <Box mb={3}>
                  <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Próxima Revisão</Box>
                  <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                    {caminhao.proximaRevisao || "Não informado"}
                  </Box>
                </Box>
              </GridItem>

              <GridItem colSpan={1}>
                <Box mb={3}>
                  <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Peso Total</Box>
                  <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                    {caminhao.pesoTotal || "Não informado"}
                  </Box>
                </Box>
              </GridItem>

              <GridItem colSpan={1}>
                <Box mb={3}>
                  <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Capacidade do Tanque</Box>
                  <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                    {caminhao.capacidadeTanque || "Não informado"}
                  </Box>
                </Box>
              </GridItem>   

               <GridItem colSpan={1}>
                <Box mb={3}>
                  <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Mecânico responsável</Box>
                  <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                    {caminhao.mecanico || "Não informado"}
                  </Box>
                </Box>
              </GridItem>  

              <GridItem colSpan={1}>
                <Box mb={3}>
                  <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Última troca de óle</Box>
                  <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                    {caminhao.trocaOleoData || "Não informado"}
                  </Box>
                </Box>
              </GridItem>    

               <GridItem colSpan={1}>
                <Box mb={3}>
                  <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Última manutenção</Box>
                  <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                    {caminhao.ultimaManutencao || "Não informado"}
                  </Box>
                </Box>
              </GridItem>      

              <GridItem colSpan={1}>
                <Box mb={3}>
                  <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Observações</Box>
                  <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                    {caminhao.observacoes || "Não informado"}
                  </Box>
                </Box>
              </GridItem>   

               <GridItem colSpan={2}>
                <Box mb={3}>
                  {/* <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Observações</Box> */}
                  <Box fontWeight={"bold"} textAlign={"center"} fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                    {"Documentação"}
                  </Box>
                </Box>
              </GridItem>                
            
            <Grid templateColumns="repeat(2, 1fr)" gap={2} >
               <GridItem colSpan={1}>
                <Box mb={3}>
                  <Box fontSize="12px" fontWeight="bold" color="#666666" mb={1}>CRLV</Box>
                  <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                    {caminhao.documentacao?.crlv || "Não informado"}
                  </Box>
                </Box>
              </GridItem> 
              
              <GridItem colSpan={1}>
                <Box mb={3}>
                  <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>IPVA Pago</Box>
                  <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                    {caminhao.documentacao?.ipvaPago === true ? "Sim" : caminhao.documentacao?.ipvaPago === false ? "Não" : "Não informado"}
                  </Box>
                </Box>
              </GridItem> 

              <GridItem colSpan={1}>
                <Box mb={3}>
                  <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Seguro</Box>
                  <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                    {caminhao.documentacao?.seguro || "Não informado"}
                  </Box>
                </Box>
              </GridItem> 

              <GridItem colSpan={1}>
                <Box mb={3}>
                  <Box fontSize="12px" fontWeight="600" color="#666666" mb={1}>Seguro Veicular (R$)</Box>
                  <Box fontSize="13px" color="#333333" bg="#f9f9f9" p={2} borderRadius="3px" border="1px solid #e0e0e0">
                    {caminhao.documentacao?.seguroVeicular || "Não informado"}
                  </Box>
                </Box>
              </GridItem>
            </Grid>
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
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DetalhesCaminhaoModal;
