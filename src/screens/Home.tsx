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
import { Task, Tasks } from "@hooks/useGetTasks";
import Icon from 'react-native-vector-icons/MaterialIcons';

const generateRandomId = () => Math.floor(100000 + Math.random() * 900000);

export default function Home() {
  const [text, onChangeText] = useState("");
  const [createTaskModal, setCreateTaskModal] = useState<boolean>(false);
  const [editTaskModal, setEditTaskModal] = useState<boolean>(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<Task>({
    id: generateRandomId(),
    name: "",
    desc: "",
    initDate: "",
    endDate: "",
    dificult: "",
    TeamMembers: "",
  });
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTasks(Tasks);
    setFilteredTasks(Tasks);
  }, []);

  useEffect(() => {
    const filtered = tasks
      .filter((task) => task.name.toLowerCase().includes(text.toLowerCase()))
      .sort((a, b) => {
        return a.name.localeCompare(b.name, undefined, { numeric: true });
      });

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
    clearMessage();
  };

  const handleCreateTask = () => {
    setCreateTaskModal(false);
    setLoading(true);
    const existingIds = tasks.map((task) => task.id);
    let newId = generateRandomId();

    while (existingIds.includes(newId)) {
      newId = generateRandomId();
    }

    setTimeout(() => {
      setTasks([...tasks, { ...newTask, id: newId }]);
      setFilteredTasks([...tasks, { ...newTask, id: newId }]);
      setNewTask({
        id: generateRandomId(),
        name: "",
        desc: "",
        initDate: "",
        endDate: "",
        dificult: "",
        TeamMembers: "",
      });
      setLoading(false);
      showMessage("Tarefa criada com sucesso!");
    }, 5000);
  };

  const handleEditTask = () => {
    setEditTaskModal(false);
    setLoading(true);
    if (currentTask) {
      setTimeout(() => {
        const updatedTasks = tasks.map((task) =>
          task.id === currentTask.id ? currentTask : task
        );
        setTasks(updatedTasks);
        setFilteredTasks(updatedTasks);
        setLoading(false);
        showMessage("Tarefa editada com sucesso!");
      }, 5000);
    }
  };

  const handleDeleteTask = (id: number) => {
    setEditTaskModal(false);
    setLoading(true);
    setTimeout(() => {
      const updatedTasks = tasks.filter((task) => task.id !== id);
      setTasks(updatedTasks);
      setFilteredTasks(updatedTasks);
      setLoading(false);
      showMessage("Tarefa excluída com sucesso!");
    }, 5000); // Mantenha o mesmo delay da função de edição
  };


  const renderItem = ({ item }: { item: Task }) => (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => {
        setCurrentTask(item);
        setEditTaskModal(true);
      }}
    >
      <Text style={styles.taskTitle}>{item.name}</Text>
      <Text>{item.desc}</Text>
      <Text>Início: {item.initDate}</Text>
      <Text>Fim: {item.endDate}</Text>
      <Text>Dificuldade: {item.dificult}</Text>
      <Text>Membros da Equipe: {item.TeamMembers}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.headerText}>My Tasks</Text>
      </View>

      {/* Header */}
      <View style={styles.searchContainer}>
        <TextInput
          onChangeText={onChangeText}
          value={text}
          placeholder="Search tasks..."
          style={styles.input}
        />
        <TouchableOpacity
          onPress={() => setCreateTaskModal(true)}
          style={styles.createButton}
        >
          <Text style={styles.buttonText}>Create New Task</Text>
        </TouchableOpacity>
      </View>

      {/* Container dos cards */}
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

      {/* Modal de Criação */}
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
          <View
            style={styles.modalContainer}
            onStartShouldSetResponder={() => true}
          >
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
              onChangeText={(text) => setNewTask({ ...newTask, desc: text })}
              value={newTask.desc}
              style={styles.modalInput}
              editable={!loading}
            />
            <TextInput
              placeholder="Start Date (YYYY-MM-DD)"
              onChangeText={(text) =>
                setNewTask({ ...newTask, initDate: text })
              }
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
            <TextInput
              placeholder="Difficulty"
              onChangeText={(text) =>
                setNewTask({ ...newTask, dificult: text })
              }
              value={newTask.dificult}
              style={styles.modalInput}
              editable={!loading}
            />
            <TextInput
              placeholder="Team Members"
              onChangeText={(text) =>
                setNewTask({ ...newTask, TeamMembers: text })
              }
              value={newTask.TeamMembers}
              style={styles.modalInput}
              editable={!loading}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalActionButton}
                onPress={handleCreateTask}
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

      {/* Modal de Edição */}
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
          <View
            style={styles.modalContainer}
            onStartShouldSetResponder={() => true}
          >

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
                  placeholder="Task ID"
                  value={currentTask.id.toString()}
                  editable={false}
                  style={styles.modalInput}
                />
                <TextInput
                  placeholder="Task Name"
                  onChangeText={(text) =>
                    setCurrentTask({ ...currentTask, name: text })
                  }
                  value={currentTask.name}
                  style={styles.modalInput}
                  editable={!loading}
                />
                <TextInput
                  placeholder="Description"
                  onChangeText={(text) =>
                    setCurrentTask({ ...currentTask, desc: text })
                  }
                  value={currentTask.desc}
                  style={styles.modalInput}
                  editable={!loading}
                />
                <TextInput
                  placeholder="Start Date (YYYY-MM-DD)"
                  onChangeText={(text) =>
                    setCurrentTask({ ...currentTask, initDate: text })
                  }
                  value={currentTask.initDate}
                  style={styles.modalInput}
                  editable={!loading}
                />
                <TextInput
                  placeholder="End Date (YYYY-MM-DD)"
                  onChangeText={(text) =>
                    setCurrentTask({ ...currentTask, endDate: text })
                  }
                  value={currentTask.endDate}
                  style={styles.modalInput}
                  editable={!loading}
                />
                <TextInput
                  placeholder="Difficulty"
                  onChangeText={(text) =>
                    setCurrentTask({ ...currentTask, dificult: text })
                  }
                  value={currentTask.dificult}
                  style={styles.modalInput}
                  editable={!loading}
                />
                <TextInput
                  placeholder="Team Members"
                  onChangeText={(text) =>
                    setCurrentTask({ ...currentTask, TeamMembers: text })
                  }
                  value={currentTask.TeamMembers}
                  style={styles.modalInput}
                  editable={!loading}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalActionButton}
                    onPress={handleEditTask}
                    disabled={loading}
                  >
                    <Text style={styles.modalActionButtonText}>
                      Save Changes
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteTask(currentTask.id)}
                  >
                    <Text style={styles.deleteButtonText}>Excluir</Text>
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
    backgroundColor: "#f5f5f5",
  },
  header: {
    height: 80,
    backgroundColor: "#fff",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingVertical: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  searchContainer: {
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  createButton: {
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 4,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  flatList: {
    flex: 1,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  taskItem: {
    backgroundColor: "#fff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 4,
    elevation: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
    padding: 10,
    borderRadius: 4,
    flex: 1,
    marginLeft: 5,
  },
  deleteButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  messageContainer: {
    backgroundColor: "#dff0d8",
    padding: 10,
    margin: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  messageText: {
    color: "#3c763d",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10
  },
  modalActionButton: {
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 4,
    flex: 1,
    marginRight: 5,
  },
  modalActionButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  modalCancelButton: {
    backgroundColor: "#8c8c8c",
    padding: 10,
    flex: 1,
    borderRadius: 4,
  },
  modalCancelButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  modalCloseButton: {
    padding: 5,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  }
});

