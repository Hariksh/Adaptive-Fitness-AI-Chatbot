import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { personalities } from '../utils/mockData';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
    const [selectedPersonality, setSelectedPersonality] = useState(personalities[0]);

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleStart = () => {
        navigation.navigate('Chat', { personality: selectedPersonality });
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['#134E5E', '#71B280']} // "Vitality" Theme (Teal -> Green)
                style={styles.background}
            />
            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.content}>
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <Text style={styles.title}>Adaptive Fitness</Text>
                        <Text style={styles.subtitle}>Your AI-powered wellness guide.</Text>

                        <View style={styles.glassContainer}>
                            <Text style={styles.sectionTitle}>I can help with:</Text>
                            <View style={styles.row}>
                                <Text style={styles.badge}>Workouts</Text>
                                <Text style={styles.badge}>Wellness</Text>
                                <Text style={styles.badge}>Motivation</Text>
                            </View>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionHeader}>Choose Your Coach Style</Text>
                            {personalities.map((p) => (
                                <TouchableOpacity
                                    key={p.id}
                                    style={[
                                        styles.card,
                                        selectedPersonality.id === p.id && styles.selectedCard,
                                    ]}
                                    onPress={() => setSelectedPersonality(p)}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.cardHeader}>
                                        <View style={[styles.radioCircle, selectedPersonality.id === p.id && styles.radioSelected]} />
                                        <Text style={[styles.cardTitle, selectedPersonality.id === p.id && styles.selectedText]}>
                                            {p.name}
                                        </Text>
                                    </View>
                                    <Text style={[styles.cardDesc, selectedPersonality.id === p.id && styles.selectedText]}>
                                        {p.description}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
                            <LinearGradient
                                colors={['#11998e', '#38ef7d']} // Bright Green Gradient
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                <Text style={styles.startText}>Start Chat</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <Text style={styles.disclaimer}>* I do not provide medical advice.</Text>
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        padding: 24,
        paddingBottom: 40,
    },
    title: {
        fontSize: 36,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginTop: 20,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    subtitle: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        marginBottom: 30,
    },
    glassContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    sectionTitle: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 12,
        fontWeight: '700',
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    badge: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
        color: '#fff',
        marginRight: 8,
        marginBottom: 8,
        overflow: 'hidden',
        fontSize: 14,
        fontWeight: '600',
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 15,
    },
    section: {
        marginBottom: 20,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    selectedCard: {
        backgroundColor: '#11998e', // Fitness Teal
        borderWidth: 0,
        transform: [{ scale: 1.02 }],
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#11998e',
        marginRight: 10,
        backgroundColor: '#fff',
    },
    radioSelected: {
        backgroundColor: '#fff',
        borderColor: '#fff',
        borderWidth: 6,
    },
    cardDesc: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
    },
    selectedText: {
        color: '#fff',
    },
    startButton: {
        marginTop: 10,
        shadowColor: '#FF4500',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    gradientButton: {
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
    },
    startText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    disclaimer: {
        marginTop: 20,
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 12,
    },
});
