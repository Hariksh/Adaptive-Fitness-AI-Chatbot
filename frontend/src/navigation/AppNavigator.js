import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { View, Platform } from 'react-native';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WorkoutLogScreen from '../screens/WorkoutLogScreen';
import ActivityHistoryScreen from '../screens/ActivityHistoryScreen';
import StatsScreen from '../screens/StatsScreen';
import MealPlanScreen from '../screens/MealPlanScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    position: 'absolute',
                    borderTopWidth: 0,
                    elevation: 0,
                    height: Platform.OS === 'ios' ? 85 : 60,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
                    paddingTop: 10,
                    shadowColor: '#000',
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: -5 }
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'Stats') iconName = focused ? 'podium' : 'podium-outline';
                    else if (route.name === 'Chat') iconName = focused ? 'chatbubble' : 'chatbubble-outline';
                    else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

                    return (
                        <View style={{ alignItems: 'center', justifyContent: 'center', top: Platform.OS === 'ios' ? 10 : 0 }}>
                            <Ionicons name={iconName} size={size} color={color} />
                        </View>
                    );
                },
                tabBarActiveTintColor: '#134E5E',
                tabBarInactiveTintColor: 'gray',
                tabBarShowLabel: false,
            })}
        >
            <Tab.Screen name="Home" component={DashboardScreen} />
            <Tab.Screen name="Stats" component={StatsScreen} />
            <Tab.Screen name="Chat" component={ChatScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Signup" component={SignupScreen} />
                <Stack.Screen name="Welcome" component={MainTabs} />
                <Stack.Screen
                    name="WorkoutLog"
                    component={WorkoutLogScreen}
                    options={{ presentation: 'modal' }}
                />
                <Stack.Screen
                    name="ActivityHistory"
                    component={ActivityHistoryScreen}
                    options={{ title: 'History' }}
                />
                <Stack.Screen
                    name="MealPlan"
                    component={MealPlanScreen}
                    options={{ title: 'Meal Plan' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
