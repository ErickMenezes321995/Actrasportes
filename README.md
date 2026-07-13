Documentação do Sistema de Gestão de Frota
1. Resumo do Projeto
1.1. Visão Geral
O Sistema de Gestão de Frota é uma aplicação web full-stack desenvolvida para gerenciar operações logísticas de transporte, incluindo controle de viagens, veículos, motoristas, manutenções e despesas financeiras.

1.2. Arquitetura
text
Arquitetura Cliente-Servidor (REST API)
├── Frontend (React + TypeScript + Chakra UI)
├── Backend (Node.js/Express - API REST)
├── Banco de Dados (Firebase Firestore)
└── Autenticação (Firebase Auth)
1.3. Tecnologias Principais
Camada	Tecnologias
Frontend	React 18, TypeScript, Chakra UI, React Router DOM, Axios, Leaflet (mapas), Recharts (gráficos), jsPDF
Backend	Node.js, Express, Firebase Admin SDK
Banco de Dados	Firebase Firestore (NoSQL)
Autenticação	Firebase Authentication
Rotas	React Router DOM v6
2. Estrutura de Diretórios
text
src/
├── firebase/
│   └── config.ts                 # Configuração do Firebase
├── components/
│   ├── abasteciemento/           # Módulo de Abastecimento
│   ├── clientes/                 # Módulo de Clientes
│   ├── fornecedores/             # Módulo de Fornecedores
│   ├── historicoviagem/          # Módulo de Histórico de Viagem
│   ├── manutencao/               # Módulo de Manutenção Preventiva
│   ├── modalviagem/              # Módulo de Viagens (CRUD e Início)
│   ├── modalmotorista/           # Módulo de Motoristas
│   ├── modalequipamento/         # Módulo de Caminhões
│   ├── oleo/                     # Módulo de Troca de Óleo
│   ├── pneus/                    # Módulo de Troca de Pneus
│   ├── pagamentos/               # Módulo de Pagamentos/Assinatura
│   └── ...
├── pages/
│   ├── abastecimento/            # Página Gestão de Abastecimentos
│   ├── cliente/                  # Página Gestão de Clientes
│   ├── fornecedor/               # Página Gestão de Fornecedores
│   ├── historico/                # Página de Histórico de Viagem
│   ├── preventiva/               # Página de Manutenção Preventiva
│   ├── viagem/                   # Página de Gestão de Viagens
│   ├── motorista/                # Página de Motoristas
│   ├── equipamento/              # Página de Caminhões
│   ├── oleo/                     # Página de Troca de Óleo
│   ├── pneus/                    # Página de Troca de Pneus
│   ├── perfil/                   # Página de Perfil do Usuário
│   └── login/                    # Página de Login
├── routes/
│   └── AppRoutes.tsx             # Configuração de Rotas
├── App.tsx                       # Componente Principal
└── index.tsx                     # Ponto de Entrada
3. Módulos Principais
3.1. Módulo de Autenticação (pages/login/)
Responsável por: Autenticação de usuários, controle de acesso e recuperação de senha.

Principais Funcionalidades:
Login com e-mail e senha (Firebase Auth)

Verificação de status do usuário (ativo/inativo no Firestore)

Recuperação de senha

Redirecionamento pós-login

Loading state com overlay

Estado:
typescript
const [email, setEmail] = useState("");
const [senha, setSenha] = useState("");
const [erro, setErro] = useState<string>("");
const [isLoading, setIsLoading] = useState(false);
const [inactiveUser, setInactiveUser] = useState<{ ... } | null>(null);
const { isOpen: isResetOpen, onOpen: onResetOpen, onClose: onResetClose } = useDisclosure();
Fluxo:
Usuário insere credenciais

signInWithEmailAndPassword autentica no Firebase

getUserById(uid) busca dados no Firestore

Verifica userData.status

Se ativo → Salva no localStorage e redireciona para /Viagens

Se inativo → Exibe erro e link para renovar assinatura

3.2. Módulo de Viagens (pages/viagem/)
Responsável por: CRUD completo de viagens, status e iniciação.

Interfaces:
typescript
type StatusViagem = "Pendente" | "Em andamento" | "Concluída" | "Cancelada";

