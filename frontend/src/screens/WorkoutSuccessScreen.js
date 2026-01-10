import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CommonActions } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function WorkoutSuccessScreen({ navigation }) {

    const handleHome = () => {
        // Reset navigation stack to Home
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Welcome' }], // 'Welcome' handles the Tabs
            })
        );
    };

    const handleLogAnother = () => {
        // Go back (which is effectively logging another since we replaced the route, 
        // but actually we want to go to WorkoutLog. Convert to replace for Log or just navigate)
        // Better: Navigate to WorkoutLog.
        navigation.replace('WorkoutLog');
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#134E5E', '#71B280']} style={styles.bgGradient} />

            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Ionicons name="checkmark-sharp" size={80} color="#134E5E" />
                </View>

                <Text style={styles.title}>Great Job!</Text>
                <Text style={styles.subtitle}>Your workout has been saved successfully.</Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.homeButton} onPress={handleHome}>
                        <Text style={styles.homeButtonText}>Back to Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.anotherButton} onPress={handleLogAnother}>
                        <Text style={styles.anotherButtonText}>Log Another</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    bgGradient: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },

    content: {
        width: width * 0.85,
        backgroundColor: '#fff',
        borderRadius: 30,
        padding: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20
    },
    title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 30 },

    buttonContainer: { width: '100%', gap: 15 },
    homeButton: {
        backgroundColor: '#134E5E',
        paddingVertical: 15,
        borderRadius: 15,
        alignItems: 'center',
        width: '100%'
    },
    homeButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    anotherButton: {
        backgroundColor: '#f5f7fa',
        paddingVertical: 15,
        borderRadius: 15,
        alignItems: 'center',
        width: '100%'
    },
    anotherButtonText: { color: '#666', fontSize: 16, fontWeight: 'bold' }
});
