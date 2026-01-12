import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Markdown from 'react-native-markdown-display';

export default function ChatHistoryScreen({ navigation }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            fetchHistory();
        }, [])
    );

    const fetchHistory = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://adaptive-fitness-ai-chatbot-6ci2.onrender.com';
            const response = await axios.get(`${API_URL}/api/chat/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(response.data);
        } catch (error) {
            console.error("Error fetching chat history", error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={[styles.card, item.role === 'user' ? styles.userCard : styles.aiCard]}>
            <View style={styles.headerRow}>
                <Ionicons name={item.role === 'user' ? "person" : "logo-github"} size={16} color={item.role === 'user' ? "#134E5E" : "#71B280"} />
                <Text style={styles.roleText}>{item.role === 'user' ? 'You' : 'AI Coach'}</Text>
                <Text style={styles.date}>{new Date(item.timestamp).toLocaleString()}</Text>
            </View>
            <View style={styles.content}>
                {item.role === 'user' ? (
                    <Text style={styles.messageText}>{item.content}</Text>
                ) : (
                    <Markdown style={markdownStyles}>{item.content.substring(0, 150) + (item.content.length > 150 ? '...' : '')}</Markdown>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#134E5E', '#71B280']} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Chat History</Text>
                    <View style={{ width: 24 }} />
                </View>
            </LinearGradient>

            {loading ? (
                <ActivityIndicator size="large" color="#134E5E" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={item => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="chatbubbles-outline" size={48} color="#ccc" />
                            <Text style={styles.emptyText}>No conversation history yet.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fa' },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: 10
    },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
    backButton: { padding: 5 },

    list: { padding: 20 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2
    },
    userCard: { borderLeftWidth: 4, borderLeftColor: '#134E5E' },
    aiCard: { borderLeftWidth: 4, borderLeftColor: '#71B280', backgroundColor: '#f9fff9' },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    roleText: { marginLeft: 8, fontWeight: 'bold', color: '#333', fontSize: 14, flex: 1 },
    date: { fontSize: 12, color: '#999' },
    content: { marginTop: 5 },
    messageText: { fontSize: 15, color: '#444' },

    emptyState: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#999', marginTop: 10 }
});

const markdownStyles = {
    body: { fontSize: 14, color: '#555' },
};
