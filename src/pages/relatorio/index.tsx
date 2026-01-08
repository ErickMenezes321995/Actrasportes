import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  useToast,
  Button,
  chakra,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface DespesaItem {
  id: number;
  tipo: string;
  descricao: string;
  valor: number;
  data: string;
  status: string;
}

const IconeFinanceiro = chakra("svg", {
  baseStyle: {
    boxSize: 7,
    color: "purple.500",
  },
});

function StatusTag({ status }: { status: string }) {
  const statusMap: Record<string, { colorScheme: string; label: string }> = {
    "Pendente": { colorScheme: "yellow", label: "Pendente" },
    "Pago": { colorScheme: "green", label: "Pago" },
    "Cancelado": { colorScheme: "red", label: "Cancelado" },
  };
  const { colorScheme, label } = statusMap[status] || {
    colorScheme: "gray",
    label: status,
  };
  return (
    <Box
      as="span"
      px={2}
      py={1}
      rounded="md"
      fontWeight="bold"
      fontSize="sm"
      color="white"
      bg={`${colorScheme}.500`}
      userSelect="none"
    >
      {label}
    </Box>
  );
}

const DashboardDespesas: React.FC = () => {
  const [despesas, setDespesas] = useState<DespesaItem[]>([]);
  const toast = useToast();

  useEffect(() => {
    const mock: DespesaItem[] = [
      { id: 1, tipo: "Multa", descricao: "Multa excesso de velocidade", valor: 500, data: "2025-01-10", status: "Pago" },
      { id: 2, tipo: "Pneu", descricao: "Troca pneu dianteiro", valor: 1200, data: "2025-02-14", status: "Pendente" },
      { id: 3, tipo: "Acidente", descricao: "Pequeno amassado na lateral", valor: 850, data: "2025-04-12", status: "Cancelado" },
      { id: 4, tipo: "Reparo", descricao: "Troca de óleo e filtros", valor: 300, data: "2025-06-03", status: "Pago" },
    ];
    setDespesas(mock);
  }, []);

  const total = despesas.length;
  const totalPago = despesas.filter((d) => d.status === "Pago").length;
  const pendentes = despesas.filter((d) => d.status === "Pendente").length;
  const cancelados = despesas.filter((d) => d.status === "Cancelado").length;

  const despesasPorMes = [
    { mes: "Jan", despesas: 1 },
    { mes: "Fev", despesas: 1 },
    { mes: "Mar", despesas: 0 },
    { mes: "Abr", despesas: 1 },
    { mes: "Mai", despesas: 0 },
    { mes: "Jun", despesas: 1 },
    { mes: "Jul", despesas: 0 },
  ];

  return (
    <Box mt="80px" px={4}>
      <Heading size="lg" mb={6} textAlign="center" fontFamily="Montserrat">
        Dashboard de Despesas Gerais
      </Heading>

      <SimpleGrid columns={[1, 2, 4]} spacing={4} maxW="1100px" mx="auto">
        <Card><CardBody><Stat><StatLabel>Total</StatLabel><StatNumber>{total}</StatNumber></Stat></CardBody></Card>
        <Card><CardBody><Stat><StatLabel>Pagos</StatLabel><StatNumber color="green.500">{totalPago}</StatNumber></Stat></CardBody></Card>
        <Card><CardBody><Stat><StatLabel>Pendentes</StatLabel><StatNumber color="yellow.500">{pendentes}</StatNumber></Stat></CardBody></Card>
        <Card><CardBody><Stat><StatLabel>Cancelados</StatLabel><StatNumber color="red.500">{cancelados}</StatNumber></Stat></CardBody></Card>
      </SimpleGrid>

      <Card mt={8} maxW="1100px" mx="auto">
        <CardHeader><Heading size="md">Despesas por Mês</Heading></CardHeader>
        <CardBody>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={despesasPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="despesas" fill="#805AD5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>

      <Card mt={8} maxW="1100px" mx="auto">
        <CardHeader>
          <Flex justify="space-between" align="center">
            <Flex align="center" gap={3}>
              <IconeFinanceiro viewBox="0 0 640 512" fill="currentColor">
                <path d="M320 32C146.6 32 0 178.6 0 352c0 75.4 27.1 144.3 72 198.5V512h496v38.5C612.9 496.3 640 427.4 640 352c0-173.4-146.6-320-320-320z" />
              </IconeFinanceiro>
              <Heading size="md">Despesas Registradas</Heading>
            </Flex>
            <Button leftIcon={<AddIcon />} colorScheme="purple">
              Nova Despesa
            </Button>
          </Flex>
        </CardHeader>
        <CardBody overflowX="auto">
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Tipo</Th>
                <Th>Descrição</Th>
                <Th>Valor</Th>
                <Th>Data</Th>
                <Th>Status</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {despesas.map((d) => (
                <Tr key={d.id}>
                  <Td>{d.tipo}</Td>
                  <Td>{d.descricao}</Td>
                  <Td>R$ {d.valor.toFixed(2)}</Td>
                  <Td>{d.data}</Td>
                  <Td><StatusTag status={d.status} /></Td>
                  <Td>
                    <Flex gap={2}>
                      <IconButton aria-label="Visualizar" icon={<ViewIcon />} size="sm" colorScheme="blue" variant="ghost" />
                      <IconButton aria-label="Editar" icon={<EditIcon />} size="sm" colorScheme="blue" variant="ghost" />
                      <IconButton aria-label="Excluir" icon={<DeleteIcon />} size="sm" colorScheme="red" variant="ghost" />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </Box>
  );
};

export default DashboardDespesas;
