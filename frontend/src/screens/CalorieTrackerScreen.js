import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function CalorieTrackerScreen({ navigation }) {
    const [dailyGoal, setDailyGoal] = useState(2500);
    const [currentCalories, setCurrentCalories] = useState(1250);
    const [meals, setMeals] = useState([
        { id: '1', name: 'Oatmeal & Berries', calories: 350, type: 'Breakfast' },
        { id: '2', name: 'Grilled Chicken Salad', calories: 450, type: 'Lunch' },
        { id: '3', name: 'Greek Yogurt', calories: 150, type: 'Snack' },
    ]);

    // This would ideally open a modal or navigate to an "Add Food" screen
    const handleAddFood = () => {
        alert("Add Food feature coming soon!");
    };

    const renderMeal = ({ item }) => (
        <View style={styles.mealCard}>
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
            <Text style={styles.mealCalories}>{item.calories} kcal</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#FF9F43', '#FF6B6B']} style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Calorie Tracker</Text>
                    <TouchableOpacity style={styles.addButton} onPress={handleAddFood}>
                        <Ionicons name="add" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Progress Ring / Summary */}
                <View style={styles.summaryContainer}>
                    <Text style={styles.summaryLabel}>Calories Remaining</Text>
                    <Text style={styles.caloriesRemaining}>{dailyGoal - currentCalories}</Text>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${(currentCalories / dailyGoal) * 100}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{currentCalories} / {dailyGoal} kcal eaten</Text>
                </View>
            </LinearGradient>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Today's Meals</Text>
                <FlatList
                    data={meals}
                    renderItem={renderMeal}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            </View>
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
    mealCalories: { fontSize: 16, fontWeight: 'bold', color: '#FF9F43' }
});
