import React, { useContext } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { AuthContext } from '../context/authContext';

import LoginScreen from '../screens/loginScreen';
import RegisterScreen from '../screens/registerScreen';
import HomeScreen from '../screens/homeScreen';
import AsistanScreen from '../screens/asistanScreen'; 
import KayitlarScreen from '../screens/kayitlarScreen';

import SohbetGecmisScreen from '../screens/aiSohbetGecmisScreen';
import AnalizGecmisScreen from '../screens/analizGecmisScreen';
import TakvimScreen from '../screens/takvimScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const KayitlarStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="KayitlarAna" 
      component={KayitlarScreen} 
      options={{ headerShown: false }} 
    />
    <Stack.Screen 
      name="SohbetGecmis" 
      component={SohbetGecmisScreen} 
      options={{ title: 'Asistan Sohbetleri', headerTintColor: '#2E7D32' }} 
    />
    <Stack.Screen 
      name="AnalizGecmis" 
      component={AnalizGecmisScreen} 
      options={{ title: 'Fotoğraf Analizleri', headerTintColor: '#2E7D32' }} 
    />
  </Stack.Navigator>
);

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: '#2E7D32',
      tabBarIcon: ({ focused, color, size }) => {
        let iconName = 'leaf'; 
        if (route.name === 'Asistan') iconName = 'chatbubble-ellipses';
        if (route.name === 'Listeler') iconName = 'list';
        if(route.name === "Takvim") iconName = "calendar";
        return <Ionicons name={focused ? iconName : `${iconName}-outline`} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="AiAnaliz" component={HomeScreen} />
    <Tab.Screen name="Asistan" component={AsistanScreen} />
    <Tab.Screen name="Listeler" component={KayitlarStack} />
    <Tab.Screen name="Takvim" component={TakvimScreen} />
  </Tab.Navigator>
);

const AppNav = () => {
  const context = useContext(AuthContext);

  if (!context) return null;

  if (context.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {context.userToken ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNav;