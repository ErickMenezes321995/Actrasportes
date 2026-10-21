import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Icon,
  IconButton,
  Select,
  SimpleGrid,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Center,
} from "@chakra-ui/react";
import { RepeatIcon } from "@chakra-ui/icons";
import { MdAltRoute } from "react-icons/md";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";

type TipoTransacao = "Receita" | "Despesa" | "Adiantamento";

interface Transacao {
  id: number;
  tipo: TipoTransacao;
  valor: number | string;
}

interface Viagem {
  id: number;
  origem: string;
  destino: string;
  motorista?: string;
  status: string;
  dataInicio?: string;
  transacoes: Transacao[];
}

const API_URL = "https://backend-frotas.onrender.com/api/viagens";

const converterValor = (valor: number | string): number => {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : 0;

  const valorNormalizado = valor.includes(",")
    ? valor.replace(/\./g, "").replace(",", ".")
    : valor;
  const numero = Number(valorNormalizado);
  return Number.isFinite(numero) ? numero : 0;
};

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);

const obterDataViagem = (data?: string): number => {
  if (!data) return 0;

  const dataBrasileira = data.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  const valor = dataBrasileira
    ? new Date(Number(dataBrasileira[3]), Number(dataBrasileira[2]) - 1, Number(dataBrasileira[1])).getTime()
    : new Date(data).getTime();

  return Number.isFinite(valor) ? valor : 0;
};

const formatarDataViagem = (data?: string): string => {
  const timestamp = obterDataViagem(data);
  return timestamp ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(timestamp) : "Data n?o informada";
};

const obterTotais = (transacoes: Transacao[]) => {
  const receitas = transacoes
    .filter((transacao) => transacao.tipo === "Receita")
    .reduce((total, transacao) => total + converterValor(transacao.valor), 0);
  const despesas = transacoes
    .filter((transacao) => transacao.tipo === "Despesa")
    .reduce((total, transacao) => total + converterValor(transacao.valor), 0);
  const adiantamentos = transacoes
    .filter((transacao) => transacao.tipo === "Adiantamento")
    .reduce((total, transacao) => total + converterValor(transacao.valor), 0);

  return { receitas, despesas, adiantamentos, custos: despesas + adiantamentos };
};

