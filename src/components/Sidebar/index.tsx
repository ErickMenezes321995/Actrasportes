import React, { useEffect, useState } from "react";
import {
  Box, VStack, Link, Text, Flex, IconButton, Collapse, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Badge,
  Drawer, DrawerContent, DrawerOverlay, DrawerCloseButton, Icon, Avatar,
  Menu, MenuButton, MenuList, MenuItem, Image, HStack, Tooltip, Button,
} from "@chakra-ui/react";
import { HamburgerIcon, ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon } from "@chakra-ui/icons";
import {
  MdLocalShipping, MdLocationOn, MdPeople, MdBuild, MdRadioButtonChecked,
  MdInvertColors, MdLocalGasStation, MdDriveEta, MdAppRegistration, MdSettings,
  MdLogout, MdPersonOutline,
} from "react-icons/md";
import { IconType } from "react-icons";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { getStoredUser } from "../../auth/userStorage";


type SidebarProps = {
  children: React.ReactNode;
};

type NavItem = {
  label: string;
  href?: string;
  icon: IconType;
  children?: NavItem[];
  badge?: string;
  disabled?: boolean;
};

const Sidebar = ({ children }: SidebarProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isAnnouncementOpen, onOpen: openAnnouncement, onClose: closeAnnouncement } = useDisclosure();
  const [collapsed, setCollapsed] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({});
  const [username, setUsername] = useState("");
  const [userCargo, setUserCargo] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  
  const sidebarBg = "#101E32";
  const borderColor = "whiteAlpha.100";
  const hoverBg = "whiteAlpha.100";

  useEffect(() => {
    if (sessionStorage.getItem("strixAnnouncementAfterLogin") !== "true") return;

    sessionStorage.removeItem("strixAnnouncementAfterLogin");
    openAnnouncement();
  }, [openAnnouncement]);

  useEffect(() => {
    if (!isAnnouncementOpen) return;

    const timeoutId = window.setTimeout(closeAnnouncement, 15000);
    return () => window.clearTimeout(timeoutId);
  }, [isAnnouncementOpen, closeAnnouncement]);

  useEffect(() => {
    const syncUser = () => {
      try {
        const usuario = getStoredUser<{ nome?: string; cargo?: string; email?: string }>() || {};
        setUsername(usuario.nome || "Usu�rio"); setUserCargo(usuario.cargo || "Colaborador"); setUserEmail(usuario.email || "");
      } catch { setUsername("Usu�rio"); setUserCargo("Colaborador"); setUserEmail(""); }
    };
    syncUser(); window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);
  const toggleCollapse = () => setCollapsed(!collapsed);

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isActiveLink = (href: string) => {
    return location.pathname.toLowerCase() === href.toLowerCase();
  };

  const handleLogout = () => {
    logout();
  };

  const navItems: NavItem[] = [
    { label: "Viagens", href: "/Viagens", icon: MdLocationOn },
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
    { label: "Configuração", href: "/configuracao", icon: MdSettings },
  ];

  const allLinks = navItems.flatMap((item) => item.children || [item]);
  const currentItem = allLinks.find((item) => item.href && isActiveLink(item.href));
  const pageTitle = currentItem?.label || (
    location.pathname.startsWith("/historico") ? "Histórico da viagem" :
    location.pathname.startsWith("/rota") ? "Rota da viagem" :
    location.pathname === "/perfil" ? "Meu perfil" :
    location.pathname === "/relatorio-viagens" ? "Relatório de viagens" :
    location.pathname === "/relatorio" ? "Relatórios" :
    location.pathname === "/cadastro-usuario" ? "Cadastro de usuário" : "Gestão de frota"
  );
  const sidebarWidth = collapsed ? "88px" : "272px";

  const renderSidebar = (isMobile = false) => {
    const compact = collapsed && !isMobile;
    return (
      <Flex direction="column" h="full" bg={sidebarBg} color="#A9B8CF"
        bgGradient="linear(to-b, #162840, #0C1728)" overflow="hidden">
        <Flex h="88px" minH="88px" align="center" px={compact ? 4 : 6} gap={3}
          borderBottom="1px solid" borderColor={borderColor}>
          <Flex align="center" justify="center" bg="white" borderRadius="14px"
            w={compact ? "56px" : "64px"} h="44px" flexShrink={0} p={2}>
            <Image src="/assets/actransporte.png" alt="AC Transportes" maxH="32px" objectFit="contain" />
          </Flex>
          {!compact && <Box><Text color="white" fontSize="sm" fontWeight="800" letterSpacing="-.3px">AC Transportes</Text>
            <Text fontSize="10px" letterSpacing="2px" color="#7F95B3" mt={1}>GESTÃO DE FROTA</Text></Box>}
        </Flex>
        <Box as="nav" aria-label="Navegação principal" flex="1" overflowY="auto" px={compact ? 3 : 4} py={6}
          sx={{ scrollbarWidth: "thin", scrollbarColor: "#34445b transparent" }}>
          <Text fontSize="10px" fontWeight="700" letterSpacing="2px" color="#7187A4"
            px={3} mb={4} textAlign={compact ? "center" : "left"}>{compact ? "•••" : "NAVEGAÇÃO"}</Text>
          <VStack align="stretch" spacing={2}>
            {navItems.map((item) => {
              const active = Boolean(item.href && isActiveLink(item.href)) || Boolean(item.children?.some((child) => child.href && isActiveLink(child.href)));
              const expanded = openSubmenus[item.label] ?? active;
              const content = <>
                <Icon as={item.icon as React.ElementType} boxSize={5} flexShrink={0} color={active ? "#8CBFFF" : "#829AB9"} />
                {!compact && <><Text flex="1" textAlign="left" fontSize="13px" fontWeight={active ? "600" : "500"}>{item.label}</Text>
                  {item.children && <ChevronDownIcon transform={expanded ? "rotate(180deg)" : undefined} transition="transform .2s" />}
                  {active && !item.children && <Box boxSize="5px" borderRadius="full" bg="#8CBFFF" />}</>}
              </>;
              const shared = {
                display: "flex", alignItems: "center", gap: 3, w: "full", minH: "46px", px: 3,
                borderRadius: "12px", color: active ? "white" : "#A9B8CF",
                bg: active ? "rgba(86, 150, 238, .15)" : "transparent",
                boxShadow: active ? "inset 0 0 0 1px rgba(132,182,255,.14)" : "none",
                justifyContent: compact ? "center" : "flex-start",
                transition: "background .2s, color .2s", _hover: { bg: hoverBg, color: "white", textDecoration: "none" },
                _focusVisible: { outline: "2px solid #8CBFFF", outlineOffset: "2px" },
              };
              return <Box key={item.label}>
                <Tooltip label={item.label} placement="right" isDisabled={!compact} hasArrow>
                  {item.children ? <Button {...shared} variant="unstyled" aria-label={item.label}
                    aria-expanded={!compact && expanded}
                    onClick={() => { if (compact) { setCollapsed(false); setOpenSubmenus((prev) => ({ ...prev, [item.label]: true })); } else toggleSubmenu(item.label); }}>
                    {content}</Button> : <Link {...shared} as={RouterLink} to={item.href}
                      aria-label={item.label} aria-current={active ? "page" : undefined} onClick={onClose}>{content}</Link>}
                </Tooltip>
                {item.children && !compact && <Collapse in={expanded} animateOpacity>
                  <VStack align="stretch" spacing={1} ml={5} pl={4} mt={2} mb={1} borderLeft="1px solid" borderColor="whiteAlpha.200">
                    {item.children.map((child) => {
                      const childActive = Boolean(child.href && isActiveLink(child.href));
                      return <Link key={child.label} as={RouterLink} to={child.href} onClick={onClose}
                        aria-current={childActive ? "page" : undefined} display="flex" alignItems="center" gap={2.5}
                        px={3} py={2.5} borderRadius="10px" fontSize="12px" fontWeight={childActive ? "600" : "400"}
                        color={childActive ? "#B9D7FF" : "#8FA3BD"} bg={childActive ? "whiteAlpha.100" : "transparent"}
                        _hover={{ textDecoration: "none", color: "white", bg: hoverBg }}>
                        <Icon as={child.icon as React.ElementType} boxSize={4} />{child.label}</Link>;
                    })}
                  </VStack>
                </Collapse>}
              </Box>;
            })}
          </VStack>
        </Box>
        <Box p={compact ? 3 : 4} borderTop="1px solid" borderColor={borderColor}>
          {!compact && <Flex align="center" gap={3} p={3} mb={3} borderRadius="12px" bg="whiteAlpha.50">
            <Avatar name={username || "Usuário"} size="sm" bg="#284D78" color="#C9E0FF" />
            <Box minW={0}><Text fontSize="12px" fontWeight="600" color="#E7EEF9" noOfLines={1}>{username || "Usuário"}</Text>
              <Text fontSize="11px" color="#829AB9" noOfLines={1}>{userCargo || "Colaborador"}</Text></Box>
          </Flex>}
          {!isMobile && <Button onClick={toggleCollapse} variant="ghost" w="full" size="sm" color="#8FA3BD"
            leftIcon={collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />} aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            _hover={{ bg: hoverBg, color: "white" }}>{!compact && "Recolher menu"}</Button>}
          {!compact && <Text mt={3} fontSize="10px" textAlign="center" color="#647D9C">Strix Solutions · © {new Date().getFullYear()}</Text>}
        </Box>
      </Flex>
    );
  };

  return (
    <Box minH="100vh" bg="#F3F6FA">
      <Box as="aside" display={{ base: "none", md: "block" }} position="fixed" inset="0 auto 0 0"
        w={sidebarWidth} transition="width .2s ease" zIndex={20} borderRight="1px solid #1E3048">
        {renderSidebar()}
      </Box>
      <Flex as="header" position="fixed" top={0} left={{ base: 0, md: sidebarWidth }} right={0}
        h="88px" px={{ base: 4, lg: 8 }} align="center" justify="space-between" gap={3}
        bg="rgba(255,255,255,.94)" backdropFilter="blur(16px)" borderBottom="1px solid #E5EBF3"
        zIndex={15} transition="left .2s ease">
        <HStack spacing={{ base: 3, lg: 4 }} minW={0}>
          <IconButton display={{ base: "inline-flex", md: "none" }} onClick={onOpen}
            icon={<HamburgerIcon />} aria-label="Abrir menu" variant="ghost" color="#314B6D" />
          <Box minW={0}>
            <HStack spacing={1.5} color="#8290A6" fontSize="11px" mb={1} display={{ base: "none", sm: "flex" }}>
              <Text>Painel</Text><ChevronRightIcon boxSize={3} /><Text color="#526780">Gestão de frota</Text>
            </HStack>
            <Text as="h1" fontSize={{ base: "md", lg: "xl" }} fontWeight="700" letterSpacing="-.5px" color="#172B46" noOfLines={1}>{pageTitle}</Text>
          </Box>
        </HStack>
        <HStack spacing={{ base: 2, lg: 5 }} flexShrink={0}>
          <Box display={{ base: "none", xl: "block" }} textAlign="right" pr={5} borderRight="1px solid #E5EBF3">
            <Text fontSize="11px" color="#8190A5" mb={1}>AC TRANSPORTES</Text>
            <Text fontSize="12px" color="#455D7B" fontWeight="500">Gestão que move o seu negócio</Text>
          </Box>
          <Menu placement="bottom-end">
            <MenuButton as={Button} variant="ghost" h="auto" p={2} borderRadius="14px"
              aria-label="Abrir menu da conta" _hover={{ bg: "#F1F5FA" }} _active={{ bg: "#E9EFF7" }}>
              <HStack spacing={3}>
                <Avatar name={username || "Usuário"} size="sm" bg="#E7EFFB" color="#315F9B" border="1px solid #D8E5F5" />
                <Box display={{ base: "none", lg: "block" }} textAlign="left" maxW="160px">
                  <Text fontSize="12px" fontWeight="600" color="#243B58" noOfLines={1}>{username || "Usuário"}</Text>
                  <Text mt={1} fontSize="11px" fontWeight="400" color="#8190A5" noOfLines={1}>{userCargo || "Colaborador"}</Text>
                </Box>
                <ChevronDownIcon color="#8190A5" boxSize={4} />
              </HStack>
            </MenuButton>
            <MenuList p={2} borderRadius="16px" borderColor="#E5EBF3" boxShadow="0 16px 48px rgba(18,40,70,.14)" color="#243B58">
              <Box px={3} py={3} mb={1} borderBottom="1px solid #EDF1F7">
                <Text fontSize="sm" fontWeight="600">{username || "Minha conta"}</Text>
                <Text fontSize="xs" color="#8190A5" mt={1} maxW="240px" noOfLines={1}>{userEmail || userCargo}</Text>
              </Box>
              <MenuItem icon={<Icon as={MdPersonOutline as React.ElementType} />} borderRadius="9px" fontSize="sm" onClick={() => navigate("/perfil")}>Meu perfil</MenuItem>
              <MenuItem icon={<Icon as={MdSettings as React.ElementType} />} borderRadius="9px" fontSize="sm" onClick={() => navigate("/configuracao")}>Configurações</MenuItem>
              <MenuItem icon={<Icon as={MdLogout as React.ElementType} />} borderRadius="9px" fontSize="sm" color="#C34E55" onClick={handleLogout}>Sair da conta</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay bg="blackAlpha.500" backdropFilter="blur(3px)" />
        <DrawerContent maxW="300px" bg={sidebarBg}>
          <DrawerCloseButton color="white" top="92px" right={3} zIndex={1} />
          {renderSidebar(true)}
        </DrawerContent>
      </Drawer>
      <Box as="main" ml={{ base: 0, md: sidebarWidth }} pt="88px" minH="100vh" transition="margin-left .2s ease">
        <Box p={{ base: 4, lg: 6 }}>{children}</Box>
      </Box>

      <Modal isOpen={isAnnouncementOpen} onClose={closeAnnouncement} isCentered size="md">
        <ModalOverlay bg="rgba(10, 27, 40, .58)" backdropFilter="blur(5px)" />
        <ModalContent maxW="520px" mx={4} borderRadius="24px" overflow="hidden"
          border="1px solid #E3EBF2" boxShadow="0 28px 80px rgba(9, 29, 47, .28)">
          <ModalHeader position="absolute" top={0} right={0} p={3} zIndex={1}>
            <ModalCloseButton position="static" color="#7890A4" borderRadius="full" _hover={{ bg: "#F0F4F7" }} />
          </ModalHeader>
          <ModalBody px={{ base: 6, md: 9 }} py={{ base: 8, md: 10 }} textAlign="center">
            <Badge colorScheme="teal" borderRadius="full" px={3} py={1} fontSize="10px" letterSpacing="1.2px">
              VISUAL RENOVADO
            </Badge>
            <Text mt={4} color="#1B344B" fontSize={{ base: "xl", md: "2xl" }} fontWeight="800" letterSpacing="-.6px">
              Uma nova experi&ecirc;ncia para voc&ecirc;
            </Text>
            <Text mt={3} color="#718397" fontSize="sm" lineHeight="1.8">
              A plataforma Strix Solutions est&aacute; com um visual renovado: mais moderno, leve e f&aacute;cil de usar. Explore as novidades e aproveite essa nova experi&ecirc;ncia!
            </Text>
            <Text mt={5} color="#9AA8B6" fontSize="xs">
              Este aviso fecha automaticamente em 15 segundos.
            </Text>
            <Button mt={6} w="full" h="46px" borderRadius="12px" bg="#176D68" color="white"
              fontWeight="700" _hover={{ bg: "#125B57" }} onClick={closeAnnouncement}>
              Continuar para a plataforma
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Sidebar;