interface Viagem {
  id: number;
  origem: string;
  destino: string; 
  motorista: string;
  viatura: string;
  dataInicio: string;
  dataTermino: string;
  status: StatusViagem;
  odometro?: number;
}
Funcionalidades:
Listagem de viagens com status (Pendente, Em andamento, Concluída, Cancelada)

Criação de nova viagem com modal NovaViagemModal

Edição de viagem com EditarViagemModal

Início de viagem com SelecionarMotoristaEquipamentoModal

Exclusão de viagens (apenas Pendente/Concluída)

Visualização mobile responsiva

Navegação para rota e histórico

Lógica de Status:
Pendente → Pode ser iniciada → Vai para "Em andamento"

Em andamento → Pode ser visualizada, editada e finalizada

Concluída → Pode ser visualizada e deletada

Cancelada → Apenas visualização

3.3. Módulo de Histórico de Viagem (pages/historico/)
Responsável por: Exibição detalhada de uma viagem, transações financeiras e relatórios.

Interfaces:
typescript
type TipoTransacao = "Receita" | "Despesa" | "Adiantamento";

interface Transacao {
  id: number;
  data: string;
  descricao: string;
  tipo: TipoTransacao;
  valor: number;
  responsavel: string;
}

interface Viagem {
  id: number;
  origem: string;
  destino: string;
  status: "Pendente" | "Em andamento" | "Concluída" | "Cancelada";
  transacoes: Transacao[];
}
Funcionalidades:
Exibição de dados da viagem (origem, destino, motorista, etc.)

Cards de resumo financeiro (Receitas, Despesas, Saldo)

Lista de transações com CRUD (Receitas, Despesas, Adiantamentos)

Filtro por tipo de transação

Finalizar viagem

Exportar relatório PDF com jsPDF

Botão "Visualizar Rota" para navegar até o mapa

3.4. Módulo de Caminhões (pages/equipamento/)
Responsável por: CRUD completo de veículos.

Interfaces:
typescript
interface Caminhao {
  id: number;
  placa: string;
  modelo: string;
  ano: string;
  renavam: string;
  chassi: string;
  status: string;
  cor?: string;
  tipoCombustivel?: string;
  quilometragemAtual?: number;
  documentacao?: Documentacao;
  // ... outros campos
}
Funcionalidades:
Listagem com Status Tag

Cadastro com NovoCaminhaoModal

Edição com EditarCaminhaoModal

Visualização de detalhes com DetalhesCaminhaoModal

Normalização de IDs para compatibilidade (trabalha com id e _id)

3.5. Módulo de Motoristas (pages/motorista/)
Responsável por: CRUD completo de motoristas.

Interfaces:
typescript
interface Motorista {
  id: number;
  nome: string;
  telefone: string;
  cnh: string;
  email: string;
  cpf: string;
  rg: string;
  validadeCnh: string;
  endereco: string;
  status: string;
}
Funcionalidades:
Listagem com Status Tag

Cadastro com NovaMotoristaModal

Edição com EditarMotoristaModal

Exclusão de motoristas

3.6. Módulo de Abastecimentos (pages/abastecimento/)
Responsável por: Controle de abastecimentos de veículos.

Interfaces:
typescript
interface Abastecimento {
  id: string;
  caminhaoId: string | CaminhaoInfo;
  data: string;
  litros: number;
  valorLitro: number;
  valorTotal: number;
  posto: string;
  odometro: number;
  tipoCombustivel: string;
  status?: string;
}
Funcionalidades:
Listagem com valores monetários formatados

Cálculo automático do valor total

Dashboard analítico com ModalDashboardAbastecimentoAnalitico

3.7. Módulo de Manutenção Preventiva (pages/preventiva/)
Responsável por: Planejamento e histórico de manutenções.

Interfaces:
typescript
interface ManutencaoPreventiva {
  id: string;
  caminhaoId: string | CaminhaoInfo;
  data: string;
  tipo: string;
  quilometragem: number;
  oficina: string;
  custo: number;
  proximaRevisao: string;
  status: string;
}
Funcionalidades:
Listagem com Status Tag (Concluída, Agendada, Cancelada, Atrasada)

Dashboard com Dashboardprev

3.8. Módulo de Troca de Óleo (pages/oleo/)
Responsável por: Controle de trocas de óleo.

Interfaces:
typescript
interface TrocaOleo {
  id: string;
  caminhaoId: any;
  dataTroca: string;
  quilometragem: number;
  tipoOleo: string;
  status: string;
}
Funcionalidades:
Listagem com Status Tag

Dashboard analítico

3.9. Módulo de Troca de Pneus (pages/pneus/)
Responsável por: Controle de trocas de pneus.

Interfaces:
typescript
interface Pneu {
  id: string;
  caminhaoId: string;
  codigoPneu: string;
  dataTroca: string;
  posicao: string;
  marca: string;
  valor: number;
  tipo: string;
}
3.10. Módulo de Clientes (pages/cliente/)
Responsável por: Cadastro e gerenciamento de clientes.

Interfaces:
typescript
export interface Cliente {
  id: number;
  nome: string;
  cnpj: string;
  cidade: string;
  estado: string;
  email: string;
  telefone: string;
  status: string;
}
3.11. Módulo de Fornecedores (pages/fornecedor/)
Responsável por: Cadastro e gerenciamento de fornecedores.

Interfaces:
typescript
interface Fornecedor {
  id: number;
  nomeFantasia: string;
  email: string;
  telefone: string;
  status: string;
}
3.12. Módulo de Perfil (pages/perfil/)
Responsável por: Gerenciamento de perfil do usuário e alteração de senha.

Funcionalidades:
Exibição de dados do usuário

Edição de perfil

Alteração de senha

Renovação de assinatura

3.13. Módulo de Mapas (components/map/Index.tsx)
Responsável por: Visualização de rotas em mapa interativo.

Tecnologias:
react-leaflet e leaflet

Funcionalidades:
Roteamento com OSRM (Open Source Routing Machine)

Marcadores personalizados

Legenda de status

Display de distância percorrida/total

4. Componentes de UI e Modal
Componente	Descrição
NovaViagemModal	Modal para criar nova viagem
EditarViagemModal	Modal para editar viagem
SelecionarMotoristaEquipamentoModal	Modal para iniciar viagem
NovoCaminhaoModal	Modal para cadastrar caminhão
EditarCaminhaoModal	Modal para editar caminhão
DetalhesCaminhaoModal	Modal para ver detalhes do caminhão
NovaMotoristaModal	Modal para cadastrar motorista
EditarMotoristaModal	Modal para editar motorista
NovoClienteModal	Modal para cadastrar cliente
EditarClienteModal	Modal para editar cliente
NovoFornecedorModal	Modal para cadastrar fornecedor
NovoCombustivelModal	Modal para novo abastecimento
EditarAbastecimentoModal	Modal para editar abastecimento
NovoManutencaoModal	Modal para nova manutenção
EditarManutencaoModal	Modal para editar manutenção
NovoOleoModal	Modal para nova troca de óleo
EditarOleoModal	Modal para editar troca de óleo
NovoPneuModal	Modal para novo pneu
EditarPneuModal	Modal para editar pneu
DetalhesPneuModal	Modal para detalhes do pneu
ModalPagamento	Modal para assinatura/renovação
ModalAdiantamento	Modal para adiantamento financeiro
ModalNovaReceita	Modal para nova receita
ModalNovaDespesa	Modal para nova despesa
ModalDashboard...	Modais de dashboard analítico
5. Serviços e Integrações
5.1. Serviços (services/)
userService.ts: Função getUserById para buscar dados do usuário no Firestore

5.2. Integrações Externas
Integração	Finalidade
Firebase Auth	Autenticação de usuários
Firebase Firestore	Banco de dados NoSQL
OSRM	Cálculo de rotas e distâncias
Google Maps / OpenStreetMap	Renderização de mapas
jsPDF	Geração de relatórios PDF
6. Rotas da Aplicação (routes/AppRoutes.tsx)
Rota	Componente	Descrição
/	Navigate to /login	Redireciona para login
/login	LoginPage	Página de login
/Viagens	GestaoViagens	Gestão de viagens
/Viagens/:id	Mapa	Mapa de rota da viagem
/historico/:id	Historico	Histórico da viagem
/Equipamento	GestaoCaminhoes	Gestão de caminhões
/Motorista	GestaoMotoristas	Gestão de motoristas
/Abastecimento	GestaoCombustiveis	Gestão de abastecimentos
/Oleo	GestaoTrocaOleo	Gestão de trocas de óleo
/Pneu	GestaoPneus	Gestão de trocas de pneus
/Preventiva	GestaoManutencaoPreventiva	Gestão de manutenção
/Cliente	GestaoClientes	Gestão de clientes
/Fornecedor	GestaoFornecedores	Gestão de fornecedores
/Perfil	Perfil	Perfil do usuário
7. Gerenciamento de Estado
7.1. Hooks Principais:
useState: Gerenciamento de estado local

useEffect: Efeitos colaterais (chamadas API, autenticação)

useCallback: Memoização de funções

useDisclosure: Gerenciamento de modais

useNavigate: Navegação programática

useParams: Captura de parâmetros de URL

useToast: Notificações

7.2. Estados Comuns:
typescript
// Lista de itens
const [items, setItems] = useState<ItemType[]>([]);

// Item selecionado
const [selectedItem, setSelectedItem] = useState<ItemType | null>(null);

// Loading
const [isLoading, setIsLoading] = useState(true);

// Modals
const { isOpen, onOpen, onClose } = useDisclosure();

// Toast notifications
const toast = useToast();
8. Estilo e Temas
8.1. Chakra UI
Tema customizado extjsTheme no módulo de Perfil

Componentes estilizados com paleta de cores consistente

8.2. Paleta de Cores
Cor	Uso
#15457b	Azul principal (headers, ícones)
#dfeaf5	Fundo de cabeçalhos
#a3bde3	Bordas
#e6f4e6 / #2a6b2a	Status Ativo/Concluído
#f9e6e6 / #a33d3d	Status Inativo/Cancelado
#fef0e6 / #b35926	Status Pendente
#e6f0f5 / #1f5c7a	Status Em andamento
8.3. Status Tags
Função StatusTag centralizada para renderização de status em todos os módulos.

9. Padrões de Desenvolvimento
9.1. Padrões de Código:
Nomenclatura: Nomes descritivos em inglês para variáveis e funções

Estrutura: Páginas em pages/, componentes em components/

Modais: Componentes modais reutilizáveis para CRUD

Toast: Feedback de ações ao usuário

9.2. Fluxo CRUD:
Listar: GET → Armazena em estado → Renderiza

Criar: Modal → POST → Atualiza lista

Editar: Modal → PUT → Atualiza item

Deletar: Confirm → DELETE → Remove da lista

9.3. Endpoints da API:
Base URL: https://backend-frotas.onrender.com/api

Endpoint	Método	Descrição
/viagens	GET/POST/PUT/DELETE	CRUD de viagens
/viagens/:id/transacoes	GET/PUT	Transações financeiras
/viagens/transacoes/:id	DELETE	Deletar transação
/caminhoes	GET/POST/PUT/DELETE	CRUD de caminhões
/motoristas	GET/POST/PUT/DELETE	CRUD de motoristas
/clientes	GET/POST/PUT/DELETE	CRUD de clientes
/fornecedores	GET/POST/PUT/DELETE	CRUD de fornecedores
/abastecimentos	GET/POST/PUT/DELETE	CRUD de abastecimentos
/manuPrev	GET/POST/PUT/DELETE	CRUD de manutenção
/trocaOleo	GET/POST/PUT/DELETE	CRUD de troca de óleo
/trocaPneus	GET/POST/PUT/DELETE	CRUD de troca de pneus
9.4. Autenticação:
Firebase Auth para login

Status do usuário no Firestore para verificação de ativação

localStorage para persistência da sessão

Rotas protegidas via verificação de token

10. Segurança e Perfis
10.1. Níveis de Acesso:
Administrador: Acesso total

Usuário: Acesso limitado

Motorista: Acesso limitado

10.2. Status de Usuário:
Status	Efeito
ativo	Acesso liberado
inativo	Login bloqueado, redirecionado para renovação

11. Conclusão
O Sistema de Gestão de Frota é uma aplicação completa para gerenciamento logístico com:

Frontend moderno (React + TypeScript + Chakra UI)

Autenticação segura (Firebase)

Modularização por domínio (viagens, veículos, etc.)

Relatórios (PDF e dashboards)

Visualização de rotas (Leaflet/OSRM)
