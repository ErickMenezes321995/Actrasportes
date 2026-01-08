import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Select,
  Input,
  VStack,
  useToast,
  Grid,
  GridItem,
} from "@chakra-ui/react";

interface Equipamento {
  id: number;
  placa: string;
  modelo: string;
}

interface SelecionarMotoristaEquipamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (motorista: string, viatura: string, dataInicio: string, odometro: number) => void;
  motoristaAtual?: string;
  viaturaAtual?: string;
  dataInicioAtual?: string;
  odometroAtual?: number;
}

const SelecionarMotoristaEquipamentoModal: React.FC<SelecionarMotoristaEquipamentoModalProps> = ({
  isOpen,
  onClose,
  onSalvar,
  motoristaAtual = "",
  viaturaAtual = "",
  dataInicioAtual = "",
  odometroAtual = 0,
}) => {
  const [motorista, setMotorista] = useState(motoristaAtual);
  const [viatura, setViatura] = useState(viaturaAtual);
  const [dataInicio, setDataInicio] = useState(dataInicioAtual);
  const [odometro, setOdometro] = useState(odometroAtual);

  const [listaMotoristas, setListaMotoristas] = useState<{id:number; nome:string}[]>([]);
  const [listaEquipamentos, setListaEquipamentos] = useState<Equipamento[]>([]);
  const toast = useToast();

  useEffect(() => {
    if (!isOpen) return;

     fetch("https://gestaofrota.onrender.com/api/motoristas")
      .then((res) => res.json())
      .then((data) => setListaMotoristas(data))
      .catch(() =>
        toast({
          title: "Erro ao carregar motoristas",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      );

   fetch("https://gestaofrota.onrender.com/api/caminhoes")
  .then(res => res.json())
  .then(data => setListaEquipamentos(data))
  .catch(() => {
    toast({
      title: "Erro ao carregar equipamentos",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  });

  }, [isOpen, toast]);

  const handleSalvar = () => {
  if (!podeSalvar) return;

 const equipamentoSelecionado = listaEquipamentos.find(
  (eq) => eq.placa?.toUpperCase().trim() === viatura?.toUpperCase().trim()
);

  if (!equipamentoSelecionado) {
    toast({
      title: "Equipamento não encontrado",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  fetch(`https://gestaofrota.onrender.com/api/caminhoes/${equipamentoSelecionado.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ quilometragemAtual: odometro }),
  })
    .then((res) => {
      if (!res.ok) throw new Error("Erro ao atualizar quilometragem");
      return res.json();
    })
    .then(() => {
      toast({
        title: "Quilometragem atualizada com sucesso",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onSalvar(motorista, viatura, dataInicio, odometro);

      onClose();
    })
    .catch(() => {
      toast({
        title: "Erro ao atualizar quilometragem",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    });
};

  const podeSalvar =
    motorista.trim() !== "" &&
    viatura.trim() !== "" &&
    dataInicio.trim() !== "" &&
    odometro > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
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
          Iniciar Viagem
        </ModalHeader>
        <ModalCloseButton 
          color="#666666"
          _hover={{ color: "#15457b", bg: "#c5d5e6" }}
          borderRadius="3px"
          size="sm"
          mt={1}
          mr={1}
        />
        <ModalBody pb={4} px={4} pt={4}>
          <Grid templateColumns="repeat(2, 1fr)" gap={3}>
            <GridItem colSpan={2}>
              <FormControl isRequired mb={3}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Motorista</FormLabel>
                <Select
                  placeholder="Selecione um motorista"
                  value={motorista}
                  onChange={(e) => setMotorista(e.target.value)}
                  fontSize="13px"
                  border="1px solid #d0d0d0"
                  borderRadius="3px"
                  height="32px"
                  _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                >
                  {listaMotoristas.map((m) => (
                    <option key={m.id} value={m.nome}>
                      {m.nome}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </GridItem>

            <GridItem colSpan={2}>
              <FormControl isRequired mb={3}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Equipamento (Viatura)</FormLabel>
                <Select
                  placeholder="Selecione um equipamento"
                  value={viatura}
                  onChange={(e) => setViatura(e.target.value)}
                  fontSize="13px"
                  border="1px solid #d0d0d0"
                  borderRadius="3px"
                  height="32px"
                  _focus={{ borderColor: "#a3bde3", boxShadow: "0 0 0 1px #a3bde3" }}
                >
                  {listaEquipamentos.map((eq) => (
                    <option key={eq.id} value={eq.placa}>
                      {eq.placa} - {eq.modelo}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </GridItem>

            <GridItem colSpan={2}>
              <FormControl isRequired mb={3}>
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Data e Hora do Início</FormLabel>
                <Input
                  type="datetime-local"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
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
                <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Odômetro Atual (km)</FormLabel>
                <Input
                  type="number"
                  min={0}
                  value={odometro}
                  onChange={(e) => setOdometro(Number(e.target.value))}
                  placeholder="Informe o odômetro atual"
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
            onClick={handleSalvar}
            disabled={!podeSalvar}
            _disabled={{
              bg: "#f0f0f0",
              color: "#999999",
              borderColor: "#d0d0d0",
              cursor: "not-allowed"
            }}
          >
            Salvar e Iniciar Viagem
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SelecionarMotoristaEquipamentoModal;