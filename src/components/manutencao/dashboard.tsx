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
import React, { useEffect, useState } from "react";
import { DownloadIcon, RepeatIcon } from "@chakra-ui/icons";

interface Caminhao {
  id: string;
  placa: string;
  modelo: string;
}

interface ManutencaoPreventiva {
  id: string;
  caminhaoId: string | any;
  data: string;
  tipo: string;
  quilometragem: number;
  oficina: string;
  custo: number;
  proximaRevisao: string;
  observacoes?: string;
  status: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  manutencoes: ManutencaoPreventiva[];
  caminhoes: Caminhao[];
}

interface Estatisticas {
  totalManutencoes: number;
  mediaMensal: number;
  custoTotal: number;
  custoMedio: number;
  manutencoesPorMes: { mes: string; manutencoes: number; custo: number }[];
  tiposManutencao: { tipo: string; quantidade: number; custo: number; cor: string }[];
  topCaminhoes: { caminhaoId: string; manutencoes: number; custo: number; placa?: string; modelo?: string }[];
  statusDistribuicao: { status: string; quantidade: number; cor: string }[];
}

const ModalDashboardManutencaoPreventivaAnalitico: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  manutencoes,
  caminhoes 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [periodoFiltro, setPeriodoFiltro] = useState<string>("todos");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [manutencoesFiltradas, setManutencoesFiltradas] = useState<ManutencaoPreventiva[]>(manutencoes);
  const toast = useToast();
  
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.400");

  // Função para extrair o ID do caminhão (pode ser string, objeto ou null)
  const extrairCaminhaoId = (caminhaoId: string | any): string => {
    if (!caminhaoId) return '';
    
    if (typeof caminhaoId === 'object') {
      return caminhaoId?.id || caminhaoId?._id || caminhaoId?.caminhaoId || '';
    }
    
    return caminhaoId;
  };

  // Aplicar filtros
  useEffect(() => {
    let resultado = [...manutencoes];
    
    // Filtro por período
    if (periodoFiltro !== "todos") {
      const hoje = new Date();
      const mesesAtras = new Date();
      mesesAtras.setMonth(hoje.getMonth() - parseInt(periodoFiltro));
      
      resultado = resultado.filter(m => {
        try {
          const dataManutencao = new Date(m.data);
          return dataManutencao >= mesesAtras;
        } catch {
          return false;
        }
      });
    }
    
    // Filtro por tipo
    if (tipoFiltro !== "todos") {
      resultado = resultado.filter(m => m.tipo === tipoFiltro);
    }
    
    setManutencoesFiltradas(resultado);
  }, [periodoFiltro, tipoFiltro, manutencoes]);

  // Processar dados para o dashboard
  useEffect(() => {
    if (isOpen) {
      if (manutencoesFiltradas.length > 0) {
        processarDadosDashboard();
      } else {
        setIsLoading(false);
        setEstatisticas({
          totalManutencoes: 0,
          mediaMensal: 0,
          custoTotal: 0,
          custoMedio: 0,
          manutencoesPorMes: [],
          tiposManutencao: [],
          topCaminhoes: [],
          statusDistribuicao: []
        });
      }
    }
  }, [isOpen, manutencoesFiltradas]);

  const processarDadosDashboard = () => {
    try {
      setIsLoading(true);

      // 1. Estatísticas básicas
      const totalManutencoes = manutencoesFiltradas.length;
      const custoTotal = manutencoesFiltradas.reduce((sum, m) => sum + (m.custo || 0), 0);
      const custoMedio = totalManutencoes > 0 ? custoTotal / totalManutencoes : 0;

      // 2. Agrupar manutenções por mês (com custo)
      const manutencoesPorMes = manutencoesFiltradas.reduce((acc, manutencao) => {
        try {
          const mesAno = new Date(manutencao.data).toLocaleDateString('pt-BR', { 
            month: 'short',
            year: 'numeric'
          });
          const existing = acc.find(item => item.mes === mesAno);
          
          if (existing) {
            existing.manutencoes += 1;
            existing.custo += (manutencao.custo || 0);
          } else {
            acc.push({ mes: mesAno, manutencoes: 1, custo: (manutencao.custo || 0) });
          }
        } catch (error) {
          console.error('Erro ao processar data:', manutencao.data, error);
        }
        return acc;
      }, [] as { mes: string; manutencoes: number; custo: number }[]);

      const mesesUnicos = new Set(manutencoesPorMes.map(m => m.mes)).size;
      const mediaMensal = mesesUnicos > 0 ? Math.round(totalManutencoes / mesesUnicos) : 0;

      // 3. Agrupar por tipo de manutenção (com custo)
      const tiposManutencao = manutencoesFiltradas.reduce((acc, manutencao) => {
        const existing = acc.find(item => item.tipo === manutencao.tipo);
        
        if (existing) {
          existing.quantidade += 1;
          existing.custo += (manutencao.custo || 0);
        } else {
          acc.push({ 
            tipo: manutencao.tipo, 
            quantidade: 1,
            custo: (manutencao.custo || 0),
            cor: getCorTipoManutencao(manutencao.tipo)
          });
        }
        
        return acc;
      }, [] as { tipo: string; quantidade: number; custo: number; cor: string }[]);

      // 4. Top caminhões por número de manutenções (com custo)
      const manutencoesPorCaminhao = manutencoesFiltradas.reduce((acc, manutencao) => {
        const caminhaoId = extrairCaminhaoId(manutencao.caminhaoId);
        
        const existing = acc.find(item => item.caminhaoId === caminhaoId);
        
        if (existing) {
          existing.manutencoes += 1;
          existing.custo += (manutencao.custo || 0);
        } else {
          acc.push({ caminhaoId, manutencoes: 1, custo: (manutencao.custo || 0) });
        }
        
        return acc;
      }, [] as { caminhaoId: string; manutencoes: number; custo: number }[]);

      const topCaminhoes = manutencoesPorCaminhao
        .sort((a, b) => b.manutencoes - a.manutencoes)
        .slice(0, 5)
        .map(item => {
          const caminhao = caminhoes.find(c => c.id === item.caminhaoId);
          return {
            ...item,
            placa: caminhao?.placa || 'N/A',
            modelo: caminhao?.modelo || 'N/A'
          };
        });

      // 5. Distribuição por status
      const statusDistribuicao = manutencoesFiltradas.reduce((acc, manutencao) => {
        const existing = acc.find(item => item.status === manutencao.status);
        
        if (existing) {
          existing.quantidade += 1;
        } else {
          acc.push({ 
            status: manutencao.status, 
            quantidade: 1,
            cor: getCorStatus(manutencao.status)
          });
        }
        
        return acc;
      }, [] as { status: string; quantidade: number; cor: string }[]);

      setEstatisticas({
        totalManutencoes,
        mediaMensal,
        custoTotal,
        custoMedio,
        manutencoesPorMes,
        tiposManutencao,
        topCaminhoes,
        statusDistribuicao
      });
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
  };

  const getCorTipoManutencao = (tipo: string): string => {
    const cores: { [key: string]: string } = {
      "Preventiva": "#3182CE",
      "Corretiva": "#E53E3E",
      "Preditiva": "#38A169",
      "Revisão Geral": "#805AD5",
      "Troca de Filtros": "#D69E2E",
      "Verificação de Freios": "#F56565",
      "Outro": "#A0AEC0"
    };
    
    return cores[tipo] || "#718096";
  };

  const getCorStatus = (status: string): string => {
    const cores: { [key: string]: string } = {
      "Concluída": "#38A169",
      "Agendada": "#D69E2E",
      "Em Andamento": "#3182CE",
      "Atrasada": "#E53E3E",
      "Cancelada": "#A0AEC0"
    };
    
    return cores[status] || "#718096";
  };

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
            {payload[0].name === "manutencoes" ? "Manutenções: " : "Custo: "}
            {payload[0].name === "manutencoes" 
              ? payload[0].value 
              : payload[0].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            }
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
          <Heading size="md">Dashboard de Manutenção</Heading>
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
              <Text fontSize="xs" fontWeight="medium" mb={1}>Tipo:</Text>
              <Select
                size="xs"
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
                width="110px"
              >
                <option value="todos">Todos</option>
                {estatisticas?.tiposManutencao.map(tipo => (
                  <option key={tipo.tipo} value={tipo.tipo}>{tipo.tipo}</option>
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
          {estatisticas && estatisticas.totalManutencoes > 0 ? (
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
                          <StatLabel fontSize="xs">Total</StatLabel>
                          <StatNumber fontSize="lg">{estatisticas.totalManutencoes}</StatNumber>
                          <Text fontSize="xs" color={textColor}>
                            {estatisticas.mediaMensal}/mês
                          </Text>
                        </Stat>
                      </CardBody>
                    </Card>
                    
                    <Card bg={cardBg} border="1px" borderColor={borderColor} size="sm">
                      <CardBody py={3}>
                        <Stat>
                          <StatLabel fontSize="xs">Custo Total</StatLabel>
                          <StatNumber fontSize="lg">
                            {estatisticas.custoTotal.toLocaleString('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL',
                              minimumFractionDigits: 0
                            })}
                          </StatNumber>
                          <Text fontSize="xs" color={textColor}>
                            Média: {estatisticas.custoMedio.toLocaleString('pt-BR', { 
                              style: 'currency', 
                              currency: 'BRL',
                              minimumFractionDigits: 0
                            })}
                          </Text>
                        </Stat>
                      </CardBody>
                    </Card>
                  </SimpleGrid>

                  <Card bg={cardBg} border="1px" borderColor={borderColor} mb={4}>
                    <CardHeader fontWeight="bold" py={2} fontSize="sm">Manutenções por Mês</CardHeader>
                    <CardBody py={2}>
                      <ResponsiveContainer width="100%" height={150}>
                        <BarChart data={estatisticas.manutencoesPorMes}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="mes" fontSize={10} />
                          <YAxis allowDecimals={false} fontSize={10} />
                          <RechartsTooltip content={<CustomTooltip />} />
                          <Bar 
                            dataKey="manutencoes" 
                            fill="#805AD5" 
                            radius={[2, 2, 0, 0]} 
                            name="manutencoes"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardBody>
                  </Card>

                  <SimpleGrid columns={2} spacing={3}>
                    <Card bg={cardBg} border="1px" borderColor={borderColor}>
                      <CardHeader fontWeight="bold" py={2} fontSize="sm">Status</CardHeader>
                      <CardBody py={2}>
                        {estatisticas.statusDistribuicao.map(status => (
                          <Flex key={status.status} justify="space-between" mb={1}>
                            <Text fontSize="xs">{status.status}</Text>
                            <Badge fontSize="xs" colorScheme={
                              status.status === "Concluída" ? "green" : 
                              status.status === "Em Andamento" ? "blue" : 
                              status.status === "Atrasada" ? "red" : "gray"
                            }>
                              {status.quantidade}
                            </Badge>
                          </Flex>
                        ))}
                      </CardBody>
                    </Card>

                    <Card bg={cardBg} border="1px" borderColor={borderColor}>
                      <CardHeader fontWeight="bold" py={2} fontSize="sm">Tipos</CardHeader>
                      <CardBody py={2}>
                        {estatisticas.tiposManutencao.slice(0, 4).map(tipo => (
                          <Flex key={tipo.tipo} justify="space-between" mb={1}>
                            <Text fontSize="xs">{tipo.tipo}</Text>
                            <Badge fontSize="xs">{tipo.quantidade}</Badge>
                          </Flex>
                        ))}
                      </CardBody>
                    </Card>
                  </SimpleGrid>
                </TabPanel>
                
                {/* Painel: Análise */}
                <TabPanel px={2}>
                  <Card bg={cardBg} border="1px" borderColor={borderColor} mb={4}>
                    <CardHeader fontWeight="bold" py={2} fontSize="sm">Tipos de Manutenção</CardHeader>
                    <CardBody py={2}>
                      <ResponsiveContainer width="100%" height={150}>
                        <PieChart>
                          <Pie
                            data={estatisticas.tiposManutencao}
                            dataKey="quantidade"
                            nameKey="tipo"
                            outerRadius={60}
                            label={({ quantidade }) => `${quantidade}`}
                          >
                            {estatisticas.tiposManutencao.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.cor} />
                            ))}
                          </Pie>
                          <RechartsTooltip 
                            formatter={(value, name) => {
                              const custo = estatisticas.tiposManutencao.find(t => t.tipo === name)?.custo || 0;
                              return [
                                `${value} manutenções`, 
                                `Custo: ${custo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
                              ];
                            }}
                          />
                          <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardBody>
                  </Card>

                  {estatisticas.topCaminhoes.length > 0 && (
                    <Card bg={cardBg} border="1px" borderColor={borderColor}>
                      <CardHeader fontWeight="bold" py={2} fontSize="sm">Top Caminhões</CardHeader>
                      <CardBody py={2}>
                        <Table size="sm" variant="simple">
                          <Thead>
                            <Tr>
                              <Th fontSize="xs" px={2} py={1}>Caminhão</Th>
                              <Th fontSize="xs" px={2} py={1} isNumeric>Manutenções</Th>
                              <Th fontSize="xs" px={2} py={1} isNumeric>Custo</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {estatisticas.topCaminhoes.map((item) => (
                              <Tr key={item.caminhaoId}>
                                <Td fontSize="xs" px={2} py={1}>{item.placa || 'N/A'}</Td>
                                <Td fontSize="xs" px={2} py={1} isNumeric>{item.manutencoes}</Td>
                                <Td fontSize="xs" px={2} py={1} isNumeric>
                                  {item.custo.toLocaleString('pt-BR', { 
                                    style: 'currency', 
                                    currency: 'BRL',
                                    minimumFractionDigits: 0
                                  })}
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
                    <CardHeader fontWeight="bold" py={2} fontSize="sm">Últimas Manutenções</CardHeader>
                    <CardBody py={2}>
                      <Table size="sm" variant="simple">
                        <Thead>
                          <Tr>
                            <Th fontSize="xs" px={2} py={1}>Data</Th>
                            <Th fontSize="xs" px={2} py={1}>Caminhão</Th>
                            <Th fontSize="xs" px={2} py={1}>Tipo</Th>
                            <Th fontSize="xs" px={2} py={1} isNumeric>Custo</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {manutencoesFiltradas.slice(0, 5).map((manutencao) => {
                            const caminhaoId = extrairCaminhaoId(manutencao.caminhaoId);
                            const caminhao = caminhoes.find(c => c.id === caminhaoId);
                            
                            return (
                              <Tr key={manutencao.id}>
                                <Td fontSize="xs" px={2} py={1}>
                                  {new Date(manutencao.data).toLocaleDateString('pt-BR')}
                                </Td>
                                <Td fontSize="xs" px={2} py={1}>
                                  {caminhao ? caminhao.placa : 'N/A'}
                                </Td>
                                <Td fontSize="xs" px={2} py={1}>
                                  <Badge fontSize="xs" colorScheme={
                                    manutencao.tipo === "Preventiva" ? "blue" :
                                    manutencao.tipo === "Corretiva" ? "red" : "green"
                                  }>
                                    {manutencao.tipo}
                                  </Badge>
                                </Td>
                                <Td fontSize="xs" px={2} py={1} isNumeric>
                                  {manutencao.custo.toLocaleString('pt-BR', { 
                                    style: 'currency', 
                                    currency: 'BRL',
                                    minimumFractionDigits: 0
                                  })}
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
          ) : (
            <Center py={5} flexDirection="column">
              <Text color="gray.500" fontSize="md" mb={2}>
                {manutencoesFiltradas.length === 0 ? 'Nenhum dado encontrado' : 'Nenhuma manutenção válida'}
              </Text>
              <Text color="gray.400" fontSize="sm">
                {manutencoesFiltradas.length === 0 
                  ? 'Ajuste os filtros para ver resultados' 
                  : 'As manutenções não possuem caminhão associado válido'
                }
              </Text>
            </Center>
          )}
        </ModalBody>

        <ModalFooter pt={2}>
          <Button size="sm" variant="outline" mr={3} onClick={onClose}>
            Fechar
          </Button>
          {/* <Button size="sm" colorScheme="blue" onClick={handleExportData} leftIcon={<DownloadIcon />}>
            Exportar
          </Button> */}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalDashboardManutencaoPreventivaAnalitico;