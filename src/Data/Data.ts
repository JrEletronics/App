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

export interface Members {
  id: string;
  name: string;
  cpf: string;
  email: string;
  tel: string;
}

export const Team: Members[] = [];