const RelatorioViagens: React.FC = () => {
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [viagemSelecionada, setViagemSelecionada] = useState("todas");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [tentativa, setTentativa] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let ativo = true;

    const carregarRelatorio = async () => {
      setCarregando(true);
      setErro("");

      try {
        const respostaViagens = await fetch(API_URL);
        if (!respostaViagens.ok) throw new Error("Não foi possível carregar as viagens.");
        const viagensApi: Omit<Viagem, "transacoes">[] = await respostaViagens.json();

        const viagensComTransacoes = await Promise.all(
          viagensApi.map(async (viagem) => {
            const respostaTransacoes = await fetch(`${API_URL}/${viagem.id}/transacoes`);
            if (!respostaTransacoes.ok) {
              throw new Error("Não foi possível carregar as transações de uma viagem.");
            }

            const transacoes: Transacao[] = await respostaTransacoes.json();
            return { ...viagem, transacoes };
          })
        );

        if (ativo) setViagens(viagensComTransacoes);
      } catch (error) {
        if (ativo) {
          setErro(error instanceof Error ? error.message : "Erro ao carregar o relatório.");
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    };

    carregarRelatorio();
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  const viagensVisiveis = useMemo(
    () => (viagemSelecionada === "todas"
      ? viagens
      : viagens.filter((viagem) => String(viagem.id) === viagemSelecionada))
      .slice()
      .sort((a, b) => obterDataViagem(b.dataInicio) - obterDataViagem(a.dataInicio)),
    [viagens, viagemSelecionada]
  );

  const resumo = useMemo(
    () => viagens.reduce(
      (total, viagem) => {
        const valores = obterTotais(viagem.transacoes);
        return {
          receitas: total.receitas + valores.receitas,
          despesas: total.despesas + valores.despesas,
          adiantamentos: total.adiantamentos + valores.adiantamentos,
          custos: total.custos + valores.custos,
        };
      },
      { receitas: 0, despesas: 0, adiantamentos: 0, custos: 0 }
    ),
    [viagens]
  );

  const indicadores = [
    { label: "Receitas", valor: resumo.receitas, cor: "green.600" },
    { label: "Despesas", valor: resumo.despesas, cor: "orange.600" },
    { label: "Adiantamentos", valor: resumo.adiantamentos, cor: "blue.600" },
    { label: "Saldo (receitas - custos)", valor: resumo.receitas - resumo.custos, cor: resumo.receitas >= resumo.custos ? "green.700" : "red.600" },
  ];

  const dadosGrafico = [{
    rota: "Todas as viagens",
    receitas: resumo.receitas,
    despesas: resumo.despesas,
    adiantamentos: resumo.adiantamentos,
  }];

  return (
    <Box>
      <Card
        w="100%"
        maxW="1400px"
        mx="auto"
        boxShadow="0 2px 8px rgba(0,0,0,0.15)"
        borderRadius="4px"
        border="1px solid #a3bde3"
        overflow="hidden"
      >
        <CardHeader bg="#dfeaf5" borderBottom="1px solid #a3bde3" py={4} px={5}>
          <Flex justify="space-between" align={{ base: "stretch", md: "center" }} gap={4} direction={{ base: "column", md: "row" }}>
            <Box>
              <Heading size="md" fontWeight="600" color="#15457b">Dashboard de Viagens</Heading>
              <Text color="gray.600" fontSize="sm" mt={1}>Receitas, despesas e adiantamentos</Text>
            </Box>
            <Flex gap={2} align="end" direction={{ base: "column", sm: "row" }}>
              <Box w={{ base: "full", sm: "300px" }}>
                <Text fontSize="xs" fontWeight="medium" mb={1}>Viagem:</Text>
                <Select
                  size="sm"
                  aria-label="Selecionar viagem para o relatório"
                  value={viagemSelecionada}
                  onChange={(evento) => setViagemSelecionada(evento.target.value)}
                  bg="white"
                >
                  <option value="todas">Todas as viagens</option>
                  {viagens.map((viagem) => (
                    <option key={viagem.id} value={viagem.id}>
                      {viagem.origem} → {viagem.destino}
                    </option>
                  ))}
                </Select>
              </Box>
              <IconButton
                aria-label="Atualizar relatório"
                icon={<RepeatIcon />}
                onClick={() => setTentativa((valor) => valor + 1)}
                variant="outline"
                size="sm"
              />
            </Flex>
          </Flex>
        </CardHeader>

      {erro && (
        <Alert status="error" mb={5} borderRadius="md">
          <AlertIcon />
          <Flex justify="space-between" align="center" w="full" gap={3}>
            <Text>{erro}</Text>
            <Button size="sm" onClick={() => setTentativa((valor) => valor + 1)}>Tentar novamente</Button>
          </Flex>
        </Alert>
      )}

      {carregando ? (
        <Center minH="300px">
          <Spinner size="xl" thickness="4px" color="#15457b" />
        </Center>
      ) : !erro && (
        <CardBody p={{ base: 3, md: 5 }}>
          <Flex align="center" justify="space-between" mb={4}>
            <Text color="gray.600" fontSize="sm">{viagensVisiveis.length} viagem(ns) exibida(s)</Text>
            {viagemSelecionada !== "todas" && (
              <Button size="sm" colorScheme="blue" variant="outline" onClick={() => navigate(`/historico/${viagemSelecionada}`)}>
                Abrir histórico
              </Button>
            )}
          </Flex>

          <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={3} mb={6}>
            {indicadores.map((indicador) => (
              <Card key={indicador.label} border="1px" borderColor="gray.200" size="sm">
                <CardBody py={3}>
                <Stat>
                  <StatLabel fontSize="xs" color="gray.600">{indicador.label}</StatLabel>
                  <StatNumber color={indicador.cor} fontSize={{ base: "lg", md: "xl" }}>
                    {formatarMoeda(indicador.valor)}
                  </StatNumber>
                </Stat>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          {viagens.length > 0 && (
            <Card border="1px" borderColor="gray.200" mb={6}>
              <CardHeader pb={0}>
                <Heading size="sm" color="#15457b">Resultado consolidado</Heading>
              </CardHeader>
              <CardBody pt={3}>
                <Box h="240px">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosGrafico} margin={{ top: 8, right: 24, bottom: 8, left: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="rota" />
                      <YAxis tickFormatter={(valor: number) => formatarMoeda(valor)} />
                      <Tooltip formatter={(valor: number) => formatarMoeda(valor)} />
                      <Legend />
                      <Bar dataKey="receitas" name="Receitas" fill="#38A169" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="despesas" name="Despesas" fill="#DD6B20" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="adiantamentos" name="Adiantamentos" fill="#3182CE" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardBody>
            </Card>
          )}

          <Card border="1px solid #E5EAF2" borderRadius="18px" overflow="hidden"
            boxShadow="0 12px 32px rgba(28, 50, 80, .07)" mb={2}>
            <CardHeader bg="white" borderBottom="1px solid #EDF1F6" py={5} px={{ base: 4, md: 6 }}>
              <Flex justify="space-between" align="center" gap={4}>
                <Flex align="center" gap={3}>
                  <Flex align="center" justify="center" boxSize="42px" borderRadius="13px" bg="#EEF4FC" color="#315F9B">
                    <Icon as={MdAltRoute as React.ElementType} boxSize={5} />
                  </Flex>
                  <Box>
                    <Heading size="sm" color="#1D3553" letterSpacing="-.2px">Resultado por viagem</Heading>
                    <Text mt={1} fontSize="xs" color="#8492A6">Acompanhamento financeiro de cada rota</Text>
                  </Box>
                </Flex>
                <Badge px={3} py={1.5} borderRadius="full" bg="#EEF4FC" color="#315F9B" fontSize="xs" fontWeight="700">
                  {viagensVisiveis.length} {viagensVisiveis.length === 1 ? "viagem" : "viagens"}
                </Badge>
              </Flex>
            </CardHeader>
            <CardBody p={0}>
              <Box maxH="520px" overflowY="auto" overflowX="auto">
                <Table size="sm" variant="simple" minW="980px">
                  <Thead bg="#F7F9FC">
                    <Tr>
                      <Th py={3.5} color="#8290A5" fontSize="10px" letterSpacing="1px" fontWeight="700" borderColor="#EDF1F6">Rota</Th>
                      <Th py={3.5} color="#8290A5" fontSize="10px" letterSpacing="1px" fontWeight="700" borderColor="#EDF1F6">Motorista</Th>
                      <Th py={3.5} color="#8290A5" fontSize="10px" letterSpacing="1px" fontWeight="700" borderColor="#EDF1F6">Status</Th>
                      <Th py={3.5} color="#8290A5" fontSize="10px" letterSpacing="1px" fontWeight="700" borderColor="#EDF1F6" isNumeric>Receitas</Th>
                      <Th py={3.5} color="#8290A5" fontSize="10px" letterSpacing="1px" fontWeight="700" borderColor="#EDF1F6" isNumeric>Despesas</Th>
                      <Th py={3.5} color="#8290A5" fontSize="10px" letterSpacing="1px" fontWeight="700" borderColor="#EDF1F6" isNumeric>Adiantamentos</Th>
                      <Th py={3.5} color="#8290A5" fontSize="10px" letterSpacing="1px" fontWeight="700" borderColor="#EDF1F6" isNumeric>Saldo</Th>
                      <Th py={3.5} color="#8290A5" fontSize="10px" letterSpacing="1px" fontWeight="700" borderColor="#EDF1F6">Acesso</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {viagensVisiveis.map((viagem) => {
                      const totais = obterTotais(viagem.transacoes);
                      const saldo = totais.receitas - totais.custos;

                      return (
                        <Tr key={viagem.id}>
                          <Td minW="220px"><Text fontWeight="semibold">{viagem.origem} → {viagem.destino}</Text></Td>
                          <Td>{viagem.motorista || "Não informado"}</Td>
                          <Td><Badge colorScheme={viagem.status === "Concluída" ? "green" : "gray"}>{viagem.status}</Badge></Td>
                          <Td isNumeric color="green.700">{formatarMoeda(totais.receitas)}</Td>
                          <Td isNumeric color="orange.700">{formatarMoeda(totais.despesas)}</Td>
                          <Td isNumeric color="blue.700">{formatarMoeda(totais.adiantamentos)}</Td>
                          <Td isNumeric fontWeight="bold" color={saldo >= 0 ? "green.700" : "red.600"}>
                            {formatarMoeda(saldo)}
                          </Td>
                          <Td>
                            <Button size="xs" colorScheme="blue" variant="outline" onClick={() => navigate(`/historico/${viagem.id}`)}>
                              Ver viagem
                            </Button>
                          </Td>
                        </Tr>
                      );
                    })}
                    {viagensVisiveis.length === 0 && (
                      <Tr><Td colSpan={8} textAlign="center" py={12} color="#8290A5">Nenhuma viagem encontrada para este filtro.</Td></Tr>
                    )}
                  </Tbody>
                </Table>
              </Box>
            </CardBody>
          </Card>
        </CardBody>
      )}
      </Card>
    </Box>
  );
};

export default RelatorioViagens;