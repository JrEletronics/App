export interface TeamMenber {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
}

export const Team: TeamMenber[] = [
  
];

export interface Service {
  id: string;
  name: string;
  desc: string;
}

export const ServicesList: Service[] = [
  
];


export interface salveTask {
  id: string;
  name: string;
  desc: string;
  initDate: string;
  endDate: string;
  idservice: string;
  idmenber: string;
}

export interface Task {
  id: string;
  name: string;
  desc: string;
  initDate: string;
  endDate: string;
  service: Service;
  teammenber: TeamMenber;
}

export const Tasks: Task[] = [
  
];
