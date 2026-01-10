import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function WorkoutLogScreen({ navigation }) {
    const [activity, setActivity] = useState('');
    const [duration, setDuration] = useState('');
    const [calories, setCalories] = useState('');
    const [notes, setNotes] = useState('');

    const handleSave = async () => {
        if (!activity || !duration) {
            Alert.alert('Missing Info', 'Please enter an activity and duration.');
            return;
        }

        try {
            const token = await SecureStore.getItemAsync('userToken');
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

            await axios.post(`${API_URL}/api/workouts`, {
                activityType: activity,
                duration: parseFloat(duration),
                caloriesBurned: parseFloat(calories) || 0,
                notes: notes
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Navigate to Success Screen
            navigation.replace('WorkoutSuccess');

        } catch (error) {
            console.error("Error logging workout", error);
            Alert.alert('Error', 'Failed to log workout');
        }
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#FF512F', '#DD2476']} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Log Workout</Text>
                    <View style={{ width: 28 }} />
                </View>
            </LinearGradient>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.label}>Activity Type</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Running, Gym, Yoga"
                        placeholderTextColor="#999"
                        value={activity}
                        onChangeText={setActivity}
                    />

                    <Text style={styles.label}>Duration (minutes)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="30"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={duration}
                        onChangeText={setDuration}
                    />

                    <Text style={styles.label}>Calories Burned (optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. 250"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={calories}
                        onChangeText={setCalories}
                    />

                    <Text style={styles.label}>Notes</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="How did it feel?"
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={4}
                        value={notes}
                        onChangeText={setNotes}
                        textAlignVertical="top"
                    />

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Save Workout</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9' },
    header: {
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    backButton: { padding: 5, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 15 },

    keyboardView: { flex: 1 },
    content: { padding: 25 },

    label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8, marginTop: 15, textTransform: 'uppercase' },
    input: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        fontSize: 16,
        color: '#333',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2
    },
    textArea: { minHeight: 100 },

    saveButton: {
        backgroundColor: '#FF512F',
        borderRadius: 20,
        padding: 18,
        alignItems: 'center',
        marginTop: 40,
        shadowColor: '#FF512F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5
    },
    saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
