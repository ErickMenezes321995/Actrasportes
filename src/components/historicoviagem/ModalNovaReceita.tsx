import React, { useState } from "react";
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
} from "@chakra-ui/react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (receita: {
    data: string;
    descricao: string;
    valor: number;
    responsavel: string;
    tipo: "Receita";
  }) => void;
}

const ModalNovaReceita: React.FC<Props> = ({ isOpen, onClose, onSalvar }) => {
  const toast = useToast();

  const [data, setData] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [responsavel, setResponsavel] = useState("");

  const handleSalvar = () => {
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

  onSalvar({
    data,
    descricao,
    valor: valorNum,
    responsavel,
    tipo: "Receita",
  });


  setData("");
  setDescricao("");
  setValor("");
  setResponsavel("");
  onClose();
};


  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Nova Receita</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl mb={3}>
            <FormLabel>Data</FormLabel>
            <Input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Descrição</FormLabel>
            <Input
              placeholder="Descrição da receita"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Valor</FormLabel>
           <Input
              type="text"
              placeholder="R$ 0,00"
              value={valor}
              onChange={(e) => {
                let v = e.target.value;

                v = v.replace(/\D/g, "");

                v = (Number(v) / 100).toFixed(2);

                v = "R$ " + v.replace(".", ",");

                setValor(v);
              }}
            />

          </FormControl>
          <FormControl>
            <FormLabel>Responsável</FormLabel>
            <Input
              placeholder="Nome do responsável"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleSalvar}>
            Salvar
          </Button>
          <Button onClick={onClose} variant="ghost">
            Cancelar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalNovaReceita;
