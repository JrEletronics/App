import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  Animated,
} from "react-native";
import { StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { db, fetchTeam } from "@firebase/index";
import { TeamMenber } from "@data/Data";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { TextInputMask } from "react-native-masked-text";

const TeamManagementPage = () => {
  const [text, onChangeText] = useState("");
  const [createMemberModal, setCreateMemberModal] = useState(false);
  const [editMemberModal, setEditMemberModal] = useState(false);
  const [filterModal, setFilterModal] = useState(false);
  const [team, setTeam] = useState([]);
  const [filteredTeam, setFilteredTeam] = useState([]);
  const [newMember, setNewMember] = useState({
    id: "",
    name: "",
    email: "",
    cpf: "",
    phone: "",
  });
  const [currentMember, setCurrentMember] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [ModalMessage, setModalMessage] = useState(null);
  const [isOn, setIsOn] = useState(false);
  const [loadingAnimation, setLoadingAnimation] = useState(false);
  const [Visualmessage, setVisualMessage] = useState(false);
  const [selectedFilterService, setSelectedFilterService] = useState(null);
  const [selectedFilterTeamMember, setSelectedFilterTeamMember] = useState(null);

  const [showLoading, setShowLoading] = useState(false);
  const [hasResults, setHasResults] = useState(true);

  const openCreateMemberModal = () => {
    setNewMember({
      id: "",
      name: "",
      email: "",
      cpf: "",
      phone: "",
    });
    setCreateMemberModal(true);
  };
  const openEditMemberModal = (member) => {
    setCurrentMember(member);
    setEditMemberModal(true);
  };

  const addMember = async (newMember: TeamMenber) => {
    try {
      setLoading(true);
      setLoadingAnimation(true);
      await addDoc(collection(db, "funcionarios"), {
        name: newMember.name,
        email: newMember.email,
        cpf: newMember.cpf,
        phone: newMember.phone,
      });
      await fetchTeam(setTeam);
      setLoadingAnimation(false);
      setModalMessage("Menbro adicionado com sucesso!");
      setVisualMessage(true);
    } catch (error) {
      setLoadingAnimation(false);
      console.error("Erro ao adicionar ao membro: ", error);
      setModalMessage("Erro ao adicionar ao membro.");
      setVisualMessage(true);
    } finally {
      setTimeout(() => {
        setCreateMemberModal(false);
        setLoading(false);
        setLoadingAnimation(false);
        setVisualMessage(false);
        setModalMessage("");
      }, 1000);
    }
  };
  const editMember = async () => {
    try {
      setLoading(true);
      setLoadingAnimation(true);
      await updateDoc(doc(db, "funcionarios", currentMember.id), {
        name: currentMember.name,
        email: currentMember.email,
        cpf: currentMember.cpf,
        phone: currentMember.phone,
      });
      await fetchTeam(setTeam);

      setLoadingAnimation(false);
      setModalMessage("Membro editado com sucesso!");
      setVisualMessage(true);
    } catch (error) {
      setLoadingAnimation(false);
      console.error("Erro ao editar membro: ", error);
      setModalMessage("Erro ao editar membro.");
      setVisualMessage(true);
    } finally {
      setTimeout(() => {
        setEditMemberModal(false);
        setCurrentMember(null);
        setLoading(false);
        setLoadingAnimation(false);
        setVisualMessage(false);
        setModalMessage("");
      }, 1000);
    }
  };
  const deleteMember = async (memberId: string) => {
    try {
      setLoading(true);
      setLoadingAnimation(true);
      await deleteDoc(doc(db, "funcionarios", memberId));
      await fetchTeam(setTeam);

      setLoadingAnimation(false);
      setModalMessage("Membro excluído com sucesso!");
      setVisualMessage(true);
    } catch (error) {
      setLoadingAnimation(false);
      console.error("Erro ao excluir membro: ", error);
      setModalMessage("Erro ao excluir membro.");
      setVisualMessage(true);
    } finally {
      setTimeout(() => {
        setEditMemberModal(false);
        setCurrentMember(null);
        setLoading(false);
        setLoadingAnimation(false);
        setVisualMessage(false);
        setModalMessage("");
      }, 1000);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => openEditMemberModal(item)}
      style={styles.memberItem}
    >
      <Text>{item.name}</Text>
    </TouchableOpacity>
  );

  const toggleOrder = () => {
    setIsOn(!isOn);
    setFilteredTeam(filteredTeam.reverse());
  };
  const clearFilters = () => {
    setSelectedFilterService(null);
    setSelectedFilterTeamMember(null);
  };
  const applyFilters = () => {
    let filtered = [...team];

    if (selectedFilterService) {
      filtered = filtered.filter(
        (member) => member.serviceId === selectedFilterService
      );
    }

    if (selectedFilterTeamMember) {
      filtered = filtered.filter(
        (member) => member.id === selectedFilterTeamMember
      );
    }

    setFilteredTeam(filtered);
    setFilterModal(false); // Fecha o modal de filtros após aplicar
  };


  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowLoading(false);
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    fetchTeam(setTeam);
    setFilteredTeam(team);
  }, []);
  
  useEffect(() => {
    const filtered = team
      .filter((member) =>
        member.name.toLowerCase().includes(text.toLowerCase())
      )
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true })
      );

    setFilteredTeam(filtered);
  }, [text, team]);

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
          <TouchableOpacity onPress={toggleOrder} style={styles.FilterButton}>
            <Text style={{ color: "#fff" }}>{isOn ? "Z-A" : "A-Z"}</Text>
          </TouchableOpacity>

          <View style={{ position: "relative", flex: 1 }}>
            <TextInput
              onChangeText={onChangeText}
              value={text}
              placeholder="Search team members..."
              style={styles.input}
            />
            <View style={styles.searchButton}>
              <Feather name="search" size={20} />
            </View>
          </View>
        </View>

        <View style={styles.GenericContainer2}>
          {filteredTeam.length === 0 ? (
            showLoading ? (
              <ActivityIndicator
                style={styles.LoadAnimation}
                size={100}
                color="#6200ea"
              />
            ) : (
              <View style={styles.MessageContent}>
                <Text style={styles.MessageText}>
                  {message || "Nenhum membro encontrado"}
                </Text>
              </View>
            )
          ) : !hasResults ? (
            <View style={styles.MessageContent}>
              <Text style={styles.MessageText}>
                {message || "Nenhum membro encontrado"}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredTeam}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
            />
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={openCreateMemberModal}
      >
        <Text style={styles.CreateButtonText}>Criar novo membro</Text>
      </TouchableOpacity>

      {/* Modal para criar membro */}
      <Modal
        transparent
        visible={createMemberModal}
        animationType="slide"
        onRequestClose={() => setCreateMemberModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setCreateMemberModal(false)}
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
                    <Text style={styles.MessageText}>{ModalMessage}</Text>
                  </View>
                )}
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Novo Membro</Text>
                <View style={styles.GenericContainer}>
                  <TextInput
                    style={styles.input}
                    value={newMember.name}
                    onChangeText={(text) =>
                      setNewMember({ ...newMember, name: text })
                    }
                    placeholder="Nome"
                  />
                  <TextInput
                    style={styles.input}
                    value={newMember.email}
                    onChangeText={(text) =>
                      setNewMember({ ...newMember, email: text })
                    }
                    placeholder="Email"
                  />
                  <TextInputMask
                    type={"custom"}
                    options={{
                      mask: "999.999.999-99",
                    }}
                    style={styles.input}
                    value={newMember.cpf}
                    onChangeText={(text) =>
                      setNewMember({ ...newMember, cpf: text })
                    }
                    placeholder="CPF"
                  />
                  <TextInputMask
                    type={"custom"}
                    options={{
                      mask: "(99) 99999-9999",
                    }}
                    style={styles.input}
                    value={newMember.phone}
                    onChangeText={(text) =>
                      setNewMember({ ...newMember, phone: text })
                    }
                    placeholder="Telefone"
                  />
                </View>
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
                    onPress={() => {
                      addMember(newMember);
                    }}
                  >
                    <Text style={styles.SaveButtonText}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal para editar membro */}
      <Modal
        transparent
        visible={editMemberModal}
        animationType="slide"
        onRequestClose={() => setEditMemberModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setEditMemberModal(false)}
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
                    <Text style={styles.MessageText}>{ModalMessage}</Text>
                  </View>
                )}
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Editar Membro</Text>
                <View style={styles.GenericContainer}>
                  <TextInput
                    style={styles.input}
                    value={currentMember?.name}
                    onChangeText={(text) =>
                      setCurrentMember((prev) => ({ ...prev, name: text }))
                    }
                    placeholder="Nome"
                  />
                  <TextInput
                    style={styles.input}
                    value={currentMember?.email}
                    onChangeText={(text) =>
                      setCurrentMember((prev) => ({ ...prev, email: text }))
                    }
                    placeholder="Email"
                  />
                  <TextInput
                    style={styles.input}
                    value={currentMember?.cpf}
                    onChangeText={(text) =>
                      setCurrentMember((prev) => ({ ...prev, cpf: text }))
                    }
                    placeholder="CPF"
                  />
                  <TextInput
                    style={styles.input}
                    value={currentMember?.phone}
                    onChangeText={(text) =>
                      setCurrentMember((prev) => ({ ...prev, phone: text }))
                    }
                    placeholder="Telefone"
                  />
                </View>
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
                    onPress={() => {
                      editMember();
                    }}
                  >
                    <Text style={styles.SaveButtonText}>Salvar alterações</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.DeleteButton, { backgroundColor: "red" }]}
                    onPress={() => {
                      deleteMember(currentMember.id);
                    }}
                  >
                    <Text style={styles.DeleteButtonText}>Excluir Membro</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};
export default TeamManagementPage;

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
  memberItem: {
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
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleButton: {
    width: 100,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
  },
  on: {
    backgroundColor: "#4caf50",
  },
  off: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
