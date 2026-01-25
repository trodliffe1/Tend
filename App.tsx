import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AppProvider, useApp } from './src/context/AppContext';
import HomeScreen from './src/screens/HomeScreen';
import PersonDetailScreen from './src/screens/PersonDetailScreen';
import AddEditPersonScreen from './src/screens/AddEditPersonScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import HangoutScreen from './src/screens/HangoutScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import BackupRestoreScreen from './src/screens/BackupRestoreScreen';
import LocalBackupScreen from './src/screens/LocalBackupScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import {
  requestNotificationPermissions,
  scheduleReminderNotifications,
  addNotificationResponseListener,
} from './src/utils/notifications';
import { colors } from './src/constants/theme';
import { SatelliteIcon, CalendarIcon, GearIcon } from './src/components/icons';

type RootStackParamList = {
  MainTabs: undefined;
  PersonDetail: { personId: string };
  AddEditPerson: { personId?: string };
  BackupRestore: undefined;
  LocalBackup: undefined;
  PrivacyPolicy: undefined;
};

type TabParamList = {
  Home: undefined;
  Hangout: undefined;
  Settings: undefined;
};

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const iconColor = focused ? colors.primaryLight : colors.textSecondary;
  const iconSize = 22;

  switch (name) {
    case 'Home':
      return <SatelliteIcon size={iconSize} color={iconColor} />;
    case 'Hangout':
      return <CalendarIcon size={iconSize} color={iconColor} />;
    case 'Settings':
      return <GearIcon size={iconSize} color={iconColor} />;
    default:
      return null;
  }
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarActiveBackgroundColor: colors.surfaceElevated,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 2,
          height: 90,
          paddingTop: 5,
          paddingBottom: 20,
        },
        tabBarItemStyle: {
          marginVertical: 5,
          borderRadius: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          fontFamily: 'monospace',
          textTransform: 'uppercase',
          letterSpacing: 1,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Orbyt',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Hangout"
        component={HangoutScreen}
        options={{
          title: 'Hangout',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          headerShown: true,
          headerTitle: '',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary,
          headerShadowVisible: false,
        }}
      />
      <AuthStack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          headerShown: true,
          headerTitle: '',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary,
          headerShadowVisible: false,
        }}
      />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  const { persons, settings, loading } = useApp();
  const navigationRef = useRef<any>(null);

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    if (!loading) {
      scheduleReminderNotifications(persons, settings);
    }
  }, [persons, settings, loading]);

  useEffect(() => {
    const subscription = addNotificationResponseListener((response) => {
      const personId = response.notification.request.content.data?.personId as string;
      if (personId && navigationRef.current) {
        navigationRef.current.navigate('PersonDetail', { personId });
      }
    });

    return () => subscription.remove();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Establishing connection...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerShadowVisible: false,
          headerTintColor: colors.primary,
          headerTitleStyle: {
            color: colors.text,
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false, title: 'Orbyt' }}
        />
        <Stack.Screen
          name="PersonDetail"
          component={PersonDetailScreen}
          options={{
            title: 'Details',
            headerBackTitle: 'Back To Orbyt',
          }}
        />
        <Stack.Screen
          name="AddEditPerson"
          component={AddEditPersonScreen}
          options={{
            title: 'Add Person',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="BackupRestore"
          component={BackupRestoreScreen}
          options={{
            title: 'Cloud Backup',
            headerBackTitle: 'Settings',
          }}
        />
        <Stack.Screen
          name="LocalBackup"
          component={LocalBackupScreen}
          options={{
            title: 'Local Backup',
            headerBackTitle: 'Settings',
          }}
        />
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreen}
          options={{
            title: 'Privacy Policy',
            headerBackTitle: 'Settings',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function RootNavigator() {
  const { user, initialized } = useAuth();

  if (!initialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Initializing secure connection...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );
  }

  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
});
