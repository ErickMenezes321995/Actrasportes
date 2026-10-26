import { apiFetch } from "../../services/api";

import React, { useEffect, useState } from "react";
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
  InputGroup,
  Select,
} from "@chakra-ui/react";

export type CategoriaDespesa = "Outra" | "Abastecimento" | "Manutenção";

export interface NovaDespesaPayload {
  data: string;
  descricao: string;
  valor: number;
  responsavel: string;
  tipo: "Despesa";
  categoriaDespesa: CategoriaDespesa;
  abastecimento?: {
    caminhaoId: string;
    litros: number;
    posto: string;
    odometro: number;
    tipoCombustivel: string;
  };
  manutencao?: {
    caminhaoId: string;
    tipo: string;
    quilometragem: number;
    oficina: string;
    proximaRevisao: string;
  };
}

interface Caminhao {
  id?: string;
  _id?: string;
  placa: string;
  modelo: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (despesa: NovaDespesaPayload) => Promise<boolean>;
  viatura?: string;
  odometro?: number;
}

const ModalNovaDespesa: React.FC<Props> = ({ isOpen, onClose, onSalvar, viatura, odometro }) => {
  const toast = useToast();

  const [data, setData] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [categoriaDespesa, setCategoriaDespesa] = useState<CategoriaDespesa>("Outra");
  const [caminhoes, setCaminhoes] = useState<Caminhao[]>([]);
  const [caminhaoId, setCaminhaoId] = useState("");
  const [odometroOperacional, setOdometroOperacional] = useState(odometro ? String(odometro) : "");
  const [litros, setLitros] = useState("");
  const [posto, setPosto] = useState("");
  const [tipoCombustivel, setTipoCombustivel] = useState("Diesel S10");
  const [tipoManutencao, setTipoManutencao] = useState("Corretiva");
  const [oficina, setOficina] = useState("");
  const [proximaRevisao, setProximaRevisao] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let ativo = true;
    setCategoriaDespesa("Outra");
    setCaminhaoId("");
    setOdometroOperacional(odometro ? String(odometro) : "");
    setLitros("");
    setPosto("");
    setOficina("");
    setProximaRevisao("");

    apiFetch("/api/caminhoes", { })
      .then((resposta) => {
        if (!resposta.ok) throw new Error("Não foi possível carregar os caminhões.");
        return resposta.json();
      })
      .then((dados: Caminhao[]) => {
        if (!ativo) return;
        setCaminhoes(dados);
        const caminhaoDaViagem = dados.find(
          (caminhao) => caminhao.placa?.trim().toLowerCase() === viatura?.trim().toLowerCase()
        );
        if (caminhaoDaViagem) setCaminhaoId(caminhaoDaViagem.id || caminhaoDaViagem._id || "");
      })
      .catch(() => {
        if (ativo) {
          toast({
            title: "Erro ao carregar caminhões",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      });

    return () => {
      ativo = false;
    };
  }, [isOpen, odometro, toast, viatura]);

 const handleSalvar = async () => {
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

  const quilometragem = Number(odometroOperacional);
  const litrosNum = Number(litros.replace(",", "."));

  if (categoriaDespesa !== "Outra" && !caminhaoId) {
    toast({ title: "Selecione o caminhão.", status: "warning", duration: 3000, isClosable: true });
    return;
  }

  if (categoriaDespesa === "Abastecimento" && (!posto.trim() || litrosNum <= 0 || quilometragem <= 0)) {
    toast({ title: "Informe posto, litros e odômetro válidos.", status: "warning", duration: 3000, isClosable: true });
    return;
  }

  if (categoriaDespesa === "Manutenção" && (!oficina.trim() || !proximaRevisao || quilometragem <= 0)) {
    toast({ title: "Informe oficina, quilometragem e próxima revisão.", status: "warning", duration: 3000, isClosable: true });
    return;
  }

  const payload: NovaDespesaPayload = {
    data,
    descricao,
    valor: valorNum,
    responsavel,
    tipo: "Despesa",
    categoriaDespesa,
  };

  if (categoriaDespesa === "Abastecimento") {
    payload.abastecimento = {
      caminhaoId,
      litros: litrosNum,
      posto: posto.trim(),
      odometro: quilometragem,
      tipoCombustivel,
    };
  }

  if (categoriaDespesa === "Manutenção") {
    payload.manutencao = {
      caminhaoId,
      tipo: tipoManutencao,
      quilometragem,
      oficina: oficina.trim(),
      proximaRevisao,
    };
  }

  setIsSaving(true);
  try {
    const salvo = await onSalvar(payload);
    if (!salvo) return;

    setData("");
    setDescricao("");
    setValor("");
    setResponsavel("");
    onClose();
  } catch {
    toast({ title: "Erro ao salvar despesa.", status: "error", duration: 3000, isClosable: true });
  } finally {
    setIsSaving(false);
  }
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
              <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Tipo de despesa</FormLabel>
              <Select
                value={categoriaDespesa}
                onChange={(evento) => setCategoriaDespesa(evento.target.value as CategoriaDespesa)}
                fontSize="13px"
                border="1px solid #d0d0d0"
                borderRadius="3px"
                height="32px"
              >
                <option value="Outra">Outra despesa</option>
                <option value="Abastecimento">Abastecimento</option>
                <option value="Manutenção">Manutenção</option>
              </Select>
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

          {categoriaDespesa !== "Outra" && (
            <>
              <GridItem colSpan={2}>
                <FormControl isRequired mb={2}>
                  <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Caminhão</FormLabel>
                  <Select
                    value={caminhaoId}
                    onChange={(evento) => setCaminhaoId(evento.target.value)}
                    placeholder="Selecione o caminhão"
                    fontSize="13px"
                    border="1px solid #d0d0d0"
                    borderRadius="3px"
                    height="32px"
                  >
                    {caminhoes.map((caminhao) => {
                      const idCaminhao = caminhao.id || caminhao._id || "";
                      return (
                        <option key={idCaminhao} value={idCaminhao}>
                          {caminhao.placa} - {caminhao.modelo}
                        </option>
                      );
                    })}
                  </Select>
                </FormControl>
              </GridItem>

              <GridItem colSpan={1}>
                <FormControl isRequired mb={2}>
                  <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Odômetro (km)</FormLabel>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={odometroOperacional}
                    onChange={(evento) => setOdometroOperacional(evento.target.value)}
                    placeholder="Quilometragem atual"
                    fontSize="13px"
                    border="1px solid #d0d0d0"
                    borderRadius="3px"
                    height="32px"
                  />
                </FormControl>
              </GridItem>

              {categoriaDespesa === "Abastecimento" ? (
                <>
                  <GridItem colSpan={1}>
                    <FormControl isRequired mb={2}>
                      <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Litros</FormLabel>
                      <Input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={litros}
                        onChange={(evento) => setLitros(evento.target.value)}
                        placeholder="Quantidade abastecida"
                        fontSize="13px"
                        border="1px solid #d0d0d0"
                        borderRadius="3px"
                        height="32px"
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem colSpan={1}>
                    <FormControl isRequired mb={2}>
                      <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Posto</FormLabel>
                      <Input
                        value={posto}
                        onChange={(evento) => setPosto(evento.target.value)}
                        placeholder="Nome do posto"
                        fontSize="13px"
                        border="1px solid #d0d0d0"
                        borderRadius="3px"
                        height="32px"
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem colSpan={1}>
                    <FormControl isRequired mb={2}>
                      <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Combustível</FormLabel>
                      <Select
                        value={tipoCombustivel}
                        onChange={(evento) => setTipoCombustivel(evento.target.value)}
                        fontSize="13px"
                        border="1px solid #d0d0d0"
                        borderRadius="3px"
                        height="32px"
                      >
                        <option>Diesel S10</option>
                        <option>Diesel S500</option>
                        <option>Gasolina Comum</option>
                        <option>Gasolina Aditivada</option>
                        <option>Etanol</option>
                        <option>GNV</option>
                        <option>Outro</option>
                      </Select>
                    </FormControl>
                  </GridItem>
                  <GridItem colSpan={1}>
                    <FormControl mb={2}>
                      <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Valor por litro</FormLabel>
                      <Input
                        value={litros && Number(litros) > 0
                          ? (Number(valor.replace(/\./g, "").replace(",", ".")) / Number(litros)).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                          : "Informe litros e valor total"}
                        isReadOnly
                        fontSize="13px"
                        border="1px solid #d0d0d0"
                        borderRadius="3px"
                        height="32px"
                      />
                    </FormControl>
                  </GridItem>
                </>
              ) : (
                <>
                  <GridItem colSpan={1}>
                    <FormControl isRequired mb={2}>
                      <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Tipo de manutenção</FormLabel>
                      <Select
                        value={tipoManutencao}
                        onChange={(evento) => setTipoManutencao(evento.target.value)}
                        fontSize="13px"
                        border="1px solid #d0d0d0"
                        borderRadius="3px"
                        height="32px"
                      >
                        <option value="Preventiva">Preventiva</option>
                        <option value="Corretiva">Corretiva</option>
                        <option value="Preditiva">Preditiva</option>
                      </Select>
                    </FormControl>
                  </GridItem>
                  <GridItem colSpan={1}>
                    <FormControl isRequired mb={2}>
                      <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Oficina</FormLabel>
                      <Input
                        value={oficina}
                        onChange={(evento) => setOficina(evento.target.value)}
                        placeholder="Nome da oficina"
                        fontSize="13px"
                        border="1px solid #d0d0d0"
                        borderRadius="3px"
                        height="32px"
                      />
                    </FormControl>
                  </GridItem>
                  <GridItem colSpan={2}>
                    <FormControl isRequired mb={2}>
                      <FormLabel fontSize="12px" fontWeight="600" color="#666666" mb={1}>Próxima revisão</FormLabel>
                      <Input
                        type="date"
                        value={proximaRevisao}
                        onChange={(evento) => setProximaRevisao(evento.target.value)}
                        fontSize="13px"
                        border="1px solid #d0d0d0"
                        borderRadius="3px"
                        height="32px"
                      />
                    </FormControl>
                  </GridItem>
                </>
              )}
            </>
          )}

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
          <Button onClick={onClose} isDisabled={isSaving}
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
          onClick={handleSalvar} isLoading={isSaving}>
            Salvar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalNovaDespesa;
