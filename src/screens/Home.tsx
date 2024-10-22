import { useState, useEffect, useRef } from "react";
import { FlatList, Text, TextInput, View, SafeAreaView, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Animated } from "react-native";
import { Picker } from '@react-native-picker/picker';
import { Task, Tasks, Team, TeamMenber, ServicesList, Service, salveTask } from "../Data/Data";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchTasks } from "../firebase/index";
import { getFirestore, collection, addDoc, getDocs,doc,deleteDoc,updateDoc} from 'firebase/firestore';
import { app, db } from '../firebase/index'; // substitua pelo caminho correto
import { fetchservices,fetchTeam } from "../firebase/index";

const generateRandomId = () => Math.floor(100000 + Math.random() * 900000);

export default function Home() {
  const [text, onChangeText] = useState("");
  const [createTaskModal, setCreateTaskModal] = useState<boolean>(false);
  const [editTaskModal, setEditTaskModal] = useState<boolean>(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<salveTask>({
    id: "",
    name: "",
    desc: "",
    initDate: "",
    endDate: "",
    idservice: "",
    idmenber: "",
  });
  const [services, setServices] = useState<Service[]>(ServicesList);
  const [team, setTeam] = useState<TeamMenber[]>(Team);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedTeamMember, setSelectedTeamMember] = useState<string | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [descMaxLength] = useState(200);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  

  const addTask = async (newTask: salveTask) => {
    if (selectedService === null || selectedTeamMember === null) {
      showMessage("Por favor, selecione um serviço e um membro da equipe.");
      return;
    }

    const selectedServiceObj = services.find(s => s.id === selectedService);
    const selectedTeamMemberObj = team.find(m => m.id === selectedTeamMember);

    if (!selectedServiceObj || !selectedTeamMemberObj) {
      showMessage("Serviço ou Membro da equipe inválidos.");
      return;
    }
    
    try {
      setCreateTaskModal(false);
      setLoading(true);
      // Adiciona uma nova tarefa na coleção "demandas"
      await addDoc(collection(db, 'demandas'), {
        name: newTask.name,
        desc: newTask.desc,
        initDate: newTask.initDate,
        endDate: newTask.endDate,
        service: selectedServiceObj.id,
        teammenber: selectedTeamMemberObj.id
        ,
      });
  
      console.log("Tarefa adicionada com sucesso!");
      fetchTasks(setTasks)
      setFilteredTasks(tasks)
    } catch (error) {
      console.error("Erro ao adicionar a tarefa: ", error);
    }
    finally{
      setLoading(false);
    }
  };
  const deleteTask = async (taskId) => {
    try {
      // Referência ao documento que deseja excluir
      const taskDocRef = doc(db, 'demandas', taskId.toString()); // Converta taskId para string se necessário

      
      setEditTaskModal(false); // Fechar o modal de edição, se estiver aberto
      setLoading(true); // Ativar loading
  
      // Exclui o documento
      await deleteDoc(taskDocRef);
      
      // Atualiza a lista de tarefas, removendo a tarefa excluída
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      setFilteredTasks(updatedTasks); // Atualizar tarefas filtradas se necessário
  
      console.log(`Tarefa ${taskId} excluída com sucesso.`);
      showMessage("Tarefa excluída com sucesso!"); // Exibir mensagem de sucesso
  
      // Desativar loading após um delay, se necessário
      setTimeout(() => {
        setLoading(false);
      }, 500); // Manter o mesmo delay da função de edição, ajuste conforme necessário
  
    } catch (error) {
      console.error('Erro ao excluir tarefa: ', error);
      setLoading(false); // Garantir que o loading seja desativado em caso de erro
    }
  };
  const editTask = async () => {
    try {
      if (currentTask) {
        setEditTaskModal(false); // Fechar o modal de edição
        setLoading(true); // Ativar loading
  
        // Referência ao documento que deseja atualizar
        const taskDocRef = doc(db, 'demandas', currentTask.id.toString()); // Converta currentTask.id para string se necessário
        if (selectedService === null || selectedTeamMember === null) {
          showMessage("Por favor, selecione um serviço e um membro da equipe.");
          return;
        }
    
        const selectedServiceObj = services.find(s => s.id === selectedService);
        const selectedTeamMemberObj = team.find(m => m.id === selectedTeamMember);
    
        if (!selectedServiceObj || !selectedTeamMemberObj) {
          showMessage("Serviço ou Membro da equipe inválidos.");
          return;
        }
  
        // Atualiza o documento no Firestore
        await updateDoc(taskDocRef, {
          name: currentTask.name,
          desc: currentTask.desc,
          initDate: currentTask.initDate,
          endDate: currentTask.endDate,
          service: selectedServiceObj.id,
        teammenber: selectedTeamMemberObj.id
        });
  
        // Atualiza a lista de tarefas localmente
        const updatedTasks = tasks.map((task) =>
          task.id === currentTask.id ? currentTask : task
        );
        fetchTasks(setTasks);
        setFilteredTasks(updatedTasks); // Atualiza tarefas filtradas se necessário
  
        console.log(`Tarefa ${currentTask.id} editada com sucesso.`);
        showMessage("Tarefa editada com sucesso!"); // Exibir mensagem de sucesso
  
        // Desativar loading após um delay, se necessário
        setTimeout(() => {
          setLoading(false);
        }, 500); // Manter o mesmo delay da função de edição
  
      }
    } catch (error) {
      console.error('Erro ao editar tarefa: ', error);
      setLoading(false); // Garantir que o loading seja desativado em caso de erro
    }
  };
  


  useEffect(() => {
    fetchTasks(setTasks);
    fetchservices(setServices);
    fetchTeam(setTeam);
    setFilteredTasks(Tasks);
  }, []);

  useEffect(() => {
    const filtered = tasks
      .filter((task) => task.name.toLowerCase().includes(text.toLowerCase()) ||
        task.service.name.toLowerCase().includes(text.toLowerCase()) ||
        task.teammenber.name.toLowerCase().includes(text.toLowerCase()) ||
        task.initDate.toLowerCase().includes(text.toLowerCase()) ||
        task.endDate.toLowerCase().includes(text.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    setFilteredTasks(filtered);
  }, [text, tasks]);

  const clearMessage = () => {
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setMessage(null));
    }, 3000);
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    clearMessage();  };
  const resetNewTask = () => {
    setNewTask({
      id: "",
      name: "",
      desc: "",
      initDate: "",
      endDate: "",
      idservice: "",
      idmenber: ""
    });
    setSelectedService(null);
    setSelectedTeamMember(null);
  };


  

  const renderItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => {
        setCurrentTask(item);
        setSelectedService(item.service ? item.service.id : null);
        setSelectedTeamMember(item.teammenber ? item.teammenber.id : null);
        setEditTaskModal(true);
        fetchservices(setServices);
        fetchTeam(setTeam);
      }}
    >
      <Text style={styles.taskTitle}>{item.name}</Text>
      <Text>{item.desc}</Text>
      <Text>Início: {item.initDate}</Text>
      <Text>Fim: {item.endDate}</Text>
      <Text>Serviço: {item.service ? item.service.name : 'N/A'}</Text>
      <Text>Membro: {item.teammenber ? item.teammenber.name : 'N/A'}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.headerText}>My Tasks</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          onChangeText={onChangeText}
          value={text}
          placeholder="Search tasks..."
          style={styles.input}
        />
        <TouchableOpacity
          onPress={() => {setCreateTaskModal(true)
            fetchservices(setServices);
            fetchTeam(setTeam);
          }}
          style={styles.createButton}
        >
          <Text style={styles.buttonText}>Create New Task</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.flatList}
        contentContainerStyle={styles.flatListContent}
        data={filteredTasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />

      {message && (
        <Animated.View style={[styles.messageContainer, { opacity: fadeAnim }]}>
          <Text style={styles.messageText}>{message}</Text>
        </Animated.View>
      )}

      {loading && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={loading}
          onRequestClose={() => { }}
        >
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        </Modal>
      )}

      {/* Modal de criação de tarefa */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={createTaskModal}
        onRequestClose={() => setCreateTaskModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setCreateTaskModal(false)}
          style={styles.modalBackground}
        >
          <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Create New Task</Text>
            <TextInput
              placeholder="Task Name"
              onChangeText={(text) => setNewTask({ ...newTask, name: text })}
              value={newTask.name}
              style={styles.modalInput}
              editable={!loading}
            />
            <TextInput
              placeholder="Description"
              onChangeText={(text) => {
                if (text.length <= descMaxLength) {
                  setNewTask({ ...newTask, desc: text });
                }
              }}
              value={newTask.desc}
              style={[styles.modalInput, styles.descInput]}
              editable={!loading}
              multiline={true}
            />
            <Text style={styles.charCount}>
              {newTask.desc.length}/{descMaxLength} caracteres
            </Text>
            <TextInput
              placeholder="Start Date (YYYY-MM-DD)"
              onChangeText={(text) => setNewTask({ ...newTask, initDate: text })}
              value={newTask.initDate}
              style={styles.modalInput}
              editable={!loading}
            />
            <TextInput
              placeholder="End Date (YYYY-MM-DD)"
              onChangeText={(text) => setNewTask({ ...newTask, endDate: text })}
              value={newTask.endDate}
              style={styles.modalInput}
              editable={!loading}
            />

            {/* Picker para seleção de serviço */}
            <Picker
              selectedValue={selectedService}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedService(itemValue)}
            >
              <Picker.Item label="Select Service" value={null} />
              {services.map((service) => (
                <Picker.Item key={service.id} label={service.name} value={service.id} />
              ))}
            </Picker>

            {/* Picker para seleção de funcionário */}
            <Picker
              selectedValue={selectedTeamMember}
              style={styles.picker}
              onValueChange={(itemValue) => setSelectedTeamMember(itemValue)}
            >
              <Picker.Item label="Select Team Member" value={null} />
              {team.map((member) => (
                <Picker.Item key={member.id} label={member.name} value={member.id} />
              ))}
            </Picker>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={()=>addTask(newTask)}
                disabled={loading}
              >
                <Text style={styles.modalActionButtonText}>Create</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setCreateTaskModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de edição de tarefa */}
      <Modal

        
        transparent={true}
        animationType="fade"
        visible={editTaskModal}
        onRequestClose={() => !loading && setEditTaskModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => !loading && setEditTaskModal(false)}
          style={styles.modalBackground}
        >
          <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Task</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => !loading && setEditTaskModal(false)}
              >
                <Icon name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            {currentTask && (
              <>
                <TextInput
                  placeholder="Task Name"
                  onChangeText={(text) => setCurrentTask({ ...currentTask, name: text })}
                  value={currentTask.name}
                  style={styles.modalInput}
                  editable={!loading}
                />
                <TextInput
                  placeholder="Description"
                  onChangeText={(text) => {
                    if (text.length <= descMaxLength) {
                      setCurrentTask({ ...currentTask, desc: text });
                    }
                  }}
                  value={currentTask.desc}
                  style={[styles.modalInput, styles.descInput]}
                  editable={!loading}
                  multiline={true}
                />
                <Text style={styles.charCount}>
                  {currentTask.desc.length}/{descMaxLength} caracteres
                </Text>
                <TextInput
                  placeholder="Start Date (YYYY-MM-DD)"
                  onChangeText={(text) => setCurrentTask({ ...currentTask, initDate: text })}
                  value={currentTask.initDate}
                  style={styles.modalInput}
                  editable={!loading}
                />
                <TextInput
                  placeholder="End Date (YYYY-MM-DD)"
                  onChangeText={(text) => setCurrentTask({ ...currentTask, endDate: text })}
                  value={currentTask.endDate}
                  style={styles.modalInput}
                  editable={!loading}
                />

                {/* Picker para editar o serviço */}
                <Picker
                  selectedValue={selectedService}
                  style={styles.picker}
                  onValueChange={(itemValue) => setSelectedService(itemValue)}
                >
                  <Picker.Item label="Select Service" value={null} />
                  {services.map((service) => (
                    <Picker.Item key={service.id} label={service.name} value={service.id} />
                  ))}
                </Picker>

                {/* Picker para editar o funcionário */}
                <Picker
                  selectedValue={selectedTeamMember}
                  style={styles.picker}
                  onValueChange={(itemValue) => setSelectedTeamMember(itemValue)}
                >
                  <Picker.Item label="Select Team Member" value={null} />
                  {team.map((member) => (
                    <Picker.Item key={member.id} label={member.name} value={member.id} />
                  ))}
                </Picker>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalActionButton}
                    onPress={editTask}
                    disabled={loading}
                  >
                    <Text style={styles.modalActionButtonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalCancelButton}
                    onPress={() => currentTask && deleteTask(currentTask.id)}
                    disabled={loading}
                  >
                    <Text style={styles.modalCancelButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 80,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: '#6200ea',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingHorizontal: 20,
    paddingVertical: 10,
    height: "auto",
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 10,
    height: 40,
  },
  createButton: {
    width: '100%',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#6200ea',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  taskItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalInput: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    marginBottom: 20,
  },
  descInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    color: '#999',
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalActionButton: {
    backgroundColor: '#6200ea',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalActionButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalCancelButton: {
    backgroundColor: '#f44336',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalCancelButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  picker: {
    height: 50,
    marginVertical: 10,
  },
  messageContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#6200ea',
    borderRadius: 8,
    marginHorizontal: 20,
    zIndex: 999,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
});
