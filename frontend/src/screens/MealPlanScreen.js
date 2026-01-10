import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function MealPlanScreen({ navigation }) {
    const [mealPlan, setMealPlan] = useState(null);
    const [loading, setLoading] = useState(false);

    const generateMealPlan = async () => {
        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

            // We can reuse the chat endpoint with a specific system context request for now
            // or create a dedicated endpoint. using chat for flexibility.
            const payload = {
                message: "Generate a healthy daily meal plan for me considering I want to stay fit.",
                userContext: {
                    type: 'meal_plan_generation'
                }
            };

            const response = await axios.post(`${API_URL}/api/chat`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMealPlan(response.data.response);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to generate meal plan. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#11998e', '#38ef7d']} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>AI Meal Planner</Text>
                    <View style={{ width: 24 }} />
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.introCard}>
                    <Ionicons name="nutrition" size={48} color="#11998e" style={{ marginBottom: 10 }} />
                    <Text style={styles.introTitle}>Fuel Your Body</Text>
                    <Text style={styles.introText}>
                        Get a personalized meal plan tailored to your fitness goals instantly with AI.
                    </Text>

                    <TouchableOpacity
                        style={styles.generateButton}
                        onPress={generateMealPlan}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>{mealPlan ? "Regenerate Plan" : "Generate Plan"}</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {mealPlan && (
                    <View style={styles.planContainer}>
                        <Text style={styles.planHeader}>Your Plan</Text>
                        <View style={styles.markdownBox}>
                            <Markdown style={markdownStyles}>
                                {mealPlan}
                            </Markdown>
                        </View>
                    </View>
                )}
            </ScrollView>
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

    content: { padding: 20 },

    introCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        marginBottom: 20
    },
    introTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    introText: { textAlign: 'center', color: '#666', marginBottom: 20, lineHeight: 22 },

    generateButton: {
        backgroundColor: '#11998e',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#11998e',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3
    },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    planContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20
    },
    planHeader: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    markdownBox: {
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 10
    }
});

const markdownStyles = {
    body: { fontSize: 16, color: '#333', lineHeight: 24 },
    heading1: { fontSize: 20, fontWeight: 'bold', color: '#11998e', marginBottom: 10, marginTop: 10 },
    heading2: { fontSize: 18, fontWeight: 'bold', color: '#11998e', marginBottom: 8, marginTop: 15 },
    strong: { fontWeight: 'bold', color: '#333' }
};
