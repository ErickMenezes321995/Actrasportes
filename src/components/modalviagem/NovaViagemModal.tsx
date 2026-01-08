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
  useDisclosure,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";

interface Cliente {
  id: number;
  nome: string;
}

interface Transacao {
  id: number;
  data: string;
  descricao: string;
  tipo: "Despesa" | "Receita";
  valor: number;
  responsavel: string;
}

interface NovaViagemInput {
  origem: string;
  destino: string;
  dataInicio: string;
  cliente: string;
  pesoCarga: string;
  valorMercadoria: string;
  cte: string;
  mdfe: string;
  nfe: string;
  pedido: string;
  observacao: string;
  transacoes: Transacao[];
}

interface NovaViagemModalProps {
  onSalvar: (novaViagem: NovaViagemInput) => void;
  triggerText?: string;
}

const NovaViagemModal: React.FC<NovaViagemModalProps> = ({
  onSalvar,
  triggerText = "Nova Viagem",
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [formData, setFormData] = useState<Omit<NovaViagemInput, "transacoes">>({
    origem: "",
    destino: "",
    dataInicio: "",
    cliente: "",
    pesoCarga: "",
    valorMercadoria: "",
    cte: "",
    mdfe: "",
    nfe: "",
    pedido: "",
    observacao: "",
  });

  useEffect(() => {
    // Buscar clientes ao abrir o modal
    if (isOpen) {
      fetch("https://gestaofrota.onrender.com/api/clientes")
        .then((res) => res.json())
        .then((data) => setClientes(data))
        .catch((err) => console.error("Erro ao buscar clientes:", err));
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Função para formatar o valor em reais (simplificada)
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
    // Converte o valor formatado de volta para número (apenas dígitos)
    const valorNumerico = formData.valorMercadoria
      ? parseFloat(formData.valorMercadoria.replace('R$', '').replace('.', '').replace(',', '.').trim())
      : 0;

    const novaViagem: NovaViagemInput = {
      ...formData,
      valorMercadoria: valorNumerico.toString(),
      transacoes: [
        {
          id: 1,
          data: "2025-06-19",
          descricao: "Prestação do caminhão",
          tipo: "Despesa",
          valor: 500,
          responsavel: "Empresa",
        },
        {
          id: 2,
          data: "2025-06-20",
          descricao: "Licenciamento",
          tipo: "Despesa",
          valor: 150,
          responsavel: "Empresa",
        },
        {
          id: 3,
          data: "2025-07-01",
          descricao: "Frete recebido",
          tipo: "Receita",
          valor: 3000,
          responsavel: formData.cliente || "Cliente",
        },
      ],
    };

    onSalvar(novaViagem);
    onClose();

    // Resetar o form
    setFormData({
      origem: "",
      destino: "",
      dataInicio: "",
      cliente: "",
      pesoCarga: "",
      valorMercadoria: "",
      cte: "",
      mdfe: "",
      nfe: "",
      pedido: "",
      observacao: "",
    });
  };

  return (
    <>
      <Button 
        onClick={onOpen} 
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
      >
        {triggerText}
      </Button>

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
            Nova Viagem
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
            <Grid templateColumns="repeat(2, 1fr)" gap={2}>
              <GridItem colSpan={2}>
                <FormControl mb={3}>
                  <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Cliente</FormLabel>
                  <Select
                    name="cliente"
                    placeholder="Selecione o cliente"
                    value={formData.cliente}
                    onChange={handleChange}
                    fontSize="13px"
                    border="1px solid #d0d0d0"
                    borderRadius="3px"
                    height="32px"
                    _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                  >
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.nome}>
                        {cliente.nome}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>

              {[
                ["origem", "Origem"],
                ["destino", "Destino"],
                ["dataInicio", "Data de Início", "date"],
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
                      value={(formData as any)[name]}
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

              {/* Campo de Valor da Mercadoria com formatação de R$ */}
              <GridItem>
                <FormControl mb={3}>
                  <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Valor da Mercadoria</FormLabel>
                  <Input
                    name="valorMercadoria"
                    value={formData.valorMercadoria}
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

              <GridItem colSpan={2}>
                <FormControl>
                  <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Observação</FormLabel>
                  <Textarea
                    name="observacao"
                    value={formData.observacao}
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
              Salvar
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
    </>
  );
};

export default NovaViagemModal;