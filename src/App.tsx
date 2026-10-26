import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { RoutesApp } from "./routes";
import Sidebar from "./components/Sidebar";
import { AuthProvider } from "./auth/AuthContext";

function AppContent() {
  const location = useLocation();

  const isLoginPage = location.pathname === "/" || location.pathname === "/login" || location.pathname === "/cadastro-usuario";

  return isLoginPage ? (
    <RoutesApp />
  ) : (
    <Sidebar>
      <RoutesApp />
    </Sidebar>
  );
}

function App() {
  return (
    <ChakraProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;


