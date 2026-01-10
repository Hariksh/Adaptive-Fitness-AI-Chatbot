import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function ActivityHistoryScreen({ navigation }) {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            fetchHistory();
        }, [])
    );

    const fetchHistory = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await axios.get(`${API_URL}/api/workouts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWorkouts(response.data);
        } catch (error) {
            console.error("Error fetching history", error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.iconContainer}>
                <Ionicons name="barbell" size={24} color="#fff" />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.activityName}>{item.activityType}</Text>
                <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
            </View>
            <View style={styles.stats}>
                <Text style={styles.statText}>{item.duration} min</Text>
                {item.caloriesBurned > 0 && <Text style={styles.subStat}>{item.caloriesBurned} kcal</Text>}
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
                    <Text style={styles.headerTitle}>History</Text>
                    <View style={{ width: 24 }} />
                </View>
            </LinearGradient>

            {loading ? (
                <ActivityIndicator size="large" color="#134E5E" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={workouts}
                    keyExtractor={item => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="documents-outline" size={48} color="#ccc" />
                            <Text style={styles.emptyText}>No workouts logged yet.</Text>
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
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#134E5E',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    cardContent: { flex: 1 },
    activityName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    date: { fontSize: 13, color: '#888', marginTop: 3 },
    stats: { alignItems: 'flex-end' },
    statText: { fontSize: 16, fontWeight: 'bold', color: '#134E5E' },
    subStat: { fontSize: 12, color: '#999' },

    emptyState: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#999', marginTop: 10 }
});
