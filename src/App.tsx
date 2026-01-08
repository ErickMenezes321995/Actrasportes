import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { RoutesApp } from "./routes";
import Sidebar from "./components/Sidebar";

function AppContent() {
  const location = useLocation();

  const isLoginPage = location.pathname === "/";

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
        <AppContent />
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;


