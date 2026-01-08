import React, { useState, useEffect } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton, Button,
  FormControl, FormLabel, Input, useToast
} from "@chakra-ui/react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (transacao: {
    data: string;
    descricao: string;
    valor: number;
    responsavel: string;
    tipo: "Adiantamento";
  }) => void;
}

const ModalAdiantamento: React.FC<Props> = ({ isOpen, onClose, onSalvar }) => {
  const toast = useToast();

  // Data inicial formatada para yyyy-MM-dd (input type=date requer esse formato)
  const getDataAtualFormatada = () => {
    const hoje = new Date();
    return hoje.toISOString().slice(0, 10);
  };

  const [data, setData] = useState(getDataAtualFormatada());
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [responsavel, setResponsavel] = useState("");

  // Sempre que abrir o modal, resetar os campos e data para hoje
  useEffect(() => {
    if (isOpen) {
      setData(getDataAtualFormatada());
      setDescricao("");
      setValor("");
      setResponsavel("");
    }
  }, [isOpen]);

 const handleSalvar = () => {
  if (!data || !descricao || !valor || !responsavel) {
    toast({
      title: "Preencha todos os campos",
      status: "warning",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  const valorNumerico = Number(
    valor.replace(/\s/g, "")
         .replace("R$", "")
         .replace(/\./g, "")
         .replace(",", ".")
  );

  if (isNaN(valorNumerico) || valorNumerico <= 0) {
    toast({
      title: "Valor inválido",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  onSalvar({
    data: new Date(data).toISOString(),
    descricao,
    valor: valorNumerico,
    responsavel,
    tipo: "Adiantamento",
  });


  setData("");
  setDescricao("");
  setValor("");
  setResponsavel("");
  onClose();
};



  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Registrar Novo Adiantamento</ModalHeader>
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
              placeholder="Ex: Adiantamento de combustível"
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
              placeholder="Ex: João Motorista"
              value={responsavel}
              onChange={(e) => setResponsavel(e.target.value)}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose} mr={3}>
            Cancelar
          </Button>
          <Button colorScheme="blue" onClick={handleSalvar}>
            Salvar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalAdiantamento;

