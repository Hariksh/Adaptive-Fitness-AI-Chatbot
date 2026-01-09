import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import Markdown from 'react-native-markdown-display';
import { lifestyleData } from '../utils/mockData';

export default function ChatScreen({ route }) {
    const { personality } = route.params;
    const [messages, setMessages] = useState([
        { id: '1', text: `Hello! I'm your ${personality.name} fitness companion. How can I help you today?`, sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Usage Duration Simulation (randomized for demo/MVP)
    // In a real app, this would be stored in AsyncStorage/Database
    const usageDays = Math.floor(Math.random() * 12);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now().toString(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Use base URL and append endpoint
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

            const payload = {
                message: input,
                userContext: {
                    personality: personality.id,
                    usageDays,
                    lifestyleData
                }
            };

            const response = await axios.post(`${API_URL}/api/chat`, payload);

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
        // You can add more specific markdown styles here if needed, e.g.,
        // heading1: { color: 'blue' },
        // list_item: { color: 'green' },
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
        <SafeAreaView style={styles.container}>
            <FlatList
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />


            {loading && <ActivityIndicator size="small" color="#007AFF" style={{ margin: 10 }} />}

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Ask about fitness..."
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                        <Text style={styles.sendButtonText}>Send</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    listContent: {
        padding: 15,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 15,
        marginBottom: 10,
    },
    userBubble: {
        alignSelf: 'flex-end',
        backgroundColor: '#007AFF',
        borderBottomRightRadius: 2,
    },
    aiBubble: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderBottomLeftRadius: 2,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    messageText: {
        fontSize: 16,
    },
    userText: {
        color: '#fff',
    },
    aiText: {
        color: '#333',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
        fontSize: 16,
    },
    sendButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
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
