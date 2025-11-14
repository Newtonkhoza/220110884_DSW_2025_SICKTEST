import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Import screens
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import HomeScreen from './screens/HomeScreen';
import AddEditFlashcardScreen from './screens/AddEditFlashcardScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return null; // You can add a loading screen here
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {user ? (
            // Authenticated screens
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="AddEditFlashcard" component={AddEditFlashcardScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
            </>
          ) : (
            // Unauthenticated screens
            <>
              <Stack.Screen name="SignIn" component={SignInScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}