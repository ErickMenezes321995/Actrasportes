import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Card,
  CardBody,
  CardHeader,
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  Button,
  Text,
  Box,
  useToast,
  Spinner,
  Center,
  Flex,
  Heading,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  HStack,
  IconButton,
  Tooltip,
  useColorModeValue,
  Select,
} from "@chakra-ui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import React, { useEffect, useState, useCallback } from "react";
import { DownloadIcon, RepeatIcon } from "@chakra-ui/icons";

interface Caminhao {
  id: string;
  placa: string;
  modelo: string;
}

interface Abastecimento {
  id: string;
  caminhaoId: string | any; // Pode ser string ou objeto
  data: string;
  litros: number;
  valorLitro: number;
  valorTotal: number;
  posto: string;
  odometro: number;
  tipoCombustivel: string;
  observacoes?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  abastecimentos: Abastecimento[];
  caminhoes: Caminhao[];
}

interface ConsumoMedio {
  caminhaoId: string;
  placa: string;
  modelo: string;
  totalLitros: number;
  kmRodados: number;
  consumoMedio: number;
  custoTotal: number;
  custoPorKm: number; // NOVO: custo por km rodado
  economiaPrevista?: number; // NOVO: economia em relação a uma média esperada
}

const ModalDashboardAbastecimentoAnalitico: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  abastecimentos,
  caminhoes 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [dadosConsumo, setDadosConsumo] = useState<ConsumoMedio[]>([]);
  const [periodoFiltro, setPeriodoFiltro] = useState<string>("todos");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [abastecimentosFiltrados, setAbastecimentosFiltrados] = useState<Abastecimento[]>(abastecimentos);
  const toast = useToast();
  
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");

  // Função para extrair o ID do caminhão (pode ser string, objeto ou null) - CORRIGIDA
  const extrairCaminhaoId = (caminhaoId: string | any): string => {
    if (!caminhaoId) return ''; // Proteção contra null/undefined
    
    if (typeof caminhaoId === 'object') {
      return caminhaoId?.id || caminhaoId?._id || ''; // Uso de optional chaining
    }
    
    return caminhaoId;
  };

  // Aplicar filtros
  useEffect(() => {
    let resultado = [...abastecimentos];
    
    // Filtro por período
    if (periodoFiltro !== "todos") {
      const hoje = new Date();
      const mesesAtras = new Date();
      mesesAtras.setMonth(hoje.getMonth() - parseInt(periodoFiltro));
      
      resultado = resultado.filter(a => {
        const dataAbastecimento = new Date(a.data);
        return dataAbastecimento >= mesesAtras;
      });
    }
    
    // Filtro por tipo
    if (tipoFiltro !== "todos") {
      resultado = resultado.filter(a => a.tipoCombustivel === tipoFiltro);
    }
    
    setAbastecimentosFiltrados(resultado);
  }, [periodoFiltro, tipoFiltro, abastecimentos]);

  // Processar dados para o dashboard - ATUALIZADA com custo por km
  const processarDadosDashboard = useCallback(() => {
    try {
      setIsLoading(true);

      // Filtrar abastecimentos com caminhaoId válido
      const abastecimentosValidos = abastecimentosFiltrados.filter(abastecimento => {
        const caminhaoId = extrairCaminhaoId(abastecimento.caminhaoId);
        return caminhaoId !== ''; // Remove abastecimentos sem caminhão válido
      });

      // Calcular consumo médio por caminhão
      const consumoPorCaminhao: ConsumoMedio[] = [];
      
      caminhoes.forEach(caminhao => {
        const abastecimentosCaminhao = abastecimentosValidos
          .filter(a => extrairCaminhaoId(a.caminhaoId) === caminhao.id)
          .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

        if (abastecimentosCaminhao.length > 1) {
          const primeiroAbastecimento = abastecimentosCaminhao[0];
          const ultimoAbastecimento = abastecimentosCaminhao[abastecimentosCaminhao.length - 1];
          
          const kmRodados = ultimoAbastecimento.odometro - primeiroAbastecimento.odometro;
          const totalLitros = abastecimentosCaminhao.reduce((sum, a) => sum + a.litros, 0) - primeiroAbastecimento.litros;
          const custoTotal = abastecimentosCaminhao.reduce((sum, a) => sum + a.valorTotal, 0);
          
          if (kmRodados > 0 && totalLitros > 0) {
            const consumoMedio = kmRodados / totalLitros;
            const custoPorKm = custoTotal / kmRodados;
            
            // Adicionar cálculo de economia (opcional)
            const consumoEsperado = 3.5; // 3.5 km/L como meta de referência
            const economiaPrevista = consumoMedio > consumoEsperado ? 
              ((consumoMedio - consumoEsperado) / consumoEsperado) * 100 : 0;
            
            consumoPorCaminhao.push({
              caminhaoId: caminhao.id,
              placa: caminhao.placa,
              modelo: caminhao.modelo,
              totalLitros,
              kmRodados,
              consumoMedio: parseFloat(consumoMedio.toFixed(2)),
              custoTotal,
              custoPorKm: parseFloat(custoPorKm.toFixed(3)),
              economiaPrevista: parseFloat(economiaPrevista.toFixed(1))
            });
          }
        }
      });

      setDadosConsumo(consumoPorCaminhao.sort((a, b) => b.totalLitros - a.totalLitros));
      setIsLoading(false);

    } catch (error) {
      console.error("Erro ao processar dados do dashboard:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar os dados do dashboard.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  }, [abastecimentosFiltrados, caminhoes, toast]);

  useEffect(() => {
    if (isOpen && abastecimentosFiltrados.length > 0) {
      processarDadosDashboard();
    } else if (isOpen) {
      setIsLoading(false);
    }
  }, [isOpen, abastecimentosFiltrados, processarDadosDashboard]);

  const getCorCombustivel = (tipo: string): string => {
    const cores: { [key: string]: string } = {
      "Diesel S10": "#3182CE",
      "Diesel S500": "#4299E1",
      "Diesel Comum": "#63B3ED",
      "Gasolina Comum": "#38A169",
      "Gasolina Aditivada": "#48BB78",
      "Etanol": "#F6AD55",
      "GNV": "#F56565",
      "Outro": "#A0AEC0"
    };
    
    return cores[tipo] || "#718096";
  };

  // Dados calculados
  const totalLitros = abastecimentosFiltrados.reduce((sum, a) => sum + a.litros, 0);
  
  // Corrigido: usando Array.from para evitar o erro de iteracao do Set
  const mesesUnicos = Array.from(new Set(abastecimentosFiltrados.map(a => a.data.substring(0, 7)))).length;
  const mediaMensal = mesesUnicos > 0 ? Math.round(totalLitros / mesesUnicos) : 0;
  const custoTotal = abastecimentosFiltrados.reduce((sum, a) => sum + a.valorTotal, 0);
  
  // Novas métricas agregadas
  const totalKmRodados = dadosConsumo.reduce((sum, item) => sum + item.kmRodados, 0);
  const consumoMedioFrota = dadosConsumo.length > 0 ? 
    (dadosConsumo.reduce((sum, item) => sum + item.consumoMedio, 0) / dadosConsumo.length) : 0;
  const custoMedioPorKmFrota = dadosConsumo.length > 0 ? 
    (dadosConsumo.reduce((sum, item) => sum + item.custoPorKm, 0) / dadosConsumo.length) : 0;

  // Agrupar por mês para gráfico
  const abastecimentosPorMes = abastecimentosFiltrados.reduce((acc, abastecimento) => {
    const mesAno = new Date(abastecimento.data).toLocaleDateString('pt-BR', { 
      month: 'short',
      year: 'numeric'
    });
    const existing = acc.find(item => item.mes === mesAno);
    
    if (existing) {
      existing.litros += abastecimento.litros;
    } else {
      acc.push({ mes: mesAno, litros: abastecimento.litros });
    }
    
    return acc;
  }, [] as { mes: string; litros: number }[]);

  // Tipos de combustível
  const tiposCombustivel = abastecimentosFiltrados.reduce((acc, abastecimento) => {
    const existing = acc.find(item => item.tipo === abastecimento.tipoCombustivel);
    
    if (existing) {
      existing.quantidade += abastecimento.litros;
    } else {
      acc.push({ 
        tipo: abastecimento.tipoCombustivel, 
        quantidade: abastecimento.litros,
        cor: getCorCombustivel(abastecimento.tipoCombustivel)
      });
    }
    
    return acc;
  }, [] as { tipo: string; quantidade: number; cor: string }[]);

  // Obter tipos únicos de combustível para o filtro
  const tiposCombustivelUnicos = Array.from(new Set(abastecimentosFiltrados.map(a => a.tipoCombustivel)));

  const handleRefreshData = () => {
    processarDadosDashboard();
    toast({
      title: "Dados atualizados",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleExportData = () => {
    toast({
      title: "Exportando dados",
      description: "Preparando relatório para download...",
      status: "info",
      duration: 2000,
      isClosable: true,
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box bg="white" p={3} borderRadius="md" boxShadow="md" borderWidth="1px">
          <Text fontWeight="bold">{label}</Text>
          <Text color={payload[0].color}>
            Litros: {payload[0].value.toLocaleString('pt-BR')} L
          </Text>
        </Box>
      );
    }
    return null;
  };

  const CustomTooltipCustoKm = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box bg="white" p={3} borderRadius="md" boxShadow="md" borderWidth="1px">
          <Text fontWeight="bold">{label}</Text>
          <Text color={payload[0].color}>
            Custo/km: {payload[0].value.toLocaleString('pt-BR', { 
              style: 'currency', 
              currency: 'BRL',
              minimumFractionDigits: 3
            })}
          </Text>
        </Box>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">Dashboard Analítico</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Center py={10}>
              <Flex direction="column" align="center">
                <Spinner size="xl" thickness="4px" color="blue.500" mb={4} />
                <Text color="gray.500">Processando dados...</Text>
              </Flex>
            </Center>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxHeight="85vh">
        <ModalHeader textAlign="center" pb={2}>
          <Heading size="md">Dashboard de Abastecimento</Heading>
          <HStack spacing={3} mt={2} justify="center">
            <Box>
              <Text fontSize="xs" fontWeight="medium" mb={1}>Período:</Text>
              <Select
                size="xs"
                value={periodoFiltro}
                onChange={(e) => setPeriodoFiltro(e.target.value)}
                width="110px"
              >
                <option value="todos">Todos</option>
                <option value="3">3 meses</option>
                <option value="6">6 meses</option>
                <option value="12">1 ano</option>
              </Select>
            </Box>
            
            <Box>
              <Text fontSize="xs" fontWeight="medium" mb={1}>Combustível:</Text>
              <Select
                size="xs"
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
                width="110px"
              >
                <option value="todos">Todos</option>
                {tiposCombustivelUnicos.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </Select>
            </Box>
            
            <Tooltip label="Atualizar dados">
              <IconButton
                aria-label="Atualizar dados"
                icon={<RepeatIcon />}
                onClick={handleRefreshData}
                variant="outline"
                size="sm"
                alignSelf="flex-end"
                mb={1}
              />
            </Tooltip>
          </HStack>
        </ModalHeader>
        
        <ModalCloseButton />
        
        <ModalBody pb={4}>
          {abastecimentosFiltrados.length === 0 ? (
            <Center py={5} flexDirection="column">
              <Text color="gray.500" fontSize="md" mb={2}>Nenhum dado encontrado</Text>
              <Text color="gray.400" fontSize="sm">Ajuste os filtros para ver resultados</Text>
            </Center>
          ) : (
            <Tabs colorScheme="blue" isLazy size="sm">
              <TabList mb={3} justifyContent="center">
                <Tab fontSize="sm">Visão Geral</Tab>
                <Tab fontSize="sm">Análise</Tab>
                <Tab fontSize="sm">Detalhes</Tab>
              </TabList>

              <TabPanels>
                {/* Painel: Visão Geral */}
                <TabPanel px={2}>
                  <SimpleGrid columns={3} spacing={3} mb={4}>
                    <Card bg={cardBg} border="1px" borderColor={borderColor} size="sm">
                      <CardBody py={3}>
                        <Stat>
                          <StatLabel fontSize="xs">Total Litros</StatLabel>
                          <StatNumber fontSize="lg">{totalLitros.toLocaleString('pt-BR')} L</StatNumber>
                          <Text fontSize="xs" color={textColor}>
                            {mediaMensal.toLocaleString('pt-BR')} L/mês
                          </Text>
                        </Stat>
                      </CardBody>
                    </Card>
                    
                    <Card bg={cardBg} border="1px" borderColor={borderColor} size="sm">
                      <CardBody py={3}>
                        <Stat>
                          <StatLabel fontSize="xs">Total Km Rodados</StatLabel>
                          <StatNumber fontSize="lg">
                            {totalKmRodados.toLocaleString('pt-BR')} km
                          </StatNumber>
                          <Text fontSize="xs" color={textColor}>
                            {dadosConsumo.length} caminhões
                          </Text>
                        </Stat>
                      </CardBody>
                    </Card>
                    
                    <Card bg={cardBg} border="1px" borderColor={borderColor} size="sm">
                      <CardBody py={3}>
                        <Stat>
                          <StatLabel fontSize="xs">Custo Total</StatLabel>
                          <StatNumber fontSize="lg">
                            {custoTotal.toLocaleString('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL',
                              minimumFractionDigits: 0
                            })}
                          </StatNumber>
                          <Text fontSize="xs" color={textColor}>
                            {abastecimentosFiltrados.length} abastecimentos
                          </Text>
                        </Stat>
                      </CardBody>
                    </Card>
                  </SimpleGrid>

                  <SimpleGrid columns={2} spacing={3} mb={4}>
                    <Card bg={cardBg} border="1px" borderColor={borderColor} size="sm">
                      <CardBody py={3}>
                        <Stat>
                          <StatLabel fontSize="xs">Consumo Médio Frota</StatLabel>
                          <StatNumber fontSize="lg">
                            {consumoMedioFrota.toFixed(2)} km/L
                          </StatNumber>
                          <Text fontSize="xs" color={textColor}>
                            Meta: 3.5 km/L
                          </Text>
                        </Stat>
                      </CardBody>
                    </Card>
                    
                    <Card bg={cardBg} border="1px" borderColor={borderColor} size="sm">
                      <CardBody py={3}>
                        <Stat>
                          <StatLabel fontSize="xs">Custo Médio/km</StatLabel>
                          <StatNumber fontSize="lg">
                            {custoMedioPorKmFrota.toLocaleString('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL',
                              minimumFractionDigits: 3
                            })}
                          </StatNumber>
                          <Text fontSize="xs" color={textColor}>
                            Por km rodado
                          </Text>
                        </Stat>
                      </CardBody>
                    </Card>
                  </SimpleGrid>

                  <Card bg={cardBg} border="1px" borderColor={borderColor} mb={4}>
                    <CardHeader fontWeight="bold" py={2} fontSize="sm">Litros por Mês</CardHeader>
                    <CardBody py={2}>
                      <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={abastecimentosPorMes}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="mes" fontSize={10} />
                          <YAxis allowDecimals={false} fontSize={10} />
                          <RechartsTooltip content={<CustomTooltip />} />
                          <Bar 
                            dataKey="litros" 
                            fill="#3182CE" 
                            radius={[2, 2, 0, 0]} 
                            name="litros"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardBody>
                  </Card>

                  <SimpleGrid columns={2} spacing={3}>
                    <Card bg={cardBg} border="1px" borderColor={borderColor}>
                      <CardHeader fontWeight="bold" py={2} fontSize="sm">Tipos de Combustível</CardHeader>
                      <CardBody py={2}>
                        {tiposCombustivel.slice(0, 4).map(tipo => (
                          <Flex key={tipo.tipo} justify="space-between" mb={1}>
                            <Text fontSize="xs">{tipo.tipo}</Text>
                            <Badge fontSize="xs">{tipo.quantidade.toLocaleString('pt-BR')} L</Badge>
                          </Flex>
                        ))}
                      </CardBody>
                    </Card>

                    <Card bg={cardBg} border="1px" borderColor={borderColor}>
                      <CardHeader fontWeight="bold" py={2} fontSize="sm">Top Caminhões (Km)</CardHeader>
                      <CardBody py={2}>
                        {dadosConsumo.slice(0, 3).map(caminhao => (
                          <Flex key={caminhao.caminhaoId} justify="space-between" mb={1}>
                            <Text fontSize="xs">{caminhao.placa}</Text>
                            <Badge fontSize="xs">{caminhao.kmRodados.toLocaleString('pt-BR')} km</Badge>
                          </Flex>
                        ))}
                      </CardBody>
                    </Card>
                  </SimpleGrid>
                </TabPanel>
                
                {/* Painel: Análise */}
                <TabPanel px={2}>
                  <Card bg={cardBg} border="1px" borderColor={borderColor} mb={4}>
                    <CardHeader fontWeight="bold" py={2} fontSize="sm">Tipos de Combustível</CardHeader>
                    <CardBody py={2}>
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie
                            data={tiposCombustivel}
                            dataKey="quantidade"
                            nameKey="tipo"
                            outerRadius={60}
                            label={({ quantidade }) => `${quantidade.toLocaleString('pt-BR')}L`}
                          >
                            {tiposCombustivel.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.cor} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value: number) => [`${value.toLocaleString('pt-BR')} L`, 'Litros']}
                          />
                          <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardBody>
                  </Card>

                  <Card bg={cardBg} border="1px" borderColor={borderColor} mb={4}>
                    <CardHeader fontWeight="bold" py={2} fontSize="sm">Custo por Km por Caminhão</CardHeader>
                    <CardBody py={2}>
                      <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={dadosConsumo.slice(0, 5)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="placa" fontSize={10} />
                          <YAxis 
                            fontSize={10}
                            tickFormatter={(value) => `R$${value.toFixed(3)}`}
                          />
                          <RechartsTooltip content={<CustomTooltipCustoKm />} />
                          <Bar 
                            dataKey="custoPorKm" 
                            fill="#38A169" 
                            radius={[2, 2, 0, 0]} 
                            name="Custo por Km"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardBody>
                  </Card>

                  {dadosConsumo.length > 0 && (
                    <Card bg={cardBg} border="1px" borderColor={borderColor}>
                      <CardHeader fontWeight="bold" py={2} fontSize="sm">Consumo por Caminhão</CardHeader>
                      <CardBody py={2}>
                        <Table size="sm" variant="simple">
                          <Thead>
                            <Tr>
                              <Th fontSize="xs" px={2} py={1}>Caminhão</Th>
                              <Th fontSize="xs" px={2} py={1} isNumeric>Km Rodados</Th>
                              <Th fontSize="xs" px={2} py={1} isNumeric>Consumo</Th>
                              <Th fontSize="xs" px={2} py={1} isNumeric>Custo/Km</Th>
                              <Th fontSize="xs" px={2} py={1} isNumeric>Economia</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {dadosConsumo.slice(0, 5).map((item) => (
                              <Tr key={item.caminhaoId}>
                                <Td fontSize="xs" px={2} py={1}>
                                  <Box>
                                    <Text fontWeight="medium">{item.placa}</Text>
                                    <Text fontSize="xs" color="gray.500">{item.modelo}</Text>
                                  </Box>
                                </Td>
                                <Td fontSize="xs" px={2} py={1} isNumeric>
                                  {item.kmRodados.toLocaleString('pt-BR')} km
                                </Td>
                                <Td fontSize="xs" px={2} py={1} isNumeric>
                                  <Badge 
                                    colorScheme={
                                      item.consumoMedio > 2.5 ? "green" : 
                                      item.consumoMedio > 2 ? "yellow" : "red"
                                    }
                                    fontSize="xs"
                                  >
                                    {item.consumoMedio.toFixed(2)} km/L
                                  </Badge>
                                </Td>
                                <Td fontSize="xs" px={2} py={1} isNumeric>
                                  {item.custoPorKm.toLocaleString('pt-BR', { 
                                    style: 'currency', 
                                    currency: 'BRL',
                                    minimumFractionDigits: 3
                                  })}
                                </Td>
                                <Td fontSize="xs" px={2} py={1} isNumeric>
                                  {item.economiaPrevista ? (
                                    <Badge 
                                      colorScheme={item.economiaPrevista > 0 ? "green" : "red"}
                                      fontSize="xs"
                                    >
                                      {item.economiaPrevista > 0 ? '+' : ''}{item.economiaPrevista}%
                                    </Badge>
                                  ) : (
                                    <Text fontSize="xs">N/A</Text>
                                  )}
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </CardBody>
                    </Card>
                  )}
                </TabPanel>
                
                {/* Painel: Detalhes */}
                <TabPanel px={2}>
                  <Card bg={cardBg} border="1px" borderColor={borderColor}>
                    <CardHeader fontWeight="bold" py={2} fontSize="sm">Últimos Abastecimentos</CardHeader>
                    <CardBody py={2}>
                      <Table size="sm" variant="simple">
                        <Thead>
                          <Tr>
                            <Th fontSize="xs" px={2} py={1}>Data</Th>
                            <Th fontSize="xs" px={2} py={1}>Caminhão</Th>
                            <Th fontSize="xs" px={2} py={1}>Combustível</Th>
                            <Th fontSize="xs" px={2} py={1} isNumeric>Litros</Th>
                            <Th fontSize="xs" px={2} py={1} isNumeric>Valor</Th>
                            <Th fontSize="xs" px={2} py={1} isNumeric>Odômetro</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {abastecimentosFiltrados.slice(0, 5).map((abastecimento) => {
                            const caminhaoId = extrairCaminhaoId(abastecimento.caminhaoId);
                            const caminhao = caminhoes.find(c => c.id === caminhaoId);
                            
                            return (
                              <Tr key={abastecimento.id}>
                                <Td fontSize="xs" px={2} py={1}>
                                  {new Date(abastecimento.data).toLocaleDateString('pt-BR')}
                                </Td>
                                <Td fontSize="xs" px={2} py={1}>
                                  {caminhao ? caminhao.placa : 'N/A'}
                                </Td>
                                <Td fontSize="xs" px={2} py={1}>
                                  <Badge fontSize="xs" colorScheme={
                                    abastecimento.tipoCombustivel.includes("Diesel") ? "blue" :
                                    abastecimento.tipoCombustivel.includes("Gasolina") ? "green" : 
                                    abastecimento.tipoCombustivel.includes("Etanol") ? "orange" : "gray"
                                  }>
                                    {abastecimento.tipoCombustivel}
                                  </Badge>
                                </Td>
                                <Td fontSize="xs" px={2} py={1} isNumeric>
                                  {abastecimento.litros.toLocaleString('pt-BR')} L
                                </Td>
                                <Td fontSize="xs" px={2} py={1} isNumeric>
                                  {abastecimento.valorTotal.toLocaleString('pt-BR', { 
                                    style: 'currency', 
                                    currency: 'BRL',
                                    minimumFractionDigits: 0
                                  })}
                                </Td>
                                <Td fontSize="xs" px={2} py={1} isNumeric>
                                  {abastecimento.odometro.toLocaleString('pt-BR')} km
                                </Td>
                              </Tr>
                            );
                          })}
                        </Tbody>
                      </Table>
                    </CardBody>
                  </Card>
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </ModalBody>

        <ModalFooter pt={2}>
          <Button size="sm" variant="outline" mr={3} onClick={onClose}>
            Fechar
          </Button>
          <Button size="sm" colorScheme="blue" onClick={handleExportData} leftIcon={<DownloadIcon />}>
            Exportar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalDashboardAbastecimentoAnalitico;