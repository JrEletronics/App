export interface Task {
  id: number;
  name: string;
  desc: string;
  initDate: string;
  endDate: string;
}
export const Tasks: Task[] = [
  {
    id: 1,
    name: "Desenvolvimento de Interface",
    desc: "Criar a interface do usuário para o aplicativo.",
    initDate: "2024-10-01",
    endDate: "2024-10-10",
  },
  {
    id: 2,
    name: "Implementação de API",
    desc: "Desenvolver a API para integração com o banco de dados.",
    initDate: "2024-10-05",
    endDate: "2024-10-15",
  },
  {
    id: 3,
    name: "Testes de Funcionalidade",
    desc: "Realizar testes de funcionalidade no sistema.",
    initDate: "2024-10-08",
    endDate: "2024-10-12",
  },
  {
    id: 4,
    name: "Revisão de Código",
    desc: "Revisar o código do projeto para garantir qualidade.",
    initDate: "2024-10-10",
    endDate: "2024-10-14",
  },
  {
    id: 5,
    name: "Documentação",
    desc: "Criar a documentação do projeto e das funcionalidades.",
    initDate: "2024-10-02",
    endDate: "2024-10-09",
  },
  {
    id: 6,
    name: "Configuração de Ambiente",
    desc: "Configurar o ambiente de desenvolvimento e testes.",
    initDate: "2024-10-03",
    endDate: "2024-10-07",
  },
  {
    id: 7,
    name: "Reunião de Equipe",
    desc: "Reunião para discutir o progresso do projeto.",
    initDate: "2024-10-11",
    endDate: "2024-10-11",
  },
  {
    id: 8,
    name: "Deploy em Produção",
    desc: "Realizar o deploy da aplicação em ambiente de produção.",
    initDate: "2024-10-16",
    endDate: "2024-10-18",
  },
  {
    id: 9,
    name: "Análise de Feedback",
    desc: "Analisar o feedback recebido dos usuários.",
    initDate: "2024-10-14",
    endDate: "2024-10-20",
  },
  {
    id: 10,
    name: "Planejamento do Próximo Sprint",
    desc: "Planejar as atividades do próximo sprint.",
    initDate: "2024-10-21",
    endDate: "2024-10-25",
  },
];

export interface TeamMenber {
  id: number;
  name: string;
  email: string;
  cpf: string;
  phone: string;
}

export const Team: TeamMenber[] = [
  {
    id: 1244214,
    name: "João Silva",
    email: "joao.silva@example.com",
    cpf: "123.456.789-00",
    phone: "(11) 98765-4321",
  },
  {
    id: 2352368,
    name: "Maria Oliveira",
    email: "maria.oliveira@example.com",
    cpf: "987.654.321-00",
    phone: "(21) 91234-5678",
  },
  {
    id: 43561247,
    name: "Pedro Souza",
    email: "pedro.souza@example.com",
    cpf: "321.654.987-00",
    phone: "(31) 99876-5432",
  },
  {
    id: 1345353454,
    name: "Ana Lima",
    email: "ana.lima@example.com",
    cpf: "456.789.123-00",
    phone: "(41) 92345-6789",
  },
  {
    id: 8078965,
    name: "Carlos Mendes",
    email: "carlos.mendes@example.com",
    cpf: "654.321.987-00",
    phone: "(51) 93456-7890",
  },
];

export interface Service {
  id: number;
  name: string;
  desc: string;
}
export const ServicesList: Service[] = [
  {
    id: 123456,
    name: "Limpeza Residencial",
    desc: "Serviço de limpeza completa para residências.",
  },
  {
    id: 234567,
    name: "Reparos Elétricos",
    desc: "Manutenção e reparos em instalações elétricas.",
  },
  {
    id: 345678,
    name: "Jardinagem",
    desc: "Serviço de cuidados e manutenção de jardins.",
  },
  {
    id: 456789,
    name: "Manutenção de Ar-Condicionado",
    desc: "Serviço de manutenção preventiva e corretiva de ar-condicionado.",
  },
  {
    id: 567890,
    name: "Pintura de Interiores",
    desc: "Serviço de pintura profissional para ambientes internos.",
  },
];
