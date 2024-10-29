import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { TeamMenber, Task, Service } from "@data/Data";

// Configuração do Firebase 
const firebaseConfig = {
    apiKey: "AIzaSyDHR1P_7TD6fGjHIoluc1UmNQJJrYTC2jY",
    authDomain: "projetoandroid-39cb6.firebaseapp.com",
    projectId: "projetoandroid-39cb6",
    storageBucket: "projetoandroid-39cb6.appspot.com",
    messagingSenderId: "713575350878",
    appId: "1:713575350878:web:72f7c6297a74639c282acf"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };

export const fetchTasks = async (setTasks) => {
    try {
        const querySnapshot = await getDocs(collection(db, 'demandas')); // ajusta para o nome correto da coleção
        const listaTasks: Task[] = [];
        
        // Busca todos os TeamMembers
        const teamMembersSnapshot = await getDocs(collection(db, 'funcionarios')); // ajuste o nome da coleção se necessário
        const teamMembers: { [key: string]: TeamMenber } = {};

        // Cria um objeto para acessar TeamMembers por ID
        teamMembersSnapshot.forEach((doc) => {
            const data = doc.data();
            teamMembers[doc.id] = {
                id: doc.id,
                name: data.name,
                email: data.email,
                cpf: data.cpf,
                phone: data.phone,
            };
            
        });

        const servicesSnapshot = await getDocs(collection(db, 'servicos')); // ajuste o nome da coleção se necessário
        const services: { [key: string]: Service } = {};

        // Cria um objeto para acessar services por ID
        servicesSnapshot.forEach((doc) => {
            const data = doc.data();
            services[doc.id] = {
                id: doc.id,
                name: data.name,
                desc: data.desc,
                
            };
            
        });


        // Monta a lista de tarefas
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log('TeamMembers Data:', data.teammenber); // Log dos dados de TeamMembers
            const teamMemberData = teamMembers[data.teammenber]; // Acha o TeamMember correspondente
            const servicesData = services[data.service];
            console.log('Service Data:', data.service); // Log dos dados de TeamMembers
            if (teamMemberData) {
                console.log('TeamMember Data:', {
                    id: teamMemberData.id,
                    name: teamMemberData.name,
                    email: teamMemberData.email,
                    cpf: teamMemberData.cpf,
                    phone: teamMemberData.phone,
                }); // Log dos dados do TeamMember
            }
            if (servicesData) {
              console.log('servicedata Data:', {
                  id: servicesData.id,
                  name: servicesData.name,
                  desc :servicesData.desc
              }); // Log dos dados do TeamMember
          }

            listaTasks.push({
                id: doc.id,
                name: data.name,
                desc: data.desc,
                initDate: data.initDate,
                endDate: data.endDate,
                service: servicesData  ?{id :servicesData.id,name:servicesData.name,desc:servicesData.desc}:null,
                
                teammenber: teamMemberData ? { // Se teamMemberData existir, cria um objeto
                    id: teamMemberData.id,
                    name: teamMemberData.name,
                    email: teamMemberData.email,
                    cpf: teamMemberData.cpf,
                    phone: teamMemberData.phone,
                } : null, // Se não existir, define como null
                
            });
        });
        
        setTasks(listaTasks);
    } catch (error) {
        console.error('Erro ao buscar tarefas: ', error);
    }

    
};
export const fetchservices = async (setServices) => {
  try {
    const querySnapshot = await getDocs(collection(db, 'servicos')); // ajusta para o nome correto da coleção
    const listaServices: Service[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      listaServices.push({
        id: doc.id, // pode ser necessário converter para number, se não for um número
        name: data.name,
        desc: data.desc,
        
      });
    });
    setServices(listaServices);
  } catch (error) {
    console.error('Erro ao buscar tarefas: ', error);
  }

};

export const fetchTeam = async (setTeam) => {
  try {
    const querySnapshot = await getDocs(collection(db, 'funcionarios')); // ajusta para o nome correto da coleção
    const listateam: TeamMenber[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      listateam.push({
        id: doc.id,
        name: data.name,
        email: data.email,
        cpf: data.cpf,
        phone: data.phone,
        
      });
    });
    setTeam(listateam);
  } catch (error) {
    console.error('Erro ao buscar tarefas: ', error);
  }

};