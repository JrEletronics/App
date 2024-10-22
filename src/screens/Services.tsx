import { useState, useEffect, useRef } from "react";
import { FlatList, Text, TextInput, View, SafeAreaView, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Animated } from "react-native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Service, ServicesList } from "../Data/Data";
import { fetchservices } from "../firebase/index";
import { getFirestore, collection, addDoc, getDocs,doc,deleteDoc,updateDoc} from 'firebase/firestore';
import { app, db } from '../firebase/index'; // substitua pelo caminho correto

const generateRandomId = () => Math.floor(100000 + Math.random() * 900000);

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
    const [currentService, setCurrentService] = useState<Service | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string | null>(null);
    const [descMaxLength] = useState(200);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    const addService = async (newService: Service) => {
        
    
        try {
            setCreateServiceModal(false);
            setLoading(true);
          // Adiciona uma nova tarefa na coleção "demandas"
          await addDoc(collection(db, 'servicos'), {
            name: newService.name,
            desc: newService.desc,
          });
      
          console.log("Tarefa adicionada com sucesso!");
          fetchservices(setServices);
          setFilteredServices(ServicesList);
        } catch (error) {
          console.error("Erro ao adicionar a tarefa: ", error);
        }
        finally{
          setLoading(false);
        }
      };

      const deleteService = async (ServiceId) => {
        try {
          // Referência ao documento que deseja excluir
          const taskDocRef = doc(db, 'servicos', ServiceId.toString()); // Converta ServiceId para string se necessário
          
          setEditServiceModal(false);
          setLoading(true);
      
          // Exclui o documento
          await deleteDoc(taskDocRef);
          
          // Atualiza a lista de tarefas, removendo a tarefa excluída
          const updatedServices = ServicesList.filter(Service => Service.id !== ServiceId);
          setServices(updatedServices);
          setFilteredServices(updatedServices); // Atualizar tarefas filtradas se necessário
      
          console.log(`Tarefa ${ServiceId} excluída com sucesso.`);
          showMessage("Tarefa excluída com sucesso!"); // Exibir mensagem de sucesso
          fetchservices(setServices);
      
          // Desativar loading após um delay, se necessário
          setTimeout(() => {
            setLoading(false);
          }, 500); // Manter o mesmo delay da função de edição, ajuste conforme necessário
      
        } catch (error) {
          console.error('Erro ao excluir tarefa: ', error);
          setLoading(false); // Garantir que o loading seja desativado em caso de erro
        }
      };
      const editService = async () => {
        try {
          if (currentService) {
            setEditServiceModal(false);
            setLoading(true);
      
            // Referência ao documento que deseja atualizar
            const taskDocRef = doc(db, 'servicos', currentService.id.toString()); // Converta currentService.id para string se necessário
      
            // Atualiza o documento no Firestore
            await updateDoc(taskDocRef, {
                name: currentService.name,
                desc: currentService.desc,
            });
      
            // Atualiza a lista de tarefas localmente
            const updatedServices = ServicesList.map((service) =>
                service.id === currentService.id ? currentService : service
            );
            setServices(updatedServices);
            setFilteredServices(updatedServices); // Atualiza tarefas filtradas se necessário
      
            console.log(`Tarefa ${currentService.id} editada com sucesso.`);
            showMessage("Tarefa editada com sucesso!"); // Exibir mensagem de sucesso
            fetchservices(setServices);
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
        fetchservices(setServices);
        setFilteredServices(ServicesList);
    }, []);

    useEffect(() => {
        const filtered = services
            .filter((service) => service.name.toLowerCase().includes(text.toLowerCase()))
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

        setFilteredServices(filtered);
    }, [text, services]);

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

    const handleEditService = () => {
        setEditServiceModal(false);
        setLoading(true);
        if (currentService) {
            setTimeout(() => {
                const updatedServices = services.map((service) =>
                    service.id === currentService.id ? currentService : service
                );
                setServices(updatedServices);
                setFilteredServices(updatedServices);
                setLoading(false);
                showMessage("Serviço editado com sucesso!");
            }, 500);
        }
    };    

    const renderItem = ({ item }: { item: Service }) => (
        <TouchableOpacity
            style={styles.serviceItem}
            onPress={() => {
                setCurrentService(item);
                setEditServiceModal(true);
            }}
        >
            <Text style={styles.serviceTitle}>{item.name}</Text>
            <Text>{item.desc}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.header}>
                <Text style={styles.headerText}>Cadastro de Serviços</Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    onChangeText={onChangeText}
                    value={text}
                    placeholder="Buscar serviços..."
                    style={styles.input}
                />
                <TouchableOpacity
                    onPress={() => setCreateServiceModal(true)}
                    style={styles.createButton}
                >
                    <Text style={styles.buttonText}>Criar Novo Serviço</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                style={styles.flatList}
                contentContainerStyle={styles.flatListContent}
                data={filteredServices}
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

            <Modal
                transparent={true}
                animationType="fade"
                visible={createServiceModal}
                onRequestClose={() => setCreateServiceModal(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setCreateServiceModal(false)}
                    style={styles.modalBackground}
                >
                    <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
                        <Text style={styles.modalTitle}>Criar Novo Serviço</Text>
                        <TextInput
                            placeholder="Nome do Serviço"
                            onChangeText={(text) => setNewService({ ...newService, name: text })}
                            value={newService.name}
                            style={styles.modalInput}
                            editable={!loading}
                        />
                        <TextInput
                            placeholder="Descrição"
                            onChangeText={(text) => {
                                if (text.length <= descMaxLength) {
                                    setNewService({ ...newService, desc: text });
                                }
                            }}
                            value={newService.desc}
                            style={[styles.modalInput, styles.descInput]}
                            editable={!loading}
                            multiline={true}
                        />
                        <Text style={styles.charCount}>
                            {newService.desc.length}/{descMaxLength} caracteres
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalActionButton}
                                onPress={()=>addService(newService)}
                                disabled={loading}
                            >
                                <Text style={styles.modalActionButtonText}>Criar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setCreateServiceModal(false)}
                            >
                                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal
                transparent={true}
                animationType="fade"
                visible={editServiceModal}
                onRequestClose={() => !loading && setEditServiceModal(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => !loading && setEditServiceModal(false)}
                    style={styles.modalBackground}
                >
                    <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Editar Serviço</Text>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => !loading && setEditServiceModal(false)}
                            >
                                <Icon name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        {currentService && (
                            <>
                                <TextInput
                                    placeholder="Nome do Serviço"
                                    onChangeText={(text) => setCurrentService({ ...currentService, name: text })}
                                    value={currentService.name}
                                    style={styles.modalInput}
                                    editable={!loading}
                                />
                                <TextInput
                                    placeholder="Descrição"
                                    onChangeText={(text) => {
                                        if (text.length <= descMaxLength) {
                                            setCurrentService({ ...currentService, desc: text });
                                        }
                                    }}
                                    value={currentService.desc}
                                    style={[styles.modalInput, styles.descInput]}
                                    editable={!loading}
                                    multiline={true}
                                />
                                <Text style={styles.charCount}>
                                    {currentService.desc.length}/{descMaxLength} caracteres
                                </Text>
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={styles.modalActionButton}
                                        onPress={editService}
                                        disabled={loading}
                                    >
                                        <Text style={styles.modalActionButtonText}>Salvar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.modalCancelButton}
                                        onPress={() => currentService && deleteService(currentService.id)}
                                        disabled={loading}
                                    >
                                        <Text style={styles.modalCancelButtonText}>Excluir</Text>
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
    serviceItem: {
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    serviceTitle: {
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
    },
});
