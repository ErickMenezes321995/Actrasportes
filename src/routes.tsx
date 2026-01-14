import React from "react";
import { Routes, Route } from "react-router-dom";

import Viagens from "../src/pages/viagens/index";
import Motoristas from "./pages/motoristas";
import Equipamentos from "./pages/equipamentos/index";
import Historico from "./pages/historicoviagens/index";
import Clientes from "./pages/clientes/index";
import Fornecedores from "./pages/fornecedores/index";
import GestaoPneus from "./pages/pneus/index";
import Trocadeoleo from "./pages/oleo/index";
import GestaoAbastecimento from "./pages/abastecimento";
import Preventiva from "./pages/manutencao/index";
// import Corretiva from "./pages/corretivas/index";
import Relatorio from "./pages/relatorio/index";
import Login from "./pages/login/index";
import { PrivateRoute } from "./PrivateRoute";
import Perfil from "./pages/perfil";
import CadastroUsuario from "./components/cadastro/CadastroUsuario";
import Rota from "./pages/Rota/Index"

export const RoutesApp = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/viagens" element={<PrivateRoute><Viagens /></PrivateRoute>} />
      <Route path="/motoristas" element={<PrivateRoute><Motoristas /></PrivateRoute>} />
      <Route path="/equipamentos" element={<PrivateRoute><Equipamentos /></PrivateRoute>} />
      <Route path="/historico/:id" element={<PrivateRoute><Historico /></PrivateRoute>} />
      <Route path="/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />
      <Route path="/fornecedores" element={<PrivateRoute><Fornecedores /></PrivateRoute>} />
      <Route path="/pneus" element={<PrivateRoute><GestaoPneus /></PrivateRoute>} />
      <Route path="/trocadeoleo" element={<PrivateRoute><Trocadeoleo /></PrivateRoute>} />
      <Route path="/gestaoabastecimento" element={<PrivateRoute><GestaoAbastecimento /></PrivateRoute>} />
      <Route path="/manutencao" element={<PrivateRoute><Preventiva /></PrivateRoute>} />
      {/* <Route path="/corretiva" element={<PrivateRoute><Corretiva /></PrivateRoute>} /> */}
      <Route path="/relatorio" element={<PrivateRoute><Relatorio /></PrivateRoute>} />
      <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
      <Route path="/cadastro-usuario" element={<CadastroUsuario />} />
      <Route path="/rota/:id" element={<Rota />}/>
    </Routes>
  );
};


