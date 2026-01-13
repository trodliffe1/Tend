import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View, StyleSheet, ActivityIndicator } from 'react-native';

import { AppProvider, useApp } from './src/context/AppContext';
import HomeScreen from './src/screens/HomeScreen';
import PersonDetailScreen from './src/screens/PersonDetailScreen';
import AddEditPersonScreen from './src/screens/AddEditPersonScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import DateNightScreen from './src/screens/DateNightScreen';
import {
  requestNotificationPermissions,
  scheduleReminderNotifications,
  addNotificationResponseListener,
} from './src/utils/notifications';
import { colors } from './src/constants/theme';

type RootStackParamList = {
  MainTabs: undefined;
  PersonDetail: { personId: string };
  AddEditPerson: { personId?: string };
};

type TabParamList = {
  Home: undefined;
  DateNight: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabIcon({ name }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '🌱',
    DateNight: '💕',
    Settings: '⚙️',
  };
  return (
    <Text style={{ fontSize: 22 }}>
      {icons[name]}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarActiveBackgroundColor: '#E8F5E9',
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 90,
          paddingTop: 5,
          paddingBottom: 20,
        },
        tabBarItemStyle: {
          marginVertical: 5,
          borderRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
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
          title: 'Garden',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="DateNight"
        component={DateNightScreen}
        options={{
          title: 'Date Night',
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
        <Text style={styles.loadingText}>Growing your garden...</Text>
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
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PersonDetail"
          component={PersonDetailScreen}
          options={{
            title: 'Details',
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </AppProvider>
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
