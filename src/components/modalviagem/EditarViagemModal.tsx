import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Grid,
  GridItem,
} from "@chakra-ui/react";

interface Viagem {
  id: number;
  origem: string;
  destino: string;
  motorista: string;
  viatura: string;
  dataInicio: string;
  dataTermino: string;
  status: string;
  cliente?: string;
  pesoCarga?: string;
  valorMercadoria?: string;
  cte?: string;
  mdfe?: string;
  nfe?: string;
  pedido?: string;
  observacao?: string;
}

interface EditarViagemModalProps {
  isOpen: boolean;
  onClose: () => void;
  viagem: Viagem;
  onSalvar: (dadosEditados: Viagem) => void;
}

const EditarViagemModal: React.FC<EditarViagemModalProps> = ({
  isOpen,
  onClose,
  viagem,
  onSalvar,
}) => {
  const [formData, setFormData] = useState<Viagem>(viagem);

  useEffect(() => {
    setFormData(viagem);
  }, [viagem]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Função para formatar o valor em reais
  const formatToCurrency = (value: string): string => {
    // Remove tudo que não é número
    const onlyNumbers = value.replace(/\D/g, '');
    
    if (!onlyNumbers) return '';
    
    // Converte para número e formata como moeda brasileira
    const number = parseInt(onlyNumbers) / 100;
    return number.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Função específica para o campo de valor
  const handleValorMercadoriaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    
    // Se o campo estiver vazio, limpa o valor
    if (!value.trim()) {
      setFormData(prev => ({ ...prev, valorMercadoria: '' }));
      return;
    }
    
    // Formata o valor como moeda
    const formattedValue = formatToCurrency(value);
    setFormData(prev => ({ ...prev, valorMercadoria: formattedValue }));
  };

const handleSalvar = () => {
    onSalvar(formData);
    onClose();
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
          Editar Viagem
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
            {[
              ["origem", "Origem"],
              ["destino", "Destino"],
              ["motorista", "Motorista"],
              ["viatura", "Viatura"],
              ["cliente", "Cliente"],
              ["pesoCarga", "Peso da Carga", "number"],
              ["cte", "CT-e"],
              ["mdfe", "MDF-e"],
              ["nfe", "NF-e"],
              ["pedido", "Pedido"],
            ].map(([name, label, type = "text"]) => (
              <GridItem key={name}>
                <FormControl mb={3}>
                  <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>{label}</FormLabel>
                  <Input
                    type={type}
                    name={name}
                    value={(formData as any)[name] || ""}
                    onChange={handleChange}
                    fontSize="13px"
                    border="1px solid #d0d0d0"
                    borderRadius="3px"
                    height="32px"
                    _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                  />
                </FormControl>
              </GridItem>
            ))}

            {/* Campos de data */}
            <GridItem>
              <FormControl mb={3}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Data de Início</FormLabel>
                <Input
                  type="date"
                  name="dataInicio"
                  value={formData.dataInicio}
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
              <FormControl mb={3}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Data de Término</FormLabel>
                <Input
                  type="date"
                  name="dataTermino"
                  value={formData.dataTermino}
                  onChange={handleChange}
                  fontSize="13px"
                  border="1px solid #d0d0d0"
                  borderRadius="3px"
                  height="32px"
                  _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                />
              </FormControl>
            </GridItem>

            {/* Campo de Valor da Mercadoria com máscara de R$ */}
            <GridItem>
              <FormControl mb={3}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Valor da Mercadoria</FormLabel>
                <Input
                  name="valorMercadoria"
                  value={formData.valorMercadoria || ""}
                  onChange={handleValorMercadoriaChange}
                  placeholder="Digite o valor"
                  fontSize="13px"
                  border="1px solid #d0d0d0"
                  borderRadius="3px"
                  height="32px"
                  _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                />
              </FormControl>
            </GridItem>

            {/* Campo de Status */}
            <GridItem>
              <FormControl mb={3}>
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
                  <option value="Pendente">Agendada</option>
                  <option value="Em andamento">Em andamento</option>
                  <option value="Concluída">Concluída</option>
                  <option value="Cancelada">Cancelada</option>
                </Select>
              </FormControl>
            </GridItem>

            {/* Campo de Observação (ocupa 2 colunas) */}
            <GridItem colSpan={2}>
              <FormControl>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Observação</FormLabel>
                <Textarea
                  name="observacao"
                  value={formData.observacao || ""}
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
            bg="#e6f4e6"
            color="#2a6b2a"
            border="1px solid #9ecf9e"
            borderRadius="3px"
            fontWeight="normal"
            _hover={{ bg: "#d5e8d5" }}
            fontSize="13px"
            height="28px"
            px={4}
            mr={2}
            onClick={handleSalvar}
          >
            Salvar Alterações
          </Button>
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
            Cancelar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditarViagemModal;