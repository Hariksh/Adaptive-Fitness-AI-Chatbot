import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, Modal, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function CalorieTrackerScreen({ navigation }) {
    const [dailyGoal, setDailyGoal] = useState(2500);
    const [currentCalories, setCurrentCalories] = useState(0);
    const [meals, setMeals] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);

    // Form Inputs & State
    const [foodName, setFoodName] = useState('');
    const [foodCalories, setFoodCalories] = useState('');
    const [foodType, setFoodType] = useState('Breakfast');
    const [editingMealId, setEditingMealId] = useState(null); // ID if editing, null if adding

    useFocusEffect(
        useCallback(() => {
            fetchMeals();
        }, [])
    );

    const fetchMeals = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

            const response = await axios.get(`${API_URL}/api/meals`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (Array.isArray(response.data)) {
                setMeals(response.data);
                const total = response.data.reduce((sum, item) => sum + item.calories, 0);
                setCurrentCalories(total);
            }
        } catch (error) {
            console.error("Error fetching meals", error);
        }
    };

    const handleSaveFood = async () => {
        if (!foodName || !foodCalories) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        try {
            const token = await SecureStore.getItemAsync('userToken');
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

            if (editingMealId) {
                // Update existing meal
                await axios.put(`${API_URL}/api/meals/${editingMealId}`, {
                    name: foodName,
                    calories: Number(foodCalories),
                    type: foodType
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                // Create new meal
                await axios.post(`${API_URL}/api/meals`, {
                    name: foodName,
                    calories: Number(foodCalories),
                    type: foodType
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            setModalVisible(false);
            resetForm();
            fetchMeals();

        } catch (error) {
            console.error("Error saving meal", error);
            Alert.alert("Error", "Failed to save meal");
        }
    };

    const openAddModal = () => {
        resetForm();
        setModalVisible(true);
    };

    const openEditModal = (meal) => {
        setEditingMealId(meal._id);
        setFoodName(meal.name);
        setFoodCalories(String(meal.calories));
        setFoodType(meal.type);
        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingMealId(null);
        setFoodName('');
        setFoodCalories('');
        setFoodType('Breakfast');
    };

    const renderMeal = ({ item }) => (
        <TouchableOpacity style={styles.mealCard} onPress={() => openEditModal(item)}>
            <View style={styles.mealIcon}>
                <Ionicons
                    name={item.type === 'Breakfast' ? 'sunny-outline' : item.type === 'Lunch' ? 'restaurant-outline' : 'moon-outline'}
                    size={24}
                    color="#FF9F43"
                />
            </View>
            <View style={styles.mealInfo}>
                <Text style={styles.mealName}>{item.name}</Text>
                <Text style={styles.mealType}>{item.type}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.mealCalories}>{item.calories} kcal</Text>
                <Text style={styles.editHint}>Edit</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#FF9F43', '#FF6B6B']} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Calorie Tracker</Text>
                    <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
                        <Ionicons name="add" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Progress Ring / Summary */}
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryLabel}>Calories Remaining</Text>
                    <Text style={styles.caloriesRemaining}>{dailyGoal - currentCalories}</Text>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${Math.min((currentCalories / dailyGoal) * 100, 100)}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{currentCalories} / {dailyGoal} kcal eaten</Text>
                </View>
            </LinearGradient>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Today's Meals</Text>
                <FlatList
                    data={meals}
                    renderItem={renderMeal}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            </View>

            {/* Add/Edit Food Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingMealId ? 'Edit Meal' : 'Add Meal'}</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Food Name (e.g. Apple)"
                            placeholderTextColor="#999"
                            value={foodName}
                            onChangeText={setFoodName}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Calories (e.g. 95)"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            value={foodCalories}
                            onChangeText={setFoodCalories}
                        />

                        <View style={styles.typeContainer}>
                            {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map(type => (
                                <TouchableOpacity
                                    key={type}
                                    style={[styles.typeButton, foodType === type && styles.typeButtonActive]}
                                    onPress={() => setFoodType(type)}
                                >
                                    <Text style={[styles.typeText, foodType === type && styles.typeTextActive]}>{type}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSaveFood}>
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fa' },
    header: {
        paddingTop: 50,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: 10
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
    backButton: { padding: 5 },
    addButton: { padding: 5 },

    summaryContainer: { alignItems: 'center' },
    summaryLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginBottom: 5 },
    caloriesRemaining: { color: '#fff', fontSize: 48, fontWeight: 'bold', marginBottom: 15 },

    progressBarBg: {
        width: '100%',
        height: 10,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 5,
        marginBottom: 10
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 5
    },
    progressText: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },

    content: { flex: 1, padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },

    list: { paddingBottom: 20 },
    mealCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2
    },
    mealIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF2E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    mealInfo: { flex: 1 },
    mealName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    mealType: { fontSize: 12, color: '#999', marginTop: 2 },
    mealCalories: { fontSize: 16, fontWeight: 'bold', color: '#FF9F43' },
    editHint: { fontSize: 10, color: '#999', marginTop: 2 },

    modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 15, marginBottom: 15, color: '#333' },

    typeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    typeButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, backgroundColor: '#f0f0f0' },
    typeButtonActive: { backgroundColor: '#FF9F43' },
    typeText: { color: '#666' },
    typeTextActive: { color: '#fff', fontWeight: 'bold' },

    modalButtons: { flexDirection: 'row', gap: 10 },
    cancelButton: { flex: 1, padding: 15, borderRadius: 10, backgroundColor: '#f5f5f5', alignItems: 'center' },
    saveButton: { flex: 1, padding: 15, borderRadius: 10, backgroundColor: '#FF9F43', alignItems: 'center' },
    cancelButtonText: { color: '#666', fontWeight: 'bold' },
    saveButtonText: { color: '#fff', fontWeight: 'bold' }
});
