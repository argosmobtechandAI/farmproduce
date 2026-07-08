import React, { useState, useEffect } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  Alert
} from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import VerifyOTPScreen from './src/screens/VerifyOTPScreen';
import DeliveryDashboardScreen from './src/screens/Delivery/DeliveryDashboardScreen';
import DeliveryTripScreen from './src/screens/Delivery/DeliveryTripScreen';
import DeliveryTripsScreen from './src/screens/Delivery/DeliveryTripsScreen';
import EarningsScreen from './src/screens/Delivery/EarningsScreen';
import DeliveryProfileScreen from './src/screens/Delivery/DeliveryProfileScreen';

const RootNavigator = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const { user, isAppReady, logout } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('login'); // Default screen for delivery app
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userRole] = useState('delivery'); // Hardcoded role for this app
  const [initialized, setInitialized] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Update starting screen based on auth state when app is ready
  useEffect(() => {
    if (isAppReady && !initialized) {
      if (user) {
        setCurrentScreen('delivery-dashboard');
      }
      setInitialized(true);
    }
  }, [isAppReady, user, initialized]);

  if (!isAppReady || !initialized) {
    return <SplashScreen />;
  }

  const handleSendOtpSuccess = (phone: string, role: string) => {
    setPhoneNumber(phone);
    setCurrentScreen('verify-otp');
  };

  const handleLogout = async () => {
    await logout();
    setSelectedTrip(null);
    setCurrentScreen('login');
  };

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {currentScreen === 'login' ? (
        <LoginScreen
          role={userRole}
          onBack={() => setCurrentScreen('signup')}
          onSignup={() => setCurrentScreen('signup')}
          onContinue={handleSendOtpSuccess}
          onLoginSuccess={() => setCurrentScreen('delivery-dashboard')}
        />
      ) : currentScreen === 'signup' ? (
        <SignupScreen
          role={userRole}
          onBack={() => setCurrentScreen('login')}
          onLogin={() => setCurrentScreen('login')}
          onContinue={handleSendOtpSuccess}
        />
      ) : currentScreen === 'verify-otp' ? (
        <VerifyOTPScreen
          phoneNumber={phoneNumber}
          onBack={() => setCurrentScreen('login')}
          onSuccess={() => {
            setCurrentScreen('delivery-dashboard');
          }}
        />
      ) : currentScreen === 'delivery-dashboard' ? (
        <DeliveryDashboardScreen
          onNavigateProfile={() => setCurrentScreen('profile')}
          onLogout={handleLogout}
          onStartTrip={(trip: any) => {
            setSelectedTrip(trip);
            setCurrentScreen('delivery-trip');
          }}
          onNavigateTrips={() => setCurrentScreen('delivery-trips')}
          onNavigateEarnings={() => setCurrentScreen('earnings')}
        />
      ) : currentScreen === 'delivery-trip' ? (
        <DeliveryTripScreen
          trip={selectedTrip}
          onBack={() => {
            setSelectedTrip(null);
            setCurrentScreen('delivery-dashboard');
          }}
          onNavigateProfile={() => setCurrentScreen('profile')}
          onNavigateTrips={() => setCurrentScreen('delivery-trips')}
          onNavigateEarnings={() => setCurrentScreen('earnings')}
          onConfirmOtp={() => {
            setSelectedTrip(null);
            setCurrentScreen('delivery-dashboard');
          }}
        />
      ) : currentScreen === 'earnings' ? (
        <EarningsScreen
          onBack={() => setCurrentScreen('delivery-dashboard')}
          onNavigateHome={() => setCurrentScreen('delivery-dashboard')}
          onNavigateTrips={() => setCurrentScreen('delivery-trips')}
          onNavigateProfile={() => setCurrentScreen('profile')}
        />
      ) : currentScreen === 'delivery-trips' ? (
        <DeliveryTripsScreen
          onBack={() => setCurrentScreen('delivery-dashboard')}
          onNavigateHome={() => setCurrentScreen('delivery-dashboard')}
          onNavigateProfile={() => setCurrentScreen('profile')}
          onNavigateEarnings={() => setCurrentScreen('earnings')}
          onStartTrip={(trip: any) => {
            setSelectedTrip(trip);
            setCurrentScreen('delivery-trip');
          }}
        />
      ) : (
        <DeliveryProfileScreen
          onBack={() => setCurrentScreen('delivery-dashboard')}
          onLogout={handleLogout}
          onNavigateHome={() => setCurrentScreen('delivery-dashboard')}
          onNavigateTrips={() => setCurrentScreen('delivery-trips')}
          onNavigateEarnings={() => setCurrentScreen('earnings')}
        />
      )}
    </>
  );
};

function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
