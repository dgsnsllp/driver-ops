import React, { useContext } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthContext } from '../context/AuthContext';
import { Home, Users, Truck, Camera as CameraIcon } from 'lucide-react-native';

// Ekranlar
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import DashboardScreen from '../screens/DashboardScreen';
import IndividualDashboardScreen from '../screens/IndividualDashboardScreen';
import VehiclesScreen from '../screens/VehiclesScreen';
import DriversScreen from '../screens/DriversScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import ReportScreen from '../screens/ReportScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Alt Sekmeler Menüsü (Sadece şirket kullanıcıları için)
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#121826',
          borderTopColor: '#1f2937',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarActiveTintColor: '#00d4ff',
        tabBarInactiveTintColor: '#6b7280',
        tabBarShowLabel: true,
      }}
    >
      <Tab.Screen 
        name="DashboardTab" 
        component={DashboardScreen} 
        options={{
          tabBarLabel: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="DriversTab" 
        component={DriversScreen} 
        options={{
          tabBarLabel: 'Sürücüler',
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="ScannerTab" 
        component={QRScannerScreen} 
        options={{
          tabBarLabel: '',
          tabBarIcon: ({ color }) => (
            <View style={{
              position: 'absolute',
              bottom: 0,
              height: 58,
              width: 58,
              borderRadius: 29,
              backgroundColor: '#00d4ff',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#00d4ff',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 5,
            }}>
              <CameraIcon color="#000" size={30} />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="VehiclesTab" 
        component={VehiclesScreen} 
        options={{
          tabBarLabel: 'Araçlar',
          tabBarIcon: ({ color, size }) => <Truck color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { userToken, isLoading, userType } = useContext(AuthContext);

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a0e17' } }}>
        {userToken == null ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="QRScanner" component={QRScannerScreen} />
            <Stack.Screen name="Report" component={ReportScreen} />
          </>
        ) : userType === 'individual' ? (
          <>
            <Stack.Screen name="IndividualDashboard" component={IndividualDashboardScreen} />
            <Stack.Screen name="QRScanner" component={QRScannerScreen} />
            <Stack.Screen name="Report" component={ReportScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Report" component={ReportScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
