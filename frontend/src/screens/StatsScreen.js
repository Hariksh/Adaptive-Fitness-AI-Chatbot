import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity, Modal, TextInput, Alert, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, ProgressChart } from "react-native-chart-kit";
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const screenWidth = Dimensions.get("window").width;

export default function StatsScreen() {
    const [weightData, setWeightData] = useState([0]);
    const [weightLabels, setWeightLabels] = useState(["Today"]);
    const [progressData, setProgressData] = useState({ labels: [], data: [] });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [newWeight, setNewWeight] = useState('');

    useFocusEffect(
        useCallback(() => {
            fetchStats();
        }, [])
    );

    const fetchStats = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch Weight History
            const weightRes = await axios.get(`${API_URL}/api/weight`, { headers });
            if (weightRes.data && weightRes.data.length > 0) {
                // Take last 6 entries for the graph
                const history = weightRes.data.slice(-6);
                setWeightData(history.map(item => item.weight));
                setWeightLabels(history.map(item => new Date(item.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })));
            } else {
                // Default dummy data if empty
                setWeightData([0]);
                setWeightLabels(["Start"]);
            }

            // Fetch Workout Stats
            const workoutRes = await axios.get(`${API_URL}/api/workouts/stats`, { headers });
            if (workoutRes.data && workoutRes.data.breakdown) {
                const breakdown = workoutRes.data.breakdown;
                // Limit to top 3 for the ring chart
                const top3 = breakdown.slice(0, 3);
                setProgressData({
                    labels: top3.map(item => item.label),
                    data: top3.map(item => item.percentage) // ProgressChart expects 0-1
                });
            }

            setLoading(false);
            setRefreshing(false);
        } catch (error) {
            console.error("Error fetching stats", error);
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleAddWeight = async () => {
        if (!newWeight) return;

        try {
            const token = await SecureStore.getItemAsync('userToken');
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

            await axios.post(`${API_URL}/api/weight`, {
                weight: parseFloat(newWeight)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setModalVisible(false);
            setNewWeight('');
            fetchStats(); // Refresh graph
            Alert.alert("Success", "Weight logged!");

        } catch (error) {
            console.error("Error logging weight", error);
            Alert.alert("Error", "Failed to log weight");
        }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchStats();
    }, []);

    const chartConfig = {
        backgroundGradientFrom: "#fff",
        backgroundGradientTo: "#fff",
        color: (opacity = 1) => `rgba(19, 78, 94, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
        decimalPlaces: 1,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: "#134E5E"
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#134E5E" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#134E5E', '#71B280']} style={styles.header}>
                <Text style={styles.headerTitle}>Your Progress</Text>
                <Text style={styles.headerSubtitle}>Tracking real data</Text>
            </LinearGradient>

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >

                {/* Weight Chart */}
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="analytics" size={24} color="#134E5E" />
                            <Text style={styles.cardTitle}>Weight Trend (kg)</Text>
                        </View>
                        <TouchableOpacity onPress={() => setModalVisible(true)}>
                            <Ionicons name="add-circle" size={28} color="#134E5E" />
                        </TouchableOpacity>
                    </View>

                    {weightData.length > 0 ? (
                        <LineChart
                            data={{
                                labels: weightLabels,
                                datasets: [{ data: weightData }]
                            }}
                            width={screenWidth - 60}
                            height={220}
                            yAxisSuffix="kg"
                            chartConfig={chartConfig}
                            bezier
                            style={styles.chart}
                        />
                    ) : (
                        <Text style={styles.noDataText}>No weight data yet.</Text>
                    )}
                </View>

                {/* Goals Progress */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="pie-chart" size={24} color="#134E5E" />
                        <Text style={styles.cardTitle}>Workout Type Distribution</Text>
                    </View>
                    {progressData.data.length > 0 ? (
                        <ProgressChart
                            data={progressData}
                            width={screenWidth - 60}
                            height={200}
                            strokeWidth={16}
                            radius={32}
                            chartConfig={{
                                ...chartConfig,
                                color: (opacity = 1) => `rgba(113, 178, 128, ${opacity})`,
                            }}
                            hideLegend={false}
                        />
                    ) : (
                        <View style={styles.noDataContainer}>
                            <Text style={styles.noDataText}>No workouts logged yet.</Text>
                        </View>
                    )}
                </View>

            </ScrollView>

            {/* Log Weight Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Log Weight</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Current Weight (kg)"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            value={newWeight}
                            onChangeText={setNewWeight}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleAddWeight}>
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
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5
    },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
    headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 5 },

    content: { padding: 20, paddingBottom: 100 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
        alignItems: 'center'
    },
    cardHeaderRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginLeft: 10 },
    chart: {
        borderRadius: 16,
        marginVertical: 8,
    },
    noDataText: {
        marginTop: 20,
        marginBottom: 20,
        color: '#999',
        fontStyle: 'italic'
    },
    noDataContainer: {
        height: 100,
        justifyContent: 'center'
    },

    // Modal Styles
    modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
    modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    input: {
        backgroundColor: '#f5f5f5',
        width: '100%',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        fontSize: 16,
        color: '#333'
    },
    modalButtons: { flexDirection: 'row', gap: 10, width: '100%' },
    cancelButton: { flex: 1, padding: 15, borderRadius: 10, backgroundColor: '#f5f5f5', alignItems: 'center' },
    saveButton: { flex: 1, padding: 15, borderRadius: 10, backgroundColor: '#134E5E', alignItems: 'center' },
    cancelButtonText: { color: '#666', fontWeight: 'bold' },
    saveButtonText: { color: '#fff', fontWeight: 'bold' }
});
