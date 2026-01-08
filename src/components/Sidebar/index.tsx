import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  Link,
  Text,
  Flex,
  IconButton,
  Collapse,
  useDisclosure,
  Drawer,
  DrawerContent,
  Icon,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Image,
  useColorModeValue,
  Divider,
  HStack,
  Badge
} from "@chakra-ui/react";
import {
  HamburgerIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@chakra-ui/icons";
import {
  MdLocalShipping,
  MdLocationOn,
  MdPeople,
  MdBuild,
  MdRadioButtonChecked,
  MdInvertColors,
  MdLocalGasStation,
  MdDescription,
  MdDriveEta,
  MdAppRegistration,
  MdDashboard,
  MdSettings,
  MdAnalytics
} from "react-icons/md";
import { IconType } from "react-icons";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/config";
import { onAuthStateChanged } from "firebase/auth";

type SidebarProps = {
  children: React.ReactNode;
};

type NavItem = {
  label: string;
  href?: string;
  icon: IconType;
  children?: NavItem[];
  badge?: string;
};

interface Usuario {
  id: string;
  nome: string;
  cpf: string;
  nascimento: string;
  email: string;
  telefone: string;
  cargo: string;
  departamento: string;
  status: string;
  tipo: string;
}

const Sidebar = ({ children }: SidebarProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [collapsed, setCollapsed] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({});
  const [username, setUsername] = useState("");
  const [userCargo, setUserCargo] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  
  // Cores harmonizadas - esquema azul/índigo profissional
  const sidebarBg = useColorModeValue("#1E293B", "#0F172A");
  const headerBg = useColorModeValue("#1E293B", "#0F172A");
  const activeBg = useColorModeValue("#3B82F6", "#2563EB");
  const hoverBg = useColorModeValue("#334155", "#1E293B");
  const textColor = useColorModeValue("#E2E8F0", "#CBD5E1");
  const activeTextColor = useColorModeValue("white", "white");
  const borderColor = useColorModeValue("#334155", "#1E293B");
  const accentColor = useColorModeValue("#3B82F6", "#60A5FA");
  const badgeBg = useColorModeValue("#10B981", "#059669");

  useEffect(() => {
    const loadUserData = () => {
      // Verificar se há um usuário autenticado
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            // Buscar dados do usuário no Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUsername(userData.nome || "Usuário");
              setUserCargo(userData.cargo || "Colaborador");
              
              // Salvar também no localStorage para compatibilidade
              localStorage.setItem("usuarioLogado", JSON.stringify({
                ...userData,
                id: user.uid
              }));
            } else {
              console.log("Documento do usuário não encontrado");
              setUsername("Usuário");
              setUserCargo("Colaborador");
            }
          } catch (error) {
            console.error("Erro ao carregar dados do usuário:", error);
            setUsername("Usuário");
            setUserCargo("Colaborador");
          }
        } else {
          // Fallback para localStorage se não estiver autenticado
          const usuarioLogadoStr = localStorage.getItem("usuarioLogado");
          if (usuarioLogadoStr) {
            try {
              const usuarioLogado: Usuario = JSON.parse(usuarioLogadoStr);
              setUsername(usuarioLogado.nome || "Usuário");
              setUserCargo(usuarioLogado.cargo || "Colaborador");
            } catch (error) {
              console.error("Erro ao carregar dados do usuário:", error);
              setUsername("Usuário");
              setUserCargo("Colaborador");
            }
          }
        }
      });

      return () => unsubscribe();
    };

    loadUserData();

    // Ouvir mudanças no localStorage
    const handleStorageChange = () => {
      const usuarioLogadoStr = localStorage.getItem("usuarioLogado");
      if (usuarioLogadoStr) {
        try {
          const usuarioLogado: Usuario = JSON.parse(usuarioLogadoStr);
          setUsername(usuarioLogado.nome || "Usuário");
          setUserCargo(usuarioLogado.cargo || "Colaborador");
        } catch (error) {
          console.error("Erro ao carregar dados do usuário:", error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Verificar a cada 5 segundos se os dados mudaram (para mesma aba)
    const interval = setInterval(() => {
      const usuarioLogadoStr = localStorage.getItem("usuarioLogado");
      if (usuarioLogadoStr) {
        try {
          const usuarioLogado: Usuario = JSON.parse(usuarioLogadoStr);
          if (usuarioLogado.nome !== username || usuarioLogado.cargo !== userCargo) {
            setUsername(usuarioLogado.nome || "Usuário");
            setUserCargo(usuarioLogado.cargo || "Colaborador");
          }
        } catch (error) {
          console.error("Erro ao carregar dados do usuário:", error);
        }
      }
    }, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [username, userCargo]);

  const toggleCollapse = () => setCollapsed(!collapsed);

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isActiveLink = (href: string) => {
    return location.pathname === href;
  };

  const handleLogout = () => {
    // Limpar dados de autenticação e localStorage
    auth.signOut().then(() => {
      localStorage.removeItem("usuarioLogado");
      window.location.href = "/";
    }).catch((error) => {
      console.error("Erro ao fazer logout:", error);
      localStorage.removeItem("usuarioLogado");
      window.location.href = "/";
    });
  };

  const navItems: NavItem[] = [
    { label: "Viagens", href: "/", icon: MdLocationOn },
    { label: "Fornecedores", href: "/fornecedores", icon: MdLocalShipping },
    { label: "Clientes", href: "/clientes", icon: MdPeople },
    {
      label: "Cadastros",
      icon: MdAppRegistration,
      children: [
        { label: "Motoristas", href: "/motoristas", icon: MdDriveEta },
        { label: "Equipamentos", href: "/equipamentos", icon: MdLocalShipping },
      ],
    },
    {
      label: "Manutenção",
      icon: MdBuild,
      children: [
        { label: "Troca de Pneu", href: "/pneus", icon: MdRadioButtonChecked },
        { label: "Troca de Óleo", href: "/trocadeoleo", icon: MdInvertColors },
        { label: "Abastecimento", href: "/gestaoabastecimento", icon: MdLocalGasStation },
        { label: "Manutenção", href: "/manutencao", icon: MdBuild },
      ],
    },
  ];

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <Box
      bg={sidebarBg}
      color={textColor}
      w={isMobile ? "full" : collapsed ? 16 : 64}
      h="full"
      borderRight="1px"
      borderColor={borderColor}
      transition="width 0.2s ease"
      overflow="hidden"
      position="relative"
      boxShadow="lg"
    >
      {!isMobile && (
        <Flex justify="flex-end" p={4} pb={2}>
          <IconButton
            icon={collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            aria-label="Toggle collapse"
            size="sm"
            onClick={toggleCollapse}
            variant="ghost"
            color={textColor}
            _hover={{ bg: hoverBg }}
          />
        </Flex>
      )}

      <VStack align="start" spacing={1} p={2}>
        {navItems.map(({ label, href, icon, children, badge }) => {
          const hasChildren = !!children;
          const isOpen = openSubmenus[label];
          const isActive = href ? isActiveLink(href) : false;

          return (
            <Box key={label} w="full">
              {hasChildren ? (
                <Flex
                  onClick={() => toggleSubmenu(label)}
                  alignItems="center"
                  px={3}
                  py={2}
                  borderRadius="lg"
                  bg={isActive ? activeBg : "transparent"}
                  _hover={{ bg: isActive ? activeBg : hoverBg }}
                  justifyContent={collapsed && !isMobile ? "center" : "flex-start"}
                  cursor="pointer"
                  transition="all 0.2s"
                  position="relative"
                >
                  <Icon
                    as={icon as React.ElementType}
                    boxSize={5}
                    mr={collapsed && !isMobile ? 0 : 3}
                    mx={collapsed && !isMobile ? "auto" : undefined}
                    color={isActive ? activeTextColor : accentColor}
                  />
                  {(!collapsed || isMobile) && (
                    <Flex align="center" w="full" justify="space-between">
                      <Text 
                        fontSize="sm" 
                        fontWeight={isActive ? "medium" : "normal"}
                        color={isActive ? activeTextColor : textColor}
                      >
                        {label}
                      </Text>
                      <Flex align="center">
                        {badge && (
                          <Badge 
                            bg={badgeBg} 
                            color="white" 
                            fontSize="xs" 
                            borderRadius="full" 
                            px={2}
                            mr={2}
                          >
                            {badge}
                          </Badge>
                        )}
                        {isOpen ? (
                          <ChevronUpIcon boxSize={3} />
                        ) : (
                          <ChevronDownIcon boxSize={3} />
                        )}
                      </Flex>
                    </Flex>
                  )}
                </Flex>
              ) : (
                <Link
                  href={href}
                  display="flex"
                  alignItems="center"
                  px={3}
                  py={2}
                  borderRadius="lg"
                  bg={isActive ? activeBg : "transparent"}
                  _hover={{ 
                    textDecoration: "none",
                    bg: isActive ? activeBg : hoverBg 
                  }}
                  justifyContent={collapsed && !isMobile ? "center" : "flex-start"}
                  position="relative"
                >
                  <Icon
                    as={icon as React.ElementType}
                    boxSize={5}
                    mr={collapsed && !isMobile ? 0 : 3}
                    mx={collapsed && !isMobile ? "auto" : undefined}
                    color={isActive ? activeTextColor : accentColor}
                  />
                  {(!collapsed || isMobile) && (
                    <Flex align="center" justify="space-between" w="full">
                      <Text 
                        fontSize="sm" 
                        fontWeight={isActive ? "medium" : "normal"}
                        color={isActive ? activeTextColor : textColor}
                      >
                        {label}
                      </Text>
                      {badge && (
                        <Badge 
                          bg={badgeBg} 
                          color="white" 
                          fontSize="xs" 
                          borderRadius="full" 
                          px={2}
                        >
                          {badge}
                        </Badge>
                      )}
                    </Flex>
                  )}
                </Link>
              )}

              {hasChildren && (isOpen || isMobile) && (
                <Collapse in={isOpen || isMobile} animateOpacity>
                  <VStack align="start" pl={collapsed && !isMobile ? 0 : 8} spacing={1} mt={1}>
                    {children!.map((child) => {
                      const isChildActive = child.href ? isActiveLink(child.href) : false;
                      return (
                        <Link
                          key={child.label}
                          href={child.href}
                          fontSize="sm"
                          color={isChildActive ? activeTextColor : "gray.400"}
                          display="flex"
                          alignItems="center"
                          w="full"
                          _hover={{ 
                            textDecoration: "none",
                            color: activeTextColor, 
                            bg: isChildActive ? activeBg : hoverBg 
                          }}
                          px={3}
                          py={2}
                          borderRadius="lg"
                          bg={isChildActive ? activeBg : "transparent"}
                          fontWeight={isChildActive ? "medium" : "normal"}
                          transition="all 0.2s"
                        >
                          <Box w="4px" h="4px" borderRadius="full" bg={accentColor} mr={2} opacity={isChildActive ? 1 : 0.5} />
                          <Icon as={child.icon as React.ElementType} boxSize={4} mr={2} opacity={0.8} />
                          <Text>{child.label}</Text>
                        </Link>
                      );
                    })}
                  </VStack>
                </Collapse>
              )}
            </Box>
          );
        })}
      </VStack>
      
      {!collapsed && !isMobile && (
        <Box position="absolute" bottom="0" width="100%" p={4}>
          <Divider borderColor={borderColor} mb={3} />
          <Flex align="center" justify="center" direction="column">
            <Text fontSize="xs" color="gray.500" textAlign="center">
              Strix_Solutions
            </Text>
            <Text fontSize="xs" color="gray.500" textAlign="center">
              © {new Date().getFullYear()} v2.1.0
            </Text>
          </Flex>
        </Box>
      )}
    </Box>
  );

  const Header = () => (
    <Box
      as="header"
      position="fixed"
      top={0}
      left={0}
      right={0}
      height="70px"
      bg={headerBg}
      color="white"
      px={6}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      zIndex={15}
      boxShadow="md"
      borderBottom="1px"
      borderColor={borderColor}
    >
      <Flex align="center" gap={4}>
        <IconButton
          display={{ base: "flex", md: "none" }}
          onClick={onOpen}
          icon={<HamburgerIcon />}
          aria-label="Abrir menu"
          size="sm"
          bg="transparent"
          color="white"
          _hover={{ bg: "blue.600" }}
        />

        <HStack spacing={4}>
          <Image
            src="/assets/tr.png"
            alt="Latino Transportadora"
            height="45px"
            objectFit="contain"
          />
          <Box 
            h="30px" 
            w="1px" 
            bg="rgba(255,255,255,0.1)" 
            display={{ base: "none", lg: "block" }} 
          />
          <Text 
            fontSize="xl" 
            fontWeight="bold" 
            display={{ base: "none", lg: "block" }}
            bgGradient="linear(to-r, blue.300, blue.400)"
            bgClip="text"
          >
          Gestão de Frota
          </Text>
        </HStack>
      </Flex>

      <Flex align="center" gap={4}>
        <Box textAlign="right" display={{ base: "none", md: "block" }}>
          <Text fontSize="sm" fontWeight="medium" color="white">
            {username || "Carregando..."}
          </Text>
          <Text fontSize="xs" color="gray.300">
            {userCargo || "Usuário"}
          </Text>
        </Box>
        <Menu>
          <MenuButton>
            <Flex align="center" gap={2}>
              <Avatar 
                name={username} 
                size="sm" 
                bg={accentColor} 
                color="white" 
                border={`2px solid ${borderColor}`}
                src={username ? undefined : "/default-avatar.png"}
              />
              {/* <Box display={{ base: "none", md: "block" }}>
                <Text fontSize="xs" fontWeight="medium" color="white">
                  {username.split(' ')[0] || "Usuário"}
                </Text>
                <Text fontSize="xs" color="gray.300">
                  {userCargo || "Cargo"}
                </Text>
              </Box> */}
            </Flex>
          </MenuButton>
          <MenuList 
            bg={sidebarBg} 
            color={textColor} 
            minW="160px" 
            py={1} 
            borderColor={borderColor}
            boxShadow="xl"
          >
            <Box px={3} py={2} borderBottom="1px" borderColor={borderColor}>
              <Text fontSize="sm" fontWeight="medium">{username}</Text>
              <Text fontSize="xs" color="gray.400">{userCargo}</Text>
            </Box>
            <MenuItem
              onClick={() => navigate("/perfil")}
              bg={sidebarBg}
              _hover={{ bg: hoverBg }}
              fontSize="sm"
              px={4}
              py={2}
            >
              Meu Perfil
            </MenuItem>
            <MenuItem
              onClick={handleLogout}
              bg={sidebarBg}
              _hover={{ bg: hoverBg }}
              fontSize="sm"
              px={4}
              py={2}
            >
              Sair
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>
    </Box>
  );

  return (
    <Box minH="100vh" bg="gray.500">
      <Header />
      <Box
        display={{ base: "none", md: "block" }}
        pos="fixed"
        left={0}
        top="70px"
        h="calc(100vh - 70px)"
        zIndex={10}
        boxShadow="xl"
      >
        <SidebarContent />
      </Box>

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerContent maxW="64" p={0} bg={sidebarBg}>
          <SidebarContent isMobile />
        </DrawerContent>
      </Drawer>

      <Box
        ml={{ base: 0, md: collapsed ? 16 : 64 }}
        pt="70px"
        p={6}
        transition="margin-left 0.2s ease"
        minH="calc(100vh - 70px)"
      >
        <Box>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;