import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Markdown from 'react-native-markdown-display';
import { lifestyleData } from '../utils/mockData';

export default function ChatScreen({ route, navigation }) {
    const defaultPersonality = { id: 'general', name: 'fitness' };
    const personality = route.params?.personality || defaultPersonality;
    const [messages, setMessages] = useState([
        { id: '1', text: `Hello! I'm your ${personality.name} fitness companion. How can I help you today?`, sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    // usageDays is now calculated on the backend based on user registration date

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now().toString(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
            const token = await SecureStore.getItemAsync('userToken');

            const payload = {
                message: input,
                userContext: {
                    personality: personality.id,
                    lifestyleData
                }
            };

            const response = await axios.post(`${API_URL}/api/chat`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const aiResponse = response.data.response || "I didn't understand that.";
            const aiMsg = { id: (Date.now() + 1).toString(), text: aiResponse, sender: 'ai', type: response.data.type };

            setMessages(prev => [...prev, aiMsg]);

        } catch (error) {
            console.error("API Error", error);
            const errorMsg = { id: (Date.now() + 1).toString(), text: "Sorry, I'm having trouble connecting to the server.", sender: 'ai' };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const markdownStyles = {
        body: {
            ...styles.messageText,
            ...styles.aiText,
        },
    };

    const renderItem = ({ item }) => (
        <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
            {item.sender === 'user' ? (
                <Text style={[styles.messageText, styles.userText]}>{item.text}</Text>
            ) : (
                <Markdown style={markdownStyles}>
                    {item.text}
                </Markdown>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#134E5E', '#71B280']}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>{personality.name === 'fitness' ? 'Fitness Companion' : personality.name}</Text>
                    <Text style={styles.headerSubtitle}>AI Assistant</Text>
                </View>
            </LinearGradient>

            <FlatList
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />

            {loading && <ActivityIndicator size="small" color="#134E5E" style={{ margin: 10 }} />}

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Ask about fitness..."
                        placeholderTextColor="#999"
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                        <Ionicons name="send" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        marginBottom: 10
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#fff',
        textTransform: 'capitalize'
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
    },
    listContent: {
        padding: 20,
        paddingBottom: 20,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 15,
        borderRadius: 20,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#134E5E',
        borderBottomRightRadius: 5,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderBottomLeftRadius: 5,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    userText: {
        color: '#fff',
    },
    aiText: {
        color: '#333',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        alignItems: 'center',
        marginBottom: 85, // Account for Tab Bar height
    },
    input: {
        flex: 1,
        backgroundColor: '#f5f7fa',
        borderRadius: 25,
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginRight: 10,
        fontSize: 16,
        color: '#333'
    },
    sendButton: {
        backgroundColor: '#71B280',
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#71B280',
        shadowOpacity: 0.4,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4
    },
});

const markdownStyles = {
    body: {
        color: '#333',
        fontSize: 16,
    },
    strong: {
        fontWeight: 'bold',
    },
};
