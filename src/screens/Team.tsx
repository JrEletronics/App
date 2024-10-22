import { useState, useEffect, useRef } from "react";
import { FlatList, Text, TextInput, View, SafeAreaView, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Animated } from "react-native";
import { TeamMenber, Team } from "../Data/Data";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchTeam } from "../firebase/index";
import { getFirestore, collection, addDoc, getDocs,doc,deleteDoc,updateDoc} from 'firebase/firestore';
import { app, db } from '../firebase/index'; // substitua pelo caminho correto
const generateRandomId = () => Math.floor(100000 + Math.random() * 900000);

export default function TeamManagement() {
    const [text, onChangeText] = useState("");
    const [createMemberModal, setCreateMemberModal] = useState<boolean>(false);
    const [editMemberModal, setEditMemberModal] = useState<boolean>(false);
    const [team, setTeam] = useState<TeamMenber[]>(Team);
    const [filteredTeam, setFilteredTeam] = useState<TeamMenber[]>(Team);
    const [newMember, setNewMember] = useState<TeamMenber>({
        id: "",
        name: "",
        email: "",
        cpf: "",
        phone: ""
    });
    const [currentMember, setCurrentMember] = useState<TeamMenber | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string | null>(null);

    const fadeAnim = useRef(new Animated.Value(0)).current;

    const addTeam = async (newMember: TeamMenber) => {
        
    
        try {
            setCreateMemberModal(false);
            setLoading(true);
          // Adiciona uma nova tarefa na coleção "demandas"
          await addDoc(collection(db, 'funcionarios'), {
            name: newMember.name,
            email: newMember.email,
            cpf: newMember.cpf,
            phone: newMember.phone,
          });
      
          console.log("Tarefa adicionada com sucesso!");
          fetchTeam(setTeam);
          setFilteredTeam(team);
        } catch (error) {
          console.error("Erro ao adicionar a tarefa: ", error);
        }
        finally{
          setLoading(false);
        }
      };

      const deleteMenber = async (MenberId) => {
        try {
          // Referência ao documento que deseja excluir
          const taskDocRef = doc(db, 'funcionarios', MenberId.toString()); // Converta MenberId para string se necessário
          
          setEditMemberModal(false);
          setLoading(true);
      
          // Exclui o documento
          await deleteDoc(taskDocRef);
          
          // Atualiza a lista de tarefas, removendo a tarefa excluída
          const updatedTeam = Team.filter(task => task.id !== MenberId);
          setTeam(updatedTeam);
          setFilteredTeam(updatedTeam); // Atualizar tarefas filtradas se necessário
      
          console.log(`Tarefa ${MenberId} excluída com sucesso.`);
          showMessage("Tarefa excluída com sucesso!"); // Exibir mensagem de sucesso
          fetchTeam(setTeam);
      
          // Desativar loading após um delay, se necessário
          setTimeout(() => {
            setLoading(false);
          }, 500); // Manter o mesmo delay da função de edição, ajuste conforme necessário
      
        } catch (error) {
          console.error('Erro ao excluir tarefa: ', error);
          setLoading(false); // Garantir que o loading seja desativado em caso de erro
        }
      };

      const editMenber = async () => {
        try {
          if (currentMember) {
            setEditMemberModal(false);
            setLoading(true); // Ativar loading
      
            // Referência ao documento que deseja atualizar
            const taskDocRef = doc(db, 'funcionarios', currentMember.id.toString()); // Converta currentMember.id para string se necessário
      
            // Atualiza o documento no Firestore
            await updateDoc(taskDocRef, {
                name: currentMember.name,
                email: currentMember.email,
                cpf: currentMember.cpf,
                phone: currentMember.phone,
            });
      
            // Atualiza a lista de tarefas localmente
            const updatedTeam = Team.map((member) =>
                member.id === currentMember.id ? currentMember : member
            );
            fetchTeam(setTeam);
            setFilteredTeam(updatedTeam); // Atualiza tarefas filtradas se necessário
      
            console.log(`Tarefa ${currentMember.id} editada com sucesso.`);
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
        fetchTeam(setTeam);
        setFilteredTeam(team);
    }, []);

    useEffect(() => {
        const filtered = team
            .filter((member) =>
                member.name.toLowerCase().includes(text.toLowerCase())
            )
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

        setFilteredTeam(filtered);
    }, [text, team]);

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
    

    

    const renderItem = ({ item }: { item: TeamMenber }) => (
        <TouchableOpacity
            style={styles.memberItem}
            onPress={() => {
                setCurrentMember(item);
                setEditMemberModal(true);
            }}
        >
            <Text style={styles.memberTitle}>{item.name}</Text>
            <Text>Email: {item.email}</Text>
            <Text>CPF: {item.cpf}</Text>
            <Text>Telefone: {item.phone}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.header}>
                <Text style={styles.headerText}>Equipe</Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    onChangeText={onChangeText}
                    value={text}
                    placeholder="Buscar membros da equipe..."
                    style={styles.input}
                />
                <TouchableOpacity
                    onPress={() => setCreateMemberModal(true)}
                    style={styles.createButton}
                >
                    <Text style={styles.buttonText}>Adicionar Membro</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                style={styles.flatList}
                contentContainerStyle={styles.flatListContent}
                data={filteredTeam}
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
                visible={createMemberModal}
                onRequestClose={() => setCreateMemberModal(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setCreateMemberModal(false)}
                    style={styles.modalBackground}
                >
                    <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
                        <Text style={styles.modalTitle}>Adicionar Membro</Text>
                        <TextInput
                            placeholder="Nome"
                            onChangeText={(text) => setNewMember({ ...newMember, name: text })}
                            value={newMember.name}
                            style={styles.modalInput}
                            editable={!loading}
                        />
                        <TextInput
                            placeholder="Email"
                            onChangeText={(text) => setNewMember({ ...newMember, email: text })}
                            value={newMember.email}
                            style={styles.modalInput}
                            editable={!loading}
                        />
                        <TextInput
                            placeholder="CPF"
                            onChangeText={(text) => setNewMember({ ...newMember, cpf: text })}
                            value={newMember.cpf}
                            style={styles.modalInput}
                            editable={!loading}
                        />
                        <TextInput
                            placeholder="Telefone"
                            onChangeText={(text) => setNewMember({ ...newMember, phone: text })}
                            value={newMember.phone}
                            style={styles.modalInput}
                            editable={!loading}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalActionButton}                                
                                onPress={()=>addTeam(newMember)}
                                disabled={loading}
                            >
                                <Text style={styles.modalActionButtonText}>Adicionar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setCreateMemberModal(false)}
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
                visible={editMemberModal}
                onRequestClose={() => !loading && setEditMemberModal(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => !loading && setEditMemberModal(false)}
                    style={styles.modalBackground}
                >
                    <View style={styles.modalContainer} onStartShouldSetResponder={() => true}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Editar Membro</Text>
                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => !loading && setEditMemberModal(false)}
                            >
                                <Icon name="close" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        {currentMember && (
                            <>
                                <TextInput
                                    placeholder="Nome"
                                    onChangeText={(text) => setCurrentMember({ ...currentMember, name: text })}
                                    value={currentMember.name}
                                    style={styles.modalInput}
                                    editable={!loading}
                                />
                                <TextInput
                                    placeholder="Email"
                                    onChangeText={(text) => setCurrentMember({ ...currentMember, email: text })}
                                    value={currentMember.email}
                                    style={styles.modalInput}
                                    editable={!loading}
                                />
                                <TextInput
                                    placeholder="CPF"
                                    onChangeText={(text) => setCurrentMember({ ...currentMember, cpf: text })}
                                    value={currentMember.cpf}
                                    style={styles.modalInput}
                                    editable={!loading}
                                />
                                <TextInput
                                    placeholder="Telefone"
                                    onChangeText={(text) => setCurrentMember({ ...currentMember, phone: text })}
                                    value={currentMember.phone}
                                    style={styles.modalInput}
                                    editable={!loading}
                                />
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={styles.modalActionButton}
                                        onPress={editMenber}
                                        disabled={loading}
                                    >
                                        <Text style={styles.modalActionButtonText}>Salvar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.modalCancelButton}
                                        onPress={() => currentMember && deleteMenber(currentMember.id)}                                
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
    memberItem: {
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    memberTitle: {
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
