import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, Animated, Easing } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
    const [name, setName] = useState('User');
    const [streak, setStreak] = useState(3);
    const [workoutCount, setWorkoutCount] = useState(0);
    const [latestWorkout, setLatestWorkout] = useState(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useFocusEffect(
        useCallback(() => {
            fetchData();
            fadeAnim.setValue(0);
            slideAnim.setValue(50);

            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.exp)
                },),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.back(1.5))
                })
            ]).start();
        }, [])
    );

    const fetchData = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (token) {
                const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

                const profileRes = await axios.get(`${API_URL}/api/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setName(profileRes.data.name || 'User');

                const workoutRes = await axios.get(`${API_URL}/api/workouts`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (Array.isArray(workoutRes.data)) {
                    setWorkoutCount(workoutRes.data.length);
                    if (workoutRes.data.length > 0) {
                        setLatestWorkout(workoutRes.data[0]);
                    }
                }
            }
        } catch (error) {
            console.log("Error loading dashboard data", error);
        }
    };

    const QuickActionCard = ({ title, icon, color, onPress, subtitle }) => (
        <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
            <LinearGradient
                colors={color}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
            >
                <View style={[styles.cardIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <Ionicons name={icon} size={28} color="#fff" />
                </View>
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <Text style={styles.cardTitle}>{title}</Text>
                    <Text style={styles.cardSubtitle}>{subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.6)" />
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#134E5E', '#71B280']} style={styles.bgGradient} />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Hello, {name} 👋</Text>
                        <Text style={styles.subGreeting}>Let's crush your goals today!</Text>
                    </View>
                    <View style={styles.streakBadge}>
                        <Ionicons name="flame" size={20} color="#FF9F43" />
                        <Text style={styles.streakText}>{streak}</Text>
                    </View>
                </View>

                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                    <View style={styles.dailySummary}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Steps</Text>
                            <Text style={styles.summaryValue}>2,431</Text>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <TouchableOpacity onPress={() => navigation.navigate('CalorieTracker')}>
                                <Text style={styles.summaryLabel}>Calories</Text>
                                <Text style={styles.summaryValue}>840</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.summaryDivider} />
                        <View style={styles.summaryItem}>
                            <TouchableOpacity onPress={() => navigation.navigate('ActivityHistory')}>
                                <Text style={styles.summaryLabel}>Workouts</Text>
                                <Text style={styles.summaryValue}>{workoutCount}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {latestWorkout && (
                        <View style={{ marginBottom: 30 }}>
                            <Text style={styles.sectionTitle}>Latest Activity</Text>
                            <View style={styles.achievementCard}>
                                <LinearGradient colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.1)']} style={styles.achievementContent}>
                                    <View style={styles.trophyIcon}>
                                        <Ionicons name="fitness" size={24} color="#fff" />
                                    </View>
                                    <View style={styles.achievementText}>
                                        <Text style={styles.achievementTitle}>{latestWorkout.activityType}</Text>
                                        <Text style={styles.achievementDesc}>{latestWorkout.duration} mins • {new Date(latestWorkout.date).toLocaleDateString()}</Text>
                                    </View>
                                    <View>
                                        <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{latestWorkout.caloriesBurned} kcal</Text>
                                    </View>
                                </LinearGradient>
                            </View>
                        </View>
                    )}

                    {/* Quick Actions */}
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.grid}>
                        <QuickActionCard
                            title="AI Chat"
                            subtitle="Ask for advice"
                            icon="chatbubbles-outline"
                            color={['#6A11CB', '#2575FC']}
                            onPress={() => navigation.navigate('Chat')}
                        />
                        <QuickActionCard
                            title="Log Workout"
                            subtitle="Track activity"
                            icon="barbell-outline"
                            color={['#FF512F', '#DD2476']}
                            onPress={() => navigation.navigate('WorkoutLog')}
                        />
                        <QuickActionCard
                            title="Meal Plan"
                            subtitle="Get nutrition tips"
                            icon="nutrition-outline"
                            color={['#11998e', '#38ef7d']}
                            onPress={() => navigation.navigate('MealPlan')}
                        />
                        <QuickActionCard
                            title="Calorie Tracker"
                            subtitle="Log meals & stats"
                            icon="flame-outline"
                            color={['#FF9966', '#FF5E62']}
                            onPress={() => navigation.navigate('CalorieTracker')}
                        />
                    </View>

                    <Text style={styles.sectionTitle}>Recent Achievements</Text>
                    <View style={styles.achievementCard}>
                        <LinearGradient colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']} style={styles.achievementContent}>
                            <View style={styles.trophyIcon}>
                                <Ionicons name="trophy" size={24} color="#FFD700" />
                            </View>
                            <View style={styles.achievementText}>
                                <Text style={styles.achievementTitle}>Consistency King</Text>
                                <Text style={styles.achievementDesc}>Logged in 3 days in a row!</Text>
                            </View>
                        </LinearGradient>
                    </View>

                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    bgGradient: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    scrollContent: { padding: 20, paddingTop: 60 },

    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 30 },
    greeting: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
    subGreeting: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 5 },

    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20
    },
    streakText: { color: '#fff', fontWeight: 'bold', marginLeft: 4, fontSize: 16 },

    dailySummary: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 20,
        padding: 20,
        justifyContent: 'space-between',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5
    },
    summaryItem: { alignItems: 'center', flex: 1 },
    summaryLabel: { fontSize: 12, color: '#666', textTransform: 'uppercase', fontWeight: '600' },
    summaryValue: { fontSize: 20, fontWeight: 'bold', color: '#134E5E', marginTop: 4 },
    summaryDivider: { width: 1, backgroundColor: '#eee' },

    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 15 },
    grid: { gap: 15, marginBottom: 30 },

    cardContainer: {
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6
    },
    cardGradient: {
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardIcon: {
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    cardSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
    cardArrow: { marginLeft: 'auto' },

    achievementCard: {
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    achievementContent: { flexDirection: 'row', padding: 20, alignItems: 'center' },
    trophyIcon: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: 'rgba(255,215,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    achievementText: { flex: 1 },
    achievementTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
    achievementDesc: { fontSize: 14, color: 'rgba(255,255,255,0.7)' }
});
