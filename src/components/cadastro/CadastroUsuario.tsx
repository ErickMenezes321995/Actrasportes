import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  SimpleGrid,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { publicApi as axios } from "../../services/api";
import { getApiErrorMessage } from "../../services/apiErrors";


const CadastroUsuario: React.FC = () => {
  const [formData, setFormData] = useState({ nome: "", email: "", senha: "", cpf: "", telefone: "", empresa: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post("/api/auth/cadastro", {
        nomeEmpresa: formData.empresa,
        usuario: {
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          cpf: formData.cpf,
          telefone: formData.telefone || undefined,
        },
      });
      toast({
        title: "Cadastro realizado com sucesso",
        description: "Agora você já pode entrar usando seu e-mail e senha.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      toast({
        title: "Não foi possível concluir o cadastro",
        description: getApiErrorMessage(error, "Confira os dados e tente novamente."),
        status: "error",
        duration: 6000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Flex minH="100vh" bg="#F4F7FA" align="center" justify="center" px={5} py={10}>
      <Box w="full" maxW="560px" bg="white" p={{ base: 6, md: 10 }} borderRadius="24px"
        border="1px solid #E6EDF2" boxShadow="0 24px 70px rgba(23, 43, 61, .10)">
        <Flex align="center" gap={3} mb={8}>
          <Flex align="center" justify="center" boxSize="44px" borderRadius="13px" bg="#176D68"
            color="white" fontSize="2xl" fontWeight="800">S</Flex>
          <Box>
            <Text color="#172B3D" fontSize="sm" fontWeight="800" letterSpacing="1.5px">STRIX</Text>
            <Text color="#718198" fontSize="10px" letterSpacing="2.5px">SOLUTIONS</Text>
          </Box>
        </Flex>

        <Text color="#438C86" fontSize="xs" fontWeight="700" letterSpacing="1.5px" mb={2}>
          AC TRANSPORTES
        </Text>
        <Heading color="#172B3D" fontSize="2xl" letterSpacing="-.6px">Solicite seu cadastro</Heading>
        <Text mt={2} mb={7} color="#7A8999" fontSize="sm" lineHeight="1.7">
          Preencha seus dados para demonstrar interesse em acessar a plataforma.
        </Text>

        <form onSubmit={handleSubmit}>
          <Stack spacing={5}>
            <FormControl isRequired>
              <FormLabel color="#34475B" fontSize="sm" fontWeight="600">Nome completo</FormLabel>
              <Input name="nome" value={formData.nome} onChange={handleChange} placeholder="Seu nome"
                size="lg" borderRadius="12px" borderColor="#DCE4EC" bg="#FBFCFD" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel color="#34475B" fontSize="sm" fontWeight="600">E-mail</FormLabel>
              <Input name="email" type="email" value={formData.email} onChange={handleChange}
                placeholder="voce@empresa.com" size="lg" borderRadius="12px" borderColor="#DCE4EC" bg="#FBFCFD" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel color="#34475B" fontSize="sm" fontWeight="600">Senha</FormLabel>
              <Input name="senha" type="password" value={formData.senha} onChange={handleChange}
                placeholder="Sua senha" size="lg" borderRadius="12px" borderColor="#DCE4EC" bg="#FBFCFD" />
            </FormControl>
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel color="#34475B" fontSize="sm" fontWeight="600">CPF</FormLabel>
                <Input name="cpf" value={formData.cpf} onChange={handleChange}
                  placeholder="000.000.000-00" size="lg" borderRadius="12px" borderColor="#DCE4EC" bg="#FBFCFD" />
              </FormControl>
              <FormControl>
                <FormLabel color="#34475B" fontSize="sm" fontWeight="600">Telefone</FormLabel>
                <Input name="telefone" type="tel" value={formData.telefone} onChange={handleChange}
                  placeholder="(00) 00000-0000" size="lg" borderRadius="12px" borderColor="#DCE4EC" bg="#FBFCFD" />
              </FormControl>
              <FormControl isRequired>
                <FormLabel color="#34475B" fontSize="sm" fontWeight="600">Empresa</FormLabel>
                <Input name="empresa" value={formData.empresa} onChange={handleChange} placeholder="Sua transportadora"
                  size="lg" borderRadius="12px" borderColor="#DCE4EC" bg="#FBFCFD" />
              </FormControl>
            </SimpleGrid>
            <Button type="submit" bg="#176D68" color="white" size="lg" borderRadius="12px" fontWeight="700"
              isLoading={isSubmitting} loadingText="Enviando"
              _hover={{ bg: "#125B57", transform: "translateY(-1px)" }}>
              Enviar solicitação
            </Button>
          </Stack>
        </form>

        <Text mt={6} color="#7A8999" fontSize="sm" textAlign="center">
          Já tem acesso?{" "}
          <Link as={RouterLink} to="/" color="#287A73" fontWeight="700">Voltar para o login</Link>
        </Text>
        <Text mt={5} color="#9AA6B4" fontSize="xs" textAlign="center">
          Demonstração: nenhuma informação será enviada ou armazenada.
        </Text>
      </Box>
    </Flex>
  );
};

export default CadastroUsuario;
