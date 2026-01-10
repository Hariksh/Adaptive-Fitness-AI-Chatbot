import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, ProgressChart } from "react-native-chart-kit";
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const screenWidth = Dimensions.get("window").width;

export default function StatsScreen() {
    const [weightData, setWeightData] = useState([70, 70, 70]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setWeightData([72, 71.5, 71, 70.8, 70.2, 69.8]);
            setLoading(false);
        }, 1000);
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
    };

    const progressData = {
        labels: ["Walk", "Run", "Gym"], // optional
        data: [0.4, 0.6, 0.8]
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
                <Text style={styles.headerSubtitle}>Keep pushing forward!</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Weight Chart */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="analytics" size={24} color="#134E5E" />
                        <Text style={styles.cardTitle}>Weight Trend (kg)</Text>
                    </View>
                    <LineChart
                        data={{
                            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                            datasets: [{ data: weightData }]
                        }}
                        width={screenWidth - 60}
                        height={220}
                        yAxisSuffix="kg"
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chart}
                    />
                </View>

                {/* Goals Progress */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="pie-chart" size={24} color="#134E5E" />
                        <Text style={styles.cardTitle}>Goals Completion</Text>
                    </View>
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
                </View>

            </ScrollView>
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
    cardHeader: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        alignItems: 'center',
        marginBottom: 15
    },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginLeft: 10 },
    chart: {
        borderRadius: 16,
        marginVertical: 8,
    }
});
