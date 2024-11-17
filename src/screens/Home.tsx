import { useState, useEffect, useRef } from "react";
import {
  FlatList,
  Text,
  TextInput,
  View,
  SafeAreaView,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  Task,
  Tasks,
  Team,
  TeamMenber,
  ServicesList,
  Service,
  salveTask,
} from "@data/Data";
import { fetchTasks } from "@firebase/index";
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@firebase/index";
import { fetchservices, fetchTeam } from "../firebase/index";
import { TextInputMask } from "react-native-masked-text";

export default function Home() {
  const [text, onChangeText] = useState("");
  const [createTaskModal, setCreateTaskModal] = useState(false);
  const [editTaskModal, setEditTaskModal] = useState(false);
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [descMaxLength] = useState(200);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const validateSelection = () => {
    if (selectedService === null || selectedTeamMember === null) {
      showMessage("Por favor, selecione um serviço e um membro da equipe.");
      return false;
    }
    const selectedServiceObj = services.find((s) => s.id === selectedService);
    const selectedTeamMemberObj = team.find((m) => m.id === selectedTeamMember);
    if (!selectedServiceObj || !selectedTeamMemberObj) {
      showMessage("Serviço ou Membro da equipe inválidos.");
      return false;
    }
    return { selectedServiceObj, selectedTeamMemberObj };
  };

  const addTask = async (newTask: salveTask) => {
    const validation = validateSelection();
    if (!validation) return;

    const { selectedServiceObj, selectedTeamMemberObj } = validation;

    try {
      setCreateTaskModal(false);
      setLoading(true);
      await addDoc(collection(db, "demandas"), {
        name: newTask.name,
        desc: newTask.desc,
        initDate: newTask.initDate,
        endDate: newTask.endDate,
        service: selectedServiceObj.id,
        teammenber: selectedTeamMemberObj.id,
      });
      fetchTasks(setTasks);
      setLoading(false);
      showMessage("Tarefa adicionada com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar a tarefa: ", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const taskDocRef = doc(db, "demandas", taskId);
      setEditTaskModal(false);
      setLoading(true);
      await deleteDoc(taskDocRef);
      const updatedTasks = tasks.filter((task) => task.id !== taskId);
      setTasks(updatedTasks);
      setFilteredTasks(updatedTasks);
      setLoading(false);
      showMessage("Tarefa excluída com sucesso!");
    } catch (error) {
      setLoading(false);
      showMessage("Erro ao excluir tarefa");
      console.error("Erro ao excluir tarefa: ", error);
    }
  };

  const editTask = async () => {
    if (!currentTask) return;

    const validation = validateSelection();
    if (!validation) return;

    const { selectedServiceObj, selectedTeamMemberObj } = validation;

    try {
      setEditTaskModal(false);
      setLoading(true);
      const taskDocRef = doc(db, "demandas", currentTask.id.toString());
      await updateDoc(taskDocRef, {
        name: currentTask.name,
        desc: currentTask.desc,
        initDate: currentTask.initDate,
        endDate: currentTask.endDate,
        service: selectedServiceObj.id,
        teammenber: selectedTeamMemberObj.id,
      });
      fetchTasks(setTasks);
      setLoading(false);
      showMessage("Tarefa editada com sucesso!");   
    } catch (error) {
      setLoading(false);
      showMessage("Erro ao editar tarefa");
      console.error("Erro ao editar tarefa: ", error);
    }
  };

  const openCreateTaskModal = () => {
    fetchservices(setServices);
    fetchTeam(setTeam);
    setCreateTaskModal(true);
  };
  
  const openEditTaskModal = (task) => {
    fetchservices(setServices);
    fetchTeam(setTeam);
    setCurrentTask(task);
    setSelectedService(task.service ? task.service.id : null);
    setSelectedTeamMember(task.teammenber ? task.teammenber.id : null);
    setEditTaskModal(true);
  };
  

  useEffect(() => {
    fetchTasks(setTasks);
    fetchservices(setServices);
    fetchTeam(setTeam);
    setFilteredTasks(Tasks);
  }, []);

  useEffect(() => {
    const filtered = tasks
      .filter(
        (task) =>
          task.name.toLowerCase().includes(text.toLowerCase()) ||
          task.service.name.toLowerCase().includes(text.toLowerCase()) ||
          task.teammenber.name.toLowerCase().includes(text.toLowerCase()) ||
          task.initDate.toLowerCase().includes(text.toLowerCase()) ||
          task.endDate.toLowerCase().includes(text.toLowerCase())
      )
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true })
      );

    setFilteredTasks(filtered);
  }, [text, tasks]);

  const showMessage = (msg: string) => {
    setMessage(msg);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => setMessage(null));
    }, 3000);
  };

  const renderItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => openEditTaskModal(item)}
    >
      <Text style={styles.taskTitle}>{item.name}</Text>
      <Text>{item.desc}</Text>
      <Text>Início: {item.initDate}</Text>
      <Text>Fim: {item.endDate}</Text>
      <Text>Serviço: {item.service?.name || "N/A"}</Text>
      <Text>Membro: {item.teammenber?.name || "N/A"}</Text>
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
          onPress={openCreateTaskModal}
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
        <Modal transparent animationType="fade" visible={loading}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        </Modal>
      )}

      {/* Modal de criação de tarefa */}
      <Modal
        transparent
        animationType="fade"
        visible={createTaskModal}
        onRequestClose={() => setCreateTaskModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setCreateTaskModal(false)}
          style={styles.modalBackground}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create Task</Text>
            <TextInput
              style={styles.input}
              value={newTask.name}
              onChangeText={(text) => setNewTask({ ...newTask, name: text })}
              placeholder="Task Name"
            />
            <TextInput
              style={styles.input}
              value={newTask.desc}
              onChangeText={(text) => setNewTask({ ...newTask, desc: text })}
              placeholder="Description"
              maxLength={descMaxLength}
            />
            <TextInputMask
              type={"datetime"}
              options={{
                format: "DD/MM/YYYY",
              }}
              value={newTask.initDate}
              onChangeText={(formatted) =>
                setNewTask({ ...newTask, initDate: formatted })
              }
              placeholder="Start Date"
              style={styles.input}
            />
            <TextInputMask
              type={"datetime"}
              options={{
                format: "DD/MM/YYYY",
              }}
              value={newTask.endDate}
              onChangeText={(formatted) =>
                setNewTask({ ...newTask, endDate: formatted })
              }
              placeholder="End Date"
              style={styles.input}
            />
            <Picker
              selectedValue={selectedService}
              onValueChange={setSelectedService}
              style={styles.picker}
            >
              {services.map((service) => (
                <Picker.Item
                  key={service.id}
                  label={service.name}
                  value={service.id}
                />
              ))}
            </Picker>
            <Picker
              selectedValue={selectedTeamMember}
              onValueChange={setSelectedTeamMember}
              style={styles.picker}
            >
              {team.map((member) => (
                <Picker.Item
                  key={member.id}
                  label={member.name}
                  value={member.id}
                />
              ))}
            </Picker>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => addTask(newTask)}
            >
              <Text style={styles.buttonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de edição de tarefa */}
      <Modal
        transparent
        animationType="fade"
        visible={editTaskModal}
        onRequestClose={() => setEditTaskModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setEditTaskModal(false)}
          style={styles.modalBackground}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Task</Text>
            <TextInput
              style={styles.input}
              value={currentTask?.name}
              onChangeText={(text) =>
                setCurrentTask((prev) => ({ ...prev, name: text }))
              }
              placeholder="Task Name"
            />
            <TextInput
              style={styles.input}
              value={currentTask?.desc}
              onChangeText={(text) =>
                setCurrentTask((prev) => ({ ...prev, desc: text }))
              }
              placeholder="Description"
              maxLength={descMaxLength}
            />
            <TextInputMask
              type={"datetime"}
              options={{
                format: "DD/MM/YYYY",
              }}
              value={currentTask?.initDate || ""}
              onChangeText={(formatted) =>
                setCurrentTask((prev) => ({ ...prev, initDate: formatted }))
              }
              placeholder="Start Date"
              style={styles.input}
            />
            <TextInputMask
              type={"datetime"}
              options={{
                format: "DD/MM/YYYY",
              }}
              value={currentTask?.endDate || ""}
              onChangeText={(formatted) =>
                setCurrentTask((prev) => ({ ...prev, endDate: formatted }))
              }
              placeholder="End Date"
              style={styles.input}
            />
            <Picker
              selectedValue={selectedService}
              onValueChange={setSelectedService}
              style={styles.picker}
            >
              {services.map((service) => (
                <Picker.Item
                  key={service.id}
                  label={service.name}
                  value={service.id}
                />
              ))}
            </Picker>
            <Picker
              selectedValue={selectedTeamMember}
              onValueChange={setSelectedTeamMember}
              style={styles.picker}
            >
              {team.map((member) => (
                <Picker.Item
                  key={member.id}
                  label={member.name}
                  value={member.id}
                />
              ))}
            </Picker>
            <TouchableOpacity style={styles.submitButton} onPress={editTask}>
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: "red" }]}
              onPress={() => currentTask && deleteTask(currentTask.id)}
            >
              <Text style={styles.buttonText}>Delete Task</Text>
            </TouchableOpacity>
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
  submitButton: {
    backgroundColor: '#6200ea',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    alignItems: 'center',
  },
});
