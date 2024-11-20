import React, { useState, useEffect } from "react";
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
import { Feather } from "@expo/vector-icons";
import { Service, ServicesList } from "@data/Data";
import { fetchservices } from "@firebase/index";
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@firebase/index";

export default function Services() {
  const [text, onChangeText] = useState("");
  const [createServiceModal, setCreateServiceModal] = useState<boolean>(false);
  const [editServiceModal, setEditServiceModal] = useState<boolean>(false);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [newService, setNewService] = useState<Service>({
    id: "",
    name: "",
    desc: "",
  });
  const [currentService, setCurrentService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [ModalMessage, setModalMessage] = useState(null);
  const [isOn, setIsOn] = useState(false);
  const [loadingAnimation, setLoadingAnimation] = useState(false);
  const [Visualmessage, setVisualMessage] = useState(false);

  const [showLoading, setShowLoading] = useState(false);
  const [hasResults, setHasResults] = useState(true);
  const [descMaxLength] = useState(200);

  const openCreateServiceModal = () => {
    setNewService({
      id: "",
      name: "",
      desc: "",
    });
    setCreateServiceModal(true);
  };
  const openEditServiceModal = (service) => {
    setCurrentService(service);
    setEditServiceModal(true);
  };

  const addService = async (newService: Service) => {
    try {
      setLoading(true);
      setLoadingAnimation(true);
      await addDoc(collection(db, "servicos"), {
        name: newService.name,
        desc: newService.desc,
      });
      await fetchservices(setServices);
      setLoadingAnimation(false);
      setModalMessage("Serviço adicionado com sucesso!");
      setVisualMessage(true);
    } catch (error) {
      setLoadingAnimation(false);
      console.error("Erro ao adicionar serviço: ", error);
      setModalMessage("Erro ao adicionar serviço.");
      setVisualMessage(true);
    } finally {
      setTimeout(() => {
        setCreateServiceModal(false);
        setLoading(false);
        setLoadingAnimation(false);
        setVisualMessage(false);
        setModalMessage("");
      }, 1000);
    }
  };
  const COLLECTION_NAME = "servicos";
  const editService = async () => {
    if (!currentService?.id) {
      console.error("Erro: Serviço inválido ou não selecionado.");
      setModalMessage("Erro ao editar Serviço.");
      setVisualMessage(true);
      return;
    }

    try {
      setLoading(true);
      setLoadingAnimation(true);
      await updateDoc(doc(db, COLLECTION_NAME, currentService.id), {
        name: currentService.name,
        email: currentService.email || "",
        cpf: currentService.cpf || "",
        phone: currentService.phone || "",
      });
      await fetchservices(setServices);

      setLoadingAnimation(false);
      setModalMessage("Serviço editado com sucesso!");
      setVisualMessage(true);
    } catch (error) {
      console.error("Erro ao editar Serviço:", error);
      setModalMessage("Erro ao editar Serviço.");
      setVisualMessage(true);
    } finally {
      setTimeout(() => {
        resetModalState();
      }, 1000);
    }
  };
  const deleteService = async (serviceId: string) => {
    if (!serviceId) {
      console.error("Erro: ID do serviço não fornecido.");
      setModalMessage("Erro ao excluir Serviço.");
      setVisualMessage(true);
      return;
    }

    try {
      setLoading(true);
      setLoadingAnimation(true);
      await deleteDoc(doc(db, COLLECTION_NAME, serviceId));
      await fetchservices(setServices);

      setLoadingAnimation(false);
      setModalMessage("Serviço excluído com sucesso!");
      setVisualMessage(true);
    } catch (error) {
      console.error("Erro ao excluir Serviço:", error);
      setModalMessage("Erro ao excluir Serviço.");
      setVisualMessage(true);
    } finally {
      setTimeout(() => {
        resetModalState();
      }, 1000);
    }
  };

  const resetModalState = () => {
    setEditServiceModal(false);
    setCurrentService(null);
    setLoading(false);
    setLoadingAnimation(false);
    setVisualMessage(false);
    setModalMessage("");
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => openEditServiceModal(item)}
      style={styles.memberItem}
    >
      <Text>{item.name}</Text>
    </TouchableOpacity>
  );

  const toggleOrder = () => {
    setIsOn(!isOn);
    setFilteredServices(filteredServices.reverse());
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowLoading(false);
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    fetchservices(setServices);
    setFilteredServices([]);
  }, []);

  useEffect(() => {
    const filtered = services
      .filter((service) =>
        service.name.toLowerCase().startsWith(text.toLowerCase())
      )
      .sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { numeric: true })
      );

    setFilteredServices(filtered);
    setHasResults(filtered.length > 0);
  }, [text, services]);

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
          {services.length === 0 ? (
            showLoading ? (
              <ActivityIndicator
                style={styles.LoadAnimation}
                size={100}
                color="#6200ea"
              />
            ) : (
              <View style={styles.MessageContent}>
                <Text style={styles.MessageText}>
                  {message || "Nenhum serviço encontrado"}
                </Text>
              </View>
            )
          ) : !hasResults ? (
            <View style={styles.MessageContent}>
              <Text style={styles.MessageText}>
                {message || "Nenhum serviço encontrado"}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredServices}
              renderItem={renderItem}
              keyExtractor={(item) => item.id.toString()}
            />
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={openCreateServiceModal}
      >
        <Text style={styles.CreateButtonText}>Criar novo serviço</Text>
      </TouchableOpacity>

      {/* Modal para criar membro */}
      <Modal
        transparent
        visible={createServiceModal}
        animationType="slide"
        onRequestClose={() => setCreateServiceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setCreateServiceModal(false)}
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
                <Text style={styles.modalTitle}>Novo Serviço</Text>
                <View style={styles.GenericContainer}>
                  <TextInput
                    style={styles.input}
                    value={newService.name}
                    onChangeText={(text) =>
                      setNewService({ ...newService, name: text })
                    }
                    placeholder="Nome"
                  />
                  <TextInput
                    style={[styles.input, styles.descInput]}
                    value={newService?.desc || ""}
                    onChangeText={(text) =>
                      setNewService({ ...newService, desc: text })
                    }
                    placeholder="Descrição do serviço"
                    multiline={true}
                  />
                  <Text style={styles.charCount}>
                    {newService?.desc?.length || 0}/{descMaxLength} caracteres
                  </Text>
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
                      addService(newService);
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
        visible={editServiceModal}
        animationType="slide"
        onRequestClose={() => setEditServiceModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              onPress={() => setEditServiceModal(false)}
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
                <Text style={styles.modalTitle}>Novo Serviço</Text>
                <View style={styles.GenericContainer}>
                  <TextInput
                    style={styles.input}
                    value={currentService?.name}
                    onChangeText={(text) =>
                      setCurrentService((prev) => ({ ...prev, name: text }))
                    }
                    placeholder="Nome"
                  />
                  <TextInput
                    style={styles.input}
                    value={currentService?.desc}
                    onChangeText={(text) =>
                      setCurrentService((prev) => ({ ...prev, desc: text }))
                    }
                    placeholder="Descrição do serviço"
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
                      editService();
                    }}
                  >
                    <Text style={styles.SaveButtonText}>Salvar alterações</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.DeleteButton, { backgroundColor: "red" }]}
                    onPress={() => {
                      deleteService(currentService.id);
                    }}
                  >
                    <Text style={styles.DeleteButtonText}>Excluir Serviço</Text>
                  </TouchableOpacity>
                </View>
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
  descInput: {
    flex: 1,
    textAlignVertical: "top",
  },
  charCount: {
    textAlign: "right",
    color: "#999",
    marginBottom: 10,
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
