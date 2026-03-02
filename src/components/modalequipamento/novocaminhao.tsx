import React, { useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  useToast,
  Grid,
  GridItem,
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
  renavam: string;
  ano: string;
  chassi: string;
  status: string;
  cor?: string;
  mecanico?: string;
  tipoCombustivel?: string;
  capacidadeTanque?: string;
  quilometragemAtual?: number;
  trocaOleoData?: string;
  ultimaManutencao?: string;
  proximaRevisao?: string;
  numeroEixos?: number;
  pesoTotal?: string;
  observacoes?: string;
  documentacao?: Documentacao;
}

interface NovoCaminhaoModalProps {
  onSalvar: (novoCaminhao: Caminhao) => void;
  isOpen: boolean;
  onClose: () => void;
}

const NovoCaminhaoModal: React.FC<NovoCaminhaoModalProps> = ({
  onSalvar,
  isOpen,
  onClose,
}) => {
  const toast = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<Omit<Caminhao, "id">>({
    placa: "",
    modelo: "",
    renavam: "",
    ano: "",
    chassi: "",
    status: "Ativo",
    cor: "",
    mecanico: "",
    tipoCombustivel: "",
    capacidadeTanque: "",
    quilometragemAtual: 0,
    trocaOleoData: "",
    ultimaManutencao: "",
    proximaRevisao: "",
    numeroEixos: 0,
    pesoTotal: "",
    observacoes: "",
    documentacao: {
      crlv: "",
      ipvaPago: undefined,
      seguro: "",
      seguroVeicular: "",
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    const numericFields = ["quilometragemAtual", "numeroEixos"];
    const parsedValue = numericFields.includes(name) ? parseFloat(value) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: parsedValue,
    }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      if (!formData.placa || !formData.modelo || !formData.ano) {
        toast({
          title: "Campos obrigatórios",
          description: "Placa, modelo e ano devem ser preenchidos.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const response = await fetch("https://backend-frotas.onrender.com/api/caminhoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error(await response.text());

      const resultado = await response.json();

      toast({
        title: "Caminhão criado",
        description: "Novo caminhão cadastrado com sucesso.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onSalvar(resultado);

      setFormData({
        placa: "",
        modelo: "",
        renavam: "",
        ano: "",
        chassi: "",
        status: "Ativo",
        cor: "",
        mecanico: "",
        tipoCombustivel: "",
        capacidadeTanque: "",
        quilometragemAtual: 0,
        trocaOleoData: "",
        ultimaManutencao: "",
        proximaRevisao: "",
        numeroEixos: 0,
        pesoTotal: "",
        observacoes: "",
        documentacao: {
          crlv: "",
          ipvaPago: undefined,
          seguro: "",
          seguroVeicular: "",
        },
      });

      onClose();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
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
          py={2} 
          px={3}
          fontSize="15px"
          fontWeight="600"
          color="#15457b"
          fontFamily="Arial, sans-serif"
        >
          Novo Caminhão
        </ModalHeader>
        <ModalCloseButton 
          color="#666666"
          _hover={{ color: "#15457b", bg: "#c5d5e6" }}
          borderRadius="3px"
          size="sm"
          mt={1}
          mr={1}
        />
        <ModalBody pb={3} px={3} pt={3} maxH="70vh" overflowY="auto">
          <Grid templateColumns="repeat(2, 1fr)" gap={2}>
            {/* Coluna 1 - Informações Básicas */}
            <GridItem colSpan={2}>
              <FormControl isRequired mb={2}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Placa</FormLabel>
                <Input 
                  name="placa" 
                  value={formData.placa} 
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
              <FormControl isRequired mb={2}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Modelo</FormLabel>
                <Input 
                  name="modelo" 
                  value={formData.modelo} 
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
              <FormControl isRequired mb={2}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Ano</FormLabel>
                <Input 
                  name="ano" 
                  value={formData.ano} 
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
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Cor</FormLabel>
                <Input 
                  name="cor" 
                  value={formData.cor} 
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
              <FormControl isRequired mb={2}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>RENAVAM</FormLabel>
                <Input 
                  name="renavam" 
                  value={formData.renavam} 
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
              <FormControl isRequired mb={2}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Chassi</FormLabel>
                <Input 
                  name="chassi" 
                  value={formData.chassi} 
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
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Mecânico</FormLabel>
                <Input 
                  name="mecanico" 
                  value={formData.mecanico} 
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
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Tipo de Combustível</FormLabel>
                <Input
                  name="tipoCombustivel"
                  value={formData.tipoCombustivel}
                  onChange={handleChange}
                  fontSize="13px"
                  border="1px solid #d0d0d0"
                  borderRadius="3px"
                  height="30px"
                  _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                />
              </FormControl>
            </GridItem>

            {/* Coluna 2 - Informações Técnicas */}
            <GridItem>
              <FormControl mb={2}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Capacidade do Tanque</FormLabel>
                <Input
                  name="capacidadeTanque"
                  value={formData.capacidadeTanque}
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
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Quilometragem Atual</FormLabel>
                <Input
                  name="quilometragemAtual"
                  type="number"
                  value={formData.quilometragemAtual}
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
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Número de Eixos</FormLabel>
                <Input
                  name="numeroEixos"
                  type="number"
                  value={formData.numeroEixos}
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
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Peso Total</FormLabel>
                <Input 
                  name="pesoTotal" 
                  value={formData.pesoTotal} 
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
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Última Troca de Óleo</FormLabel>
                <Input 
                  name="trocaOleoData" 
                  value={formData.trocaOleoData} 
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
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Última Manutenção</FormLabel>
                <Input
                  name="ultimaManutencao"
                  value={formData.ultimaManutencao}
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
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Próxima Revisão</FormLabel>
                <Input
                  name="proximaRevisao"
                  value={formData.proximaRevisao}
                  onChange={handleChange}
                  fontSize="13px"
                  border="1px solid #d0d0d0"
                  borderRadius="3px"
                  height="30px"
                  _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                />
              </FormControl>
            </GridItem>

            {/* Documentação */}
            <GridItem>
              <FormControl mb={2}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>CRLV</FormLabel>
                <Input
                  name="crlv"
                  value={formData.documentacao?.crlv || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      documentacao: {
                        ...prev.documentacao,
                        crlv: e.target.value,
                      },
                    }))
                  }
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
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Seguro</FormLabel>
                <Input
                  name="seguro"
                  value={formData.documentacao?.seguro || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      documentacao: {
                        ...prev.documentacao,
                        seguro: e.target.value,
                      },
                    }))
                  }
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
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Seguro Veicular</FormLabel>
                <Input
                  name="seguroVeicular"
                  value={formData.documentacao?.seguroVeicular || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      documentacao: {
                        ...prev.documentacao,
                        seguroVeicular: e.target.value,
                      },
                    }))
                  }
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
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>IPVA Pago</FormLabel>
                <Select
                  name="ipvaPago"
                  value={
                    formData.documentacao?.ipvaPago === true
                      ? "true"
                      : formData.documentacao?.ipvaPago === false
                      ? "false"
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value === "true";
                    setFormData((prev) => ({
                      ...prev,
                      documentacao: {
                        ...prev.documentacao,
                        ipvaPago: value,
                      },
                    }));
                  }}
                  fontSize="13px"
                  border="1px solid #d0d0d0"
                  borderRadius="3px"
                  height="30px"
                  _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                >
                  <option value="">Selecione</option>
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </Select>
              </FormControl>
            </GridItem>

            <GridItem colSpan={2}>
              <FormControl mb={2}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Observações</FormLabel>
                <Input 
                  name="observacoes" 
                  value={formData.observacoes} 
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
              <FormControl isRequired mb={2}>
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

export default NovoCaminhaoModal;