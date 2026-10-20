import React from "react";
import { Badge, Box, Button, Flex, Heading, Icon, SimpleGrid, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  MdBusiness,
  MdManageAccounts,
  MdTune,
  MdNotifications,
  MdExtension,
  MdSecurity,
  MdAssessment,
} from "react-icons/md";

const opcoesConfiguracao = [
  { titulo: "Relatório de Viagens", icon: MdAssessment },
  { titulo: "Dados da empresa", icon: MdBusiness },
  { titulo: "Usuários e permissões", icon: MdManageAccounts },
  { titulo: "Preferências do sistema", icon: MdTune },
  { titulo: "Notificações", icon: MdNotifications },
  { titulo: "Integrações", icon: MdExtension },
  { titulo: "Segurança", icon: MdSecurity },
];

const Configuracao: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box>
    <Box
      maxW="1200px"
      mx="auto"
      bg="white"
      border="1px solid #a3bde3"
      borderRadius="4px"
      boxShadow="0 2px 8px rgba(0,0,0,0.15)"
      overflow="hidden"
    >
      <Box bg="#dfeaf5" borderBottom="1px solid #a3bde3" px={5} py={4}>
        <Heading size="md" color="#15457b" fontWeight="600">Configuração</Heading>
        <Text color="gray.600" fontSize="sm" mt={1}>Opções de configuração do sistema</Text>
      </Box>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4} p={{ base: 4, md: 6 }}>
        {opcoesConfiguracao.map(({ titulo, icon }) => {
          const rota = titulo === "Relatório de Viagens" ? "/relatorio-viagens" : undefined;

          return (
            <Button
              key={titulo}
              isDisabled={!rota}
              onClick={() => rota && navigate(rota)}
              aria-label={rota ? titulo : `${titulo}, em breve`}
              h="88px"
              px={4}
              justifyContent="space-between"
              whiteSpace="normal"
              textAlign="left"
              bg={rota ? "#e6f0f5" : "#f3f4f6"}
              color={rota ? "#1f5c7a" : "#6b7280"}
              border={`1px solid ${rota ? "#9ec5d9" : "#d1d5db"}`}
              borderRadius="4px"
              cursor={rota ? "pointer" : "not-allowed"}
              opacity={1}
              _hover={rota ? { bg: "#d4e3ec" } : undefined}
              _disabled={{ opacity: 1, bg: "#f3f4f6", color: "#6b7280" }}
            >
              <Flex align="center" gap={3} minW={0}>
                <Icon as={icon as React.ElementType} boxSize={6} color={rota ? "#1f5c7a" : "gray.500"} flexShrink={0} />
                <Text fontSize="sm" fontWeight="600" noOfLines={2}>{titulo}</Text>
              </Flex>
              {!rota && (
                <Badge ml={3} bg="gray.200" color="gray.600" fontSize="xs" flexShrink={0}>
                  Em breve
                </Badge>
              )}
            </Button>
          );
        })}
      </SimpleGrid>
    </Box>
    </Box>
  );
};

export default Configuracao;