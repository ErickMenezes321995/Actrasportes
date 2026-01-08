import React, { useEffect, useState } from "react";
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
  Box,
  Text,
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  Button,
  useColorModeValue,
  Heading,
  Flex,
  Badge,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  IconButton,
  Tooltip,
  Select,
  Center,
  Spinner,
  useToast,
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
import { DownloadIcon, RepeatIcon } from "@chakra-ui/icons";

interface OleoData {
  id: string;
  caminhaoId: string | any;
  placa: string;
  tipoOleo: string;
  dataTroca: string;
  kmAtual: number;
  proximaTrocaKm: number;
  status: string;
}

interface CaminhaoData {
  id: string;
  placa: string;
  modelo: string;
  ano: string;
  status: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  trocasOleo: OleoData[];
  caminhoes: CaminhaoData[];
}

const COLORS = ['#3182CE', '#38B2AC', '#805AD5', '#D69E2E', '#E53E3E', '#DD6B20'];

const ModalDashboardTrocaOleoAnalitico: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  trocasOleo,
  caminhoes 
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const [isLoading, setIsLoading] = useState(true);
  const [periodoFiltro, setPeriodoFiltro] = useState<string>("todos");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [trocasFiltradas, setTrocasFiltradas] = useState<OleoData[]>(trocasOleo);
  const toast = useToast();

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
    let resultado = [...trocasOleo];
    
    // Filtro por período
    if (periodoFiltro !== "todos") {
      const hoje = new Date();
      const mesesAtras = new Date();
      mesesAtras.setMonth(hoje.getMonth() - parseInt(periodoFiltro));
      
      resultado = resultado.filter(t => {
        const dataTroca = new Date(t.dataTroca);
        return dataTroca >= mesesAtras;
      });
    }
    
    // Filtro por tipo
    if (tipoFiltro !== "todos") {
      resultado = resultado.filter(t => t.tipoOleo === tipoFiltro);
    }
    
    setTrocasFiltradas(resultado);
  }, [periodoFiltro, tipoFiltro, trocasOleo]);

  // Processar dados para o dashboard
  useEffect(() => {
    if (isOpen && trocasFiltradas.length > 0) {
      setIsLoading(false);
    } else if (isOpen) {
      setIsLoading(false);
    }
  }, [isOpen, trocasFiltradas]);

  const handleRefreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Dados atualizados",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }, 500);
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

  // Processar dados para as estatísticas - CORRIGIDA
  const processData = () => {
    // Filtrar trocas com caminhaoId válido
    const trocasValidas = trocasFiltradas.filter(troca => {
      const caminhaoId = extrairCaminhaoId(troca.caminhaoId);
      return caminhaoId !== ''; // Remove trocas sem caminhão válido
    });

    // 1. Trocas por mês
    const trocasPorMes = trocasValidas.reduce((acc, troca) => {
      const mesAno = new Date(troca.dataTroca).toLocaleDateString('pt-BR', { 
        month: 'short',
        year: 'numeric'
      });
      const existing = acc.find(item => item.mes === mesAno);
      
      if (existing) {
        existing.trocas += 1;
      } else {
        acc.push({ mes: mesAno, trocas: 1 });
      }
      
      return acc;
    }, [] as { mes: string; trocas: number }[]);

    // 2. Tipos de óleo mais usados
    const tiposOleo = trocasValidas.reduce((acc, troca) => {
      const existing = acc.find(item => item.nome === troca.tipoOleo);
      
      if (existing) {
        existing.quantidade += 1;
      } else {
        acc.push({ 
          nome: troca.tipoOleo, 
          quantidade: 1,
          cor: COLORS[acc.length % COLORS.length]
        });
      }
      
      return acc;
    }, [] as { nome: string; quantidade: number; cor: string }[]);

    // 3. Caminhões com mais trocas - CORRIGIDA com proteção
    const trocasPorCaminhao = trocasValidas.reduce((acc, troca) => {
      const caminhaoId = extrairCaminhaoId(troca.caminhaoId);
      
      // Pular itens sem caminhaoId válido (proteção adicional)
      if (!caminhaoId) return acc;
      
      const existing = acc.find(item => item.caminhaoId === caminhaoId);
      
      if (existing) {
        existing.trocas += 1;
      } else {
        const caminhao = caminhoes.find(c => c.id === caminhaoId);
        acc.push({ 
          caminhaoId,
          placa: caminhao?.placa || 'N/A',
          modelo: caminhao?.modelo || 'N/A',
          trocas: 1
        });
      }
      
      return acc;
    }, [] as { caminhaoId: string; placa: string; modelo: string; trocas: number }[]);

    const topCaminhoes = trocasPorCaminhao
      .sort((a, b) => b.trocas - a.trocas)
      .slice(0, 5);

    // 4. Status das trocas
    const statusTrocas = trocasValidas.reduce((acc, troca) => {
      const existing = acc.find(item => item.status === troca.status);
      
      if (existing) {
        existing.quantidade += 1;
      } else {
        acc.push({ 
          status: troca.status, 
          quantidade: 1,
          cor: troca.status === "Concluída" ? "#38A169" : "#D69E2E"
        });
      }
      
      return acc;
    }, [] as { status: string; quantidade: number; cor: string }[]);

    return {
      trocasPorMes,
      tiposOleo,
      topCaminhoes,
      statusTrocas
    };
  };

  const {
    trocasPorMes,
    tiposOleo,
    topCaminhoes,
    statusTrocas
  } = processData();

  // Calcular totais e médias
  const totalTrocas = trocasFiltradas.length;
  
  // Corrigido: usando Array.from para evitar o erro de iteração do Set
  const mesesUnicos = Array.from(new Set(trocasFiltradas.map(t => t.dataTroca.substring(0, 7)))).length;
  const mediaMensal = mesesUnicos > 0 ? Math.round(totalTrocas / mesesUnicos) : 0;
  const tipoMaisUsado = tiposOleo.length > 0 ? tiposOleo[0].nome : "Nenhum";

  // Obter tipos únicos de óleo para o filtro - CORREÇÃO
  const tiposOleoUnicos = Array.from(new Set(trocasFiltradas.map(t => t.tipoOleo)));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box bg="white" p={3} borderRadius="md" boxShadow="md" borderWidth="1px">
          <Text fontWeight="bold">{label}</Text>
          <Text color={payload[0].color}>
            Trocas: {payload[0].value}
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
          <Heading size="md">Dashboard de Troca de Óleo</Heading>
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
                <option value="12">1 year</option>
              </Select>
            </Box>
            
            <Box>
              <Text fontSize="xs" fontWeight="medium" mb={1}>Tipo Óleo:</Text>
              <Select
                size="xs"
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
                width="110px"
              >
                <option value="todos">Todos</option>
                {tiposOleoUnicos.map(tipo => (
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
          {trocasFiltradas.length === 0 ? (
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
                  <SimpleGrid columns={2} spacing={3} mb={4}>
                    <Card bg={cardBg} border="1px" borderColor={borderColor} size="sm">
                      <CardBody py={3}>
                        <Stat>
                          <StatLabel fontSize="xs">Total Trocas</StatLabel>
                          <StatNumber fontSize="lg">{totalTrocas}</StatNumber>
                          <Text fontSize="xs" color={textColor}>
                            {mediaMensal}/mês
                          </Text>
                        </Stat>
                      </CardBody>
                    </Card>
                    
                    <Card bg={cardBg} border="1px" borderColor={borderColor} size="sm">
                      <CardBody py={3}>
                        <Stat>
                          <StatLabel fontSize="xs">Tipo Mais Usado</StatLabel>
                          <StatNumber fontSize="lg">{tipoMaisUsado}</StatNumber>
                          <Text fontSize="xs" color={textColor}>
                            {tiposOleo.length > 0 ? Math.round((tiposOleo[0].quantidade / totalTrocas) * 100) : 0}% do total
                          </Text>
                        </Stat>
                      </CardBody>
                    </Card>
                  </SimpleGrid>

                  <Card bg={cardBg} border="1px" borderColor={borderColor} mb={4}>
                    <CardHeader fontWeight="bold" py={2} fontSize="sm">Trocas por Mês</CardHeader>
                    <CardBody py={2}>
                      <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={trocasPorMes}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="mes" fontSize={10} />
                          <YAxis allowDecimals={false} fontSize={10} />
                          <RechartsTooltip content={<CustomTooltip />} />
                          <Bar 
                            dataKey="trocas" 
                            fill="#3182CE" 
                            radius={[2, 2, 0, 0]} 
                            name="trocas"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardBody>
                  </Card>

                  <SimpleGrid columns={2} spacing={3}>
                    <Card bg={cardBg} border="1px" borderColor={borderColor}>
                      <CardHeader fontWeight="bold" py={2} fontSize="sm">Status</CardHeader>
                      <CardBody py={2}>
                        {statusTrocas.map(status => (
                          <Flex key={status.status} justify="space-between" mb={1}>
                            <Text fontSize="xs">{status.status}</Text>
                            <Badge fontSize="xs" colorScheme={
                              status.status === "Concluída" ? "green" : "orange"
                            }>
                              {status.quantidade}
                            </Badge>
                          </Flex>
                        ))}
                      </CardBody>
                    </Card>

                    <Card bg={cardBg} border="1px" borderColor={borderColor}>
                      <CardHeader fontWeight="bold" py={2} fontSize="sm">Top Caminhões</CardHeader>
                      <CardBody py={2}>
                        {topCaminhoes.slice(0, 3).map(caminhao => (
                          <Flex key={caminhao.caminhaoId} justify="space-between" mb={1}>
                            <Text fontSize="xs">{caminhao.placa}</Text>
                            <Badge fontSize="xs">{caminhao.trocas}</Badge>
                          </Flex>
                        ))}
                      </CardBody>
                    </Card>
                  </SimpleGrid>
                </TabPanel>
                
                {/* Painel: Análise */}
                <TabPanel px={2}>
                  <Card bg={cardBg} border="1px" borderColor={borderColor} mb={4}>
                    <CardHeader fontWeight="bold" py={2} fontSize="sm">Tipos de Óleo</CardHeader>
                    <CardBody py={2}>
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie
                            data={tiposOleo}
                            dataKey="quantidade"
                            nameKey="nome"
                            outerRadius={60}
                            label={({ quantidade }) => `${quantidade}`}
                          >
                            {tiposOleo.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.cor} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value, name) => [`${value} trocas`, name]}
                          />
                          <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardBody>
                  </Card>

                  {topCaminhoes.length > 0 && (
                    <Card bg={cardBg} border="1px" borderColor={borderColor}>
                      <CardHeader fontWeight="bold" py={2} fontSize="sm">Top Caminhões</CardHeader>
                      <CardBody py={2}>
                        <Table size="sm" variant="simple">
                          <Thead>
                            <Tr>
                              <Th fontSize="xs" px={2} py={1}>Caminhão</Th>
                              <Th fontSize="xs" px={2} py={1}>Modelo</Th>
                              <Th fontSize="xs" px={2} py={1} isNumeric>Trocas</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {topCaminhoes.map((item) => (
                              <Tr key={item.caminhaoId}>
                                <Td fontSize="xs" px={2} py={1}>{item.placa}</Td>
                                <Td fontSize="xs" px={2} py={1}>{item.modelo}</Td>
                                <Td fontSize="xs" px={2} py={1} isNumeric>{item.trocas}</Td>
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
                    <CardHeader fontWeight="bold" py={2} fontSize="sm">Últimas Trocas</CardHeader>
                    <CardBody py={2}>
                      <Table size="sm" variant="simple">
                        <Thead>
                          <Tr>
                            <Th fontSize="xs" px={2} py={1}>Data</Th>
                            <Th fontSize="xs" px={2} py={1}>Caminhão</Th>
                            <Th fontSize="xs" px={2} py={1}>Tipo Óleo</Th>
                            <Th fontSize="xs" px={2} py={1} isNumeric>KM Atual</Th>
                            <Th fontSize="xs" px={2} py={1}>Status</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {trocasFiltradas.slice(0, 5).map((troca) => {
                            const caminhaoId = extrairCaminhaoId(troca.caminhaoId);
                            const caminhao = caminhoes.find(c => c.id === caminhaoId);
                            
                            return (
                              <Tr key={troca.id}>
                                <Td fontSize="xs" px={2} py={1}>
                                  {new Date(troca.dataTroca).toLocaleDateString('pt-BR')}
                                </Td>
                                <Td fontSize="xs" px={2} py={1}>
                                  {caminhao ? caminhao.placa : 'N/A'}
                                </Td>
                                <Td fontSize="xs" px={2} py={1}>
                                  <Badge fontSize="xs" colorScheme={
                                    troca.tipoOleo.includes("Sintético") ? "blue" :
                                    troca.tipoOleo.includes("Mineral") ? "green" : "orange"
                                  }>
                                    {troca.tipoOleo}
                                  </Badge>
                                </Td>
                                <Td fontSize="xs" px={2} py={1} isNumeric>
                                  {troca.kmAtual.toLocaleString('pt-BR')}
                                </Td>
                                <Td fontSize="xs" px={2} py={1}>
                                  <Badge fontSize="xs" colorScheme={
                                    troca.status === "Concluída" ? "green" : "orange"
                                  }>
                                    {troca.status}
                                  </Badge>
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

export default ModalDashboardTrocaOleoAnalitico;