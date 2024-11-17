import { useState, useEffect, useRef } from "react";
import { Feather } from "@expo/vector-icons";
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
  const [FilterModal, setFilterModal] = useState(false);

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
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  const [services, setServices] = useState<Service[]>(ServicesList);
  const [team, setTeam] = useState<TeamMenber[]>(Team);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedTeamMember, setSelectedTeamMember] = useState<string | null>(
    null
  );

  const [loading, setLoading] = useState(false);
  const [loadingAnimation, setLoadingAnimation] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [Visualmessage, setVisualMessage] = useState(false);
  const [descMaxLength] = useState(200);

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
      setLoading(true);
      setLoadingAnimation(true);
      await addDoc(collection(db, "demandas"), {
        name: newTask.name,
        desc: newTask.desc,
        initDate: newTask.initDate,
        endDate: newTask.endDate,
        service: selectedServiceObj.id,
        teammenber: selectedTeamMemberObj.id,
      });
      await fetchTasks(setTasks);
      setLoadingAnimation(false);
      setMessage("Tarefa adicionada com sucesso!");
      setVisualMessage(true);
    } catch (error) {
      console.error("Erro ao adicionar a tarefa: ", error);
      setMessage("Erro ao adicionar a tarefa.");
      setVisualMessage(true);
    } finally {
      setTimeout(() => {
        setCreateTaskModal(false);
        setLoading(false);
        setLoadingAnimation(false);
        setVisualMessage(false);
      }, 1000);
    }
  };
  const deleteTask = async (taskId: string) => {
    try {
      setLoading(true);
      setLoadingAnimation(true);

      const taskDocRef = doc(db, "demandas", taskId);
      await deleteDoc(taskDocRef);
      const updatedTasks = tasks.filter((task) => task.id !== taskId);
      setTasks(updatedTasks);
      setFilteredTasks(updatedTasks);
      setLoadingAnimation(false);
      setMessage("Tarefa excluída com sucesso!");
      setVisualMessage(true);
    } catch (error) {
      console.error("Erro ao excluir tarefa: ", error);
      setLoadingAnimation(false);
      setMessage("Erro ao excluir tarefa.");
      setVisualMessage(true);
    } finally {
      setTimeout(() => {
        setEditTaskModal(false);
        setLoading(false);
        setLoadingAnimation(false);
        setVisualMessage(false);
      }, 1000);
    }
  };
  const editTask = async () => {
    if (!currentTask) return;

    const validation = validateSelection();
    if (!validation) return;

    const { selectedServiceObj, selectedTeamMemberObj } = validation;

    try {
      setLoading(true);
      setLoadingAnimation(true);

      const taskDocRef = doc(db, "demandas", currentTask.id.toString());
      await updateDoc(taskDocRef, {
        name: currentTask.name,
        desc: currentTask.desc,
        initDate: currentTask.initDate,
        endDate: currentTask.endDate,
        service: selectedServiceObj.id,
        teammenber: selectedTeamMemberObj.id,
      });

      await fetchTasks(setTasks);
      setLoadingAnimation(false);
      setMessage("Tarefa editada com sucesso!");
      setVisualMessage(true);
    } catch (error) {
      console.error("Erro ao editar tarefa: ", error);
      setMessage("Erro ao editar tarefa.");
      setVisualMessage(true);
    } finally {
      setTimeout(() => {
        setEditTaskModal(false);
        setLoading(false);
        setLoadingAnimation(false);
        setVisualMessage(false);
      }, 1000);
    }
  };

  const openCreateTaskModal = () => {
    setNewTask({
      id: "",
      name: "",
      desc: "",
      initDate: "",
      endDate: "",
      idservice: "",
      idmenber: "",
    });
    setSelectedService(null);
    setSelectedTeamMember(null);
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
  const openFilterModal = () => {
    setFilterModal(true);
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
    <SafeAreaView style={styles.MainContainer}>
      <View style={styles.HeaderContent} />

      <View style={styles.GenericContainer}>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 10,
            width: "100%",
          }}
        >
          <TouchableOpacity
            style={styles.FilterButton}
            onPress={openFilterModal}
          >
            <Feather name="filter" size={20} color="#fff" />
          </TouchableOpacity>

          <View style={{ position: "relative", flex: 1 }}>
            <TextInput
              onChangeText={onChangeText}
              value={text}
              placeholder="Search tasks..."
              style={styles.input}
            />
            <View style={styles.searchButton}>
              <Feather name="search" size={20} />
            </View>
          </View>
        </View>

        <View style={styles.GenericContainer2}>
          {filteredTasks && filteredTasks.length === 0 ? (
            text.trim() !== "" ? (
              <View style={styles.MessageContent}>
                <Text style={styles.MessageText}>
                  Nenhuma tarefa encontrada
                </Text>
              </View>
            ) : (
              <ActivityIndicator
                style={styles.LoadAnimation}
                size={100}
                color="#6200ea"
              />
            )
          ) : (
            <FlatList
              data={filteredTasks}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
            />
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={openCreateTaskModal}
      >
        <Text style={styles.CreateButtonText}>Criar nova tarefa</Text>
      </TouchableOpacity>

      {/* Modal para criar tarefa */}
      <Modal
        transparent
        visible={createTaskModal}
        animationType="slide"
        onRequestClose={() => {
          setCreateTaskModal(false);
          setLoading(false);
          setLoadingAnimation(false);
          setVisualMessage(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => {
                setCreateTaskModal(false);
                setLoading(false);
                setLoadingAnimation(false);
                setVisualMessage(false);
              }}
              style={styles.closeButton}
            >
              <Feather name="x" size={20} />
            </TouchableOpacity>
            {loading ? (
              <>
                {loadingAnimation && (
                  <ActivityIndicator
                    style={styles.LoadAnimation}
                    size={100}
                    color="#6200ea"
                  />
                )}
                {Visualmessage && (
                  <View style={styles.MessageContent}>
                    <Text style={styles.MessageText}>{message}</Text>
                  </View>
                )}
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Nova Tarefa</Text>
                <TextInput
                  style={styles.input}
                  value={newTask.name}
                  onChangeText={(text) =>
                    setNewTask({ ...newTask, name: text })
                  }
                  placeholder="Task Name"
                />
                <TextInput
                  style={styles.input}
                  value={newTask.desc}
                  onChangeText={(text) =>
                    setNewTask({ ...newTask, desc: text })
                  }
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
                  <Picker.Item label="Selececione um serviço" value="null" />
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
                  <Picker.Item
                    label="Selececione um Funcionario"
                    value="null"
                  />
                  {team.map((member) => (
                    <Picker.Item
                      key={member.id}
                      label={member.name}
                      value={member.id}
                    />
                  ))}
                </Picker>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 10,
                    width: "100%",
                  }}
                >
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={() => addTask(newTask)}
                  >
                    <Text style={styles.SaveButtonText}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal para editar tarefa */}
      <Modal
        transparent
        visible={editTaskModal}
        animationType="slide"
        onRequestClose={() => {
          setEditTaskModal(false);
          setLoading(false);
          setLoadingAnimation(false);
          setVisualMessage(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => {
                setEditTaskModal(false);
                setLoading(false);
                setLoadingAnimation(false);
                setVisualMessage(false);
              }}
              style={styles.closeButton}
            >
              <Feather name="x" size={20} />
            </TouchableOpacity>

            {loading ? (
              <>
                {loadingAnimation && (
                  <ActivityIndicator
                    style={styles.LoadAnimation}
                    size={100}
                    color="#6200ea"
                  />
                )}
                {Visualmessage && (
                  <View style={styles.MessageContent}>
                    <Text style={styles.MessageText}>{message}</Text>
                  </View>
                )}
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Editar Tarefa</Text>
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
                  <Picker.Item label="Selecione um serviço" value="null" />
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
                  <Picker.Item label="Selecione um funcionário" value="null" />
                  {team.map((member) => (
                    <Picker.Item
                      key={member.id}
                      label={member.name}
                      value={member.id}
                    />
                  ))}
                </Picker>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 10,
                    width: "100%",
                  }}
                >
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={editTask}
                  >
                    <Text style={styles.SaveButtonText}>Salvar alterações</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.DeleteButton, { backgroundColor: "red" }]}
                    onPress={() => currentTask && deleteTask(currentTask.id)}
                  >
                    <Text style={styles.DeleteButtonText}>Excluir Tarefa</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal para editar tarefa */}
      <Modal
        transparent
        visible={FilterModal}
        animationType="slide"
        onRequestClose={() => {
          setFilterModal(false);
          setLoading(false);
          setLoadingAnimation(false);
          setVisualMessage(false);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => {
                setFilterModal(false);
                setLoading(false);
                setLoadingAnimation(false);
                setVisualMessage(false);
              }}
              style={styles.closeButton}
            >
              <Feather name="x" size={20} />
            </TouchableOpacity>

            {loading ? (
              <>
                {loadingAnimation && (
                  <ActivityIndicator
                    style={styles.LoadAnimation}
                    size={100}
                    color="#6200ea"
                  />
                )}
                {Visualmessage && (
                  <View style={styles.MessageContent}>
                    <Text style={styles.MessageText}>{message}</Text>
                  </View>
                )}
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Filter Modal</Text>
              </>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#eeeeee",
    position: "relative",
  },
  GenericContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: 10,
    gap: 10,
  },
  GenericContainer2: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  HeaderContent: {
    height: 38,
    backgroundColor: "#fff",
  },
  createButton: {
    bottom: 10,
    right: 10,
    position: "absolute",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "#6200ea",
    height: 40,
    zIndex: 999,
  },
  CreateButtonText: {
    fontSize: 16,
    color: "#fff",
  },
  FilterButton: {
    height: 40,
    width: 40,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    borderRadius: 8,
    backgroundColor: "#6200ea",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    width: "100%",
    backgroundColor: "#d3d3d375",
  },
  modalContent: {
    position: "relative",
    width: "100%",
    minHeight: 400,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#6200ea",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  SaveButtonText: {
    fontSize: 16,
    color: "#fff",
  },
  DeleteButton: {
    flex: 1,
    backgroundColor: "red",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  DeleteButtonText: {
    fontSize: 16,
    color: "#fff",
  },
  taskItem: {
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  picker: {
    height: 50,
    marginVertical: 10,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 10,
    height: 40,
    backgroundColor: "#fff",
  },
  LoadAnimation: {
    margin: "auto",
  },
  MessageContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  MessageText: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    width: 250,
  },
  closeButton: {
    position: "absolute",
    right: 12,
    top: 12,
    padding: 5,
    zIndex: 9999,
  },
  searchButton: {
    position: "absolute",
    right: 12,
    top: 5,
    padding: 5,
    zIndex: 9999,
  },
});
