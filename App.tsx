import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import './gesture-handler';
import {AppNavigator} from './src/navigation/AppNavigator';
import {ActivityIndicator, View} from 'react-native';
import {AuthProvider, useAuth} from './src/context/authentication';
import {MeetingsProvider} from './src/context/meetings';
import {UserProvider} from './src/context/user';
// import {AuthProvider, useAuth} from './src/context/authentication/AuthContext';

export const LoadingScreen = () => (
  <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
    <ActivityIndicator size="large" />
  </View>
);

const AppContent = () => {
  const {isLoading} = useAuth();

  if (isLoading()) {
    return <LoadingScreen />;
  }

  return <AppNavigator />;
};

const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <UserProvider>
          <MeetingsProvider>
            <AppContent />
          </MeetingsProvider>
        </UserProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

export default App;
