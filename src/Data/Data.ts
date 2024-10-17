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

export interface Task {
  id: number;
  name: string;
  desc: string;
  initDate: string;
  endDate: string;
  service: Service;
  teammenber: TeamMenber;
}

export const Tasks: Task[] = [
  {
    id: 1,
    name: "Criação de Protótipo",
    desc: "Desenvolver um protótipo funcional do aplicativo.",
    initDate: "2024-10-22",
    endDate: "2024-10-24",
    service: ServicesList[0],
    teammenber: Team[0],
  },
  {
    id: 2,
    name: "Auditoria de Segurança",
    desc: "Auditar a segurança do sistema e identificar vulnerabilidades.",
    initDate: "2024-10-26",
    endDate: "2024-10-29",
    service: ServicesList[1],
    teammenber: Team[1],
  },
  {
    id: 3,
    name: "Otimização de Banco de Dados",
    desc: "Melhorar o desempenho das consultas no banco de dados.",
    initDate: "2024-11-01",
    endDate: "2024-11-05",
    service: ServicesList[2],
    teammenber: Team[2],
  },
  {
    id: 4,
    name: "Treinamento da Equipe",
    desc: "Capacitar a equipe para utilizar novas tecnologias no projeto.",
    initDate: "2024-11-03",
    endDate: "2024-11-07",
    service: ServicesList[3],
    teammenber: Team[3],
  },
  {
    id: 5,
    name: "Apresentação do Projeto",
    desc: "Realizar uma apresentação final do projeto para os stakeholders.",
    initDate: "2024-11-10",
    endDate: "2024-11-12",
    service: ServicesList[4],
    teammenber: Team[4],
  },
];
