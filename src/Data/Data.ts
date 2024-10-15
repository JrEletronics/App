// types.ts ou o arquivo onde você define suas interfaces
export interface Task {
  id: string;
  name: string;
  desc: string;
  initDate: string;
  endDate: string;
  dificult: string;
  TeamMembers: string[];
  modalidade: string;
  servico: string;
}


export const Tasks: Task[] = [
];