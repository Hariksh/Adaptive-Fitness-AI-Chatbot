import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }) {
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Animation
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Form State
    const [age, setAge] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [gender, setGender] = useState('Male');
    const [fitnessGoal, setFitnessGoal] = useState('General Health');
    const [fitnessLevel, setFitnessLevel] = useState('Beginner');
    const [name, setName] = useState('');
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        fetchProfile();
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = await SecureStore.getItemAsync('userToken');
            if (!token) {
                navigation.replace('Login');
                return;
            }

            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await axios.get(`${API_URL}/api/auth/profile`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const user = response.data;
            setName(user.name);
            setUserEmail(user.email);
            if (user.age) setAge(user.age.toString());
            if (user.height) setHeight(user.height.toString());
            if (user.weight) setWeight(user.weight.toString());
            if (user.gender) setGender(user.gender);
            if (user.fitnessGoal) setFitnessGoal(user.fitnessGoal);
            if (user.fitnessLevel) setFitnessLevel(user.fitnessLevel);

        } catch (error) {
            console.error("Fetch Profile Error:", error);
            Alert.alert("Error", "Could not load profile");
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync('userToken');
            const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

            await axios.put(`${API_URL}/api/auth/profile`, {
                age: Number(age),
                height: Number(height),
                weight: Number(weight),
                gender,
                fitnessGoal,
                fitnessLevel
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Alert.alert("Success", "Profile Updated!", [
                { text: "OK", onPress: () => navigation.navigate('Welcome') }
            ]);
        } catch (error) {
            console.error("Update Error:", error);
            Alert.alert("Error", "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    await SecureStore.deleteItemAsync('userToken');
                    await SecureStore.deleteItemAsync('userData');
                    navigation.replace('Login');
                }
            }
        ]);
    };

    const SelectionButton = ({ label, value, selectedValue, onSelect }) => (
        <TouchableOpacity
            style={[styles.selectButton, selectedValue === value && styles.selectButtonActive]}
            onPress={() => onSelect(value)}
        >
            <Text style={[styles.selectText, selectedValue === value && styles.selectTextActive]}>{label}</Text>
        </TouchableOpacity>
    );

    if (initialLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#71B280" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#134E5E', '#71B280']}
                style={styles.background}
            />

            <View style={styles.headerBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Animated.View style={{ opacity: fadeAnim }}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>{name ? name[0].toUpperCase() : 'U'}</Text>
                        </View>
                        <Text style={styles.userName}>{name}</Text>
                        <Text style={styles.userEmail}>{userEmail}</Text>
                    </View>

                    <View style={styles.card}>

                        <View style={styles.sectionHeader}>
                            <Ionicons name="body-outline" size={20} color="#134E5E" />
                            <Text style={styles.sectionTitle}>Physical Stats</Text>
                        </View>

                        <View style={styles.row}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Age</Text>
                                <TextInput
                                    style={styles.input}
                                    value={age}
                                    onChangeText={setAge}
                                    keyboardType="numeric"
                                    placeholder="25"
                                    placeholderTextColor="#999"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Height (cm)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={height}
                                    onChangeText={setHeight}
                                    keyboardType="numeric"
                                    placeholder="175"
                                    placeholderTextColor="#999"
                                />
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Weight (kg)</Text>
                                <TextInput
                                    style={styles.input}
                                    value={weight}
                                    onChangeText={setWeight}
                                    keyboardType="numeric"
                                    placeholder="70"
                                    placeholderTextColor="#999"
                                />
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.sectionHeader}>
                            <Ionicons name="male-female-outline" size={20} color="#134E5E" />
                            <Text style={styles.sectionTitle}>Gender</Text>
                        </View>
                        <View style={styles.selectionRow}>
                            {['Male', 'Female', 'Other'].map(opt => (
                                <SelectionButton key={opt} label={opt} value={opt} selectedValue={gender} onSelect={setGender} />
                            ))}
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.sectionHeader}>
                            <Ionicons name="fitness-outline" size={20} color="#134E5E" />
                            <Text style={styles.sectionTitle}>Fitness Level</Text>
                        </View>
                        <View style={styles.selectionRow}>
                            {['Beginner', 'Intermediate', 'Advanced'].map(opt => (
                                <SelectionButton key={opt} label={opt} value={opt} selectedValue={fitnessLevel} onSelect={setFitnessLevel} />
                            ))}
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.sectionHeader}>
                            <Ionicons name="trophy-outline" size={20} color="#134E5E" />
                            <Text style={styles.sectionTitle}>Main Goal</Text>
                        </View>
                        <View style={styles.selectionGrid}>
                            {['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility', 'General Health'].map(opt => (
                                <SelectionButton key={opt} label={opt} value={opt} selectedValue={fitnessGoal} onSelect={setFitnessGoal} />
                            ))}
                        </View>

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Text style={styles.logoutText}>Log Out</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
    headerBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 10
    },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
    content: { padding: 20, paddingBottom: 50 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#134E5E' },

    avatarContainer: { alignItems: 'center', marginBottom: 25 },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.5)',
        marginBottom: 10
    },
    avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
    userName: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
    userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },

    card: { backgroundColor: 'white', borderRadius: 25, padding: 25, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15, elevation: 8 },

    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, marginTop: 5 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginLeft: 10 },

    divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 20 },

    row: { flexDirection: 'row', justifyContent: 'space-between' },
    inputGroup: { flex: 1, marginRight: 10 },
    label: { fontSize: 12, fontWeight: '600', color: '#888', marginBottom: 5, textTransform: 'uppercase' },
    input: { backgroundColor: '#f5f7fa', borderRadius: 12, padding: 12, fontSize: 16, color: '#333', borderWidth: 1, borderColor: '#e1e8ed' },

    selectionRow: { flexDirection: 'row', flexWrap: 'wrap' },
    selectionGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    selectButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', marginRight: 10, marginBottom: 10, backgroundColor: '#fff' },
    selectButtonActive: { backgroundColor: '#134E5E', borderColor: '#134E5E' },
    selectText: { color: '#666' },
    selectTextActive: { color: 'white', fontWeight: 'bold' },

    saveButton: { backgroundColor: '#71B280', padding: 18, borderRadius: 18, alignItems: 'center', marginTop: 10, shadowColor: '#71B280', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    logoutButton: { marginTop: 20, alignItems: 'center', padding: 10 },
    logoutText: { color: '#e74c3c', fontSize: 16, fontWeight: '600' }
});
