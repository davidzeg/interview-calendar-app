import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {RootStackParamList, MainTabParamList} from './types';

import AuthScreen from '../screens/AuthScreen';
import {Text} from 'react-native';
import RegisterScreen from '../screens/RegisterScreen';
// import {useAuth} from '../context/authentication/AuthContext';
import ProfileScreen from '../screens/ProfileScreen';
import CalendarScreen from '../screens/CalendarScreen';
import {useAuth} from '../context/authentication';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {getSizeByY} from '../utils/styles/sizes';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        height: getSizeByY(60),
        paddingVertical: getSizeByY(8),
      },
      tabBarActiveTintColor: '#007AFF',
      tabBarInactiveTintColor: '#8E8E93',
      tabBarShowLabel: false,
    }}>
    <Tab.Screen
      name="Calendar"
      component={CalendarScreen}
      options={{
        tabBarIcon: ({focused, color, size}) => (
          <Icon
            name={focused ? 'calendar' : 'calendar-outline'}
            size={24}
            color={color}
          />
        ),
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({focused, color, size}) => (
          <Icon
            name={focused ? 'account' : 'account-outline'}
            size={24}
            color={color}
          />
        ),
      }}
    />
  </Tab.Navigator>
);

export const AppNavigator = () => {
  const {user} = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!user ? (
          <>
            <Stack.Screen
              name="Auth"
              component={AuthScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{headerShown: false}}
            />
          </>
        ) : (
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{headerShown: false}}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
