import React, { useState, useEffect } from 'react';
import { StatusBar, Alert, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch, useSelector } from 'react-redux';

import { store } from './src/store/store';
import { loadAuthFromStorage, clearCredentials } from './src/store/slices/authSlice';

import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import VerifyOTPScreen from './src/screens/VerifyOTPScreen';
import HomeScreen from './src/screens/HomeScreen';
import CategoriesScreen from './src/screens/OrderProduct/CategoriesScreen';
import ProductDetailScreen from './src/screens/OrderProduct/ProductDetailScreen';
import CheckoutScreen from './src/screens/payment/CheckoutScreen';
import OrderSuccessScreen from './src/screens/OrderProduct/OrderSuccessScreen';
import TrackOrderScreen from './src/screens/OrderProduct/TrackOrderScreen';
import OrdersScreen from './src/screens/OrderProduct/OrdersScreen';
import ProfileScreen from './src/screens/userProfile/ProfileScreen';
import EditProfileScreen from './src/screens/userProfile/EditProfileScreen';
import DeliveryAddressesScreen from './src/screens/userProfile/DeliveryAddressesScreen';
import PaymentMethodsScreen from './src/screens/userProfile/PaymentMethodsScreen';
import WalletScreen from './src/screens/userProfile/WalletScreen';
import HelpSupportScreen from './src/screens/userProfile/HelpSupportScreen';
import OrderDetailScreen from './src/screens/OrderProduct/OrderDetailScreen';


// ── Inner navigator (needs Redux) ─────────────────────────────────────────────
const RootNavigator = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const dispatch = useDispatch();

  const { user, isAppReady } = useSelector((state) => state.auth);

  const [currentScreen, setCurrentScreen] = useState('signup');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [lastOrderData, setLastOrderData] = useState(null);
  const userRole = 'user';

  // Load stored token on mount
  useEffect(() => {
    dispatch(loadAuthFromStorage());
  }, []);

  // Decide starting screen once storage is loaded
  useEffect(() => {
    if (isAppReady && !initialized) {
      setCurrentScreen(user ? 'home' : 'signup');
      setInitialized(true);
    }
  }, [isAppReady, user, initialized]);

  if (!isAppReady || !initialized) {
    return <SplashScreen />;
  }

  const handleSendOtpSuccess = (phone) => {
    setPhoneNumber(phone);
    setCurrentScreen('verify-otp');
  };

  const handleLogout = () => {
    dispatch(clearCredentials());
    setCurrentScreen('login');
  };

  return (
    <>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {currentScreen === 'login' && (
        <LoginScreen
          role={userRole}
          onBack={() => setCurrentScreen('signup')}
          onSignup={() => setCurrentScreen('signup')}
          onContinue={handleSendOtpSuccess}
          onLoginSuccess={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'signup' && (
        <SignupScreen
          role={userRole}
          onBack={() => setCurrentScreen('login')}
          onLogin={() => setCurrentScreen('login')}
          onContinue={handleSendOtpSuccess}
        />
      )}

      {currentScreen === 'verify-otp' && (
        <VerifyOTPScreen
          phoneNumber={phoneNumber}
          onBack={() => setCurrentScreen('login')}
          onSuccess={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'home' && (
        <HomeScreen
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
          onNavigateCategories={() => setCurrentScreen('categories')}
          onNavigateProduct={(id) => {
            setSelectedProductId(id);
            setCurrentScreen('product-detail');
          }}
          onNavigateCheckout={() => setCurrentScreen('checkout')}
          onNavigateOrders={() => setCurrentScreen('orders')}
          onNavigateProfile={() => setCurrentScreen('profile')}
          onNavigateAddresses={() => setCurrentScreen('delivery-addresses')}
        />
      )}

      {currentScreen === 'categories' && (
        <CategoriesScreen
          onNavigateHome={() => setCurrentScreen('home')}
          onNavigateProduct={(id) => {
            setSelectedCategoryId(id);
            setCurrentScreen('home');
          }}
          onNavigateCheckout={() => setCurrentScreen('checkout')}
          onNavigateOrders={() => setCurrentScreen('orders')}
          onNavigateProfile={() => setCurrentScreen('profile')}
        />
      )}

      {currentScreen === 'product-detail' && (
        <ProductDetailScreen
          onBack={() => setCurrentScreen('home')}
          onAddToCart={() => {
            Alert.alert('Added to Cart', 'Your item has been added to the cart.');
            setCurrentScreen('home');
          }}
          productId={selectedProductId}
          onNavigateCheckout={() => setCurrentScreen('checkout')}
        />
      )}

      {currentScreen === 'checkout' && (
        <CheckoutScreen
          onBack={() => setCurrentScreen('home')}
          onNavigateHome={() => setCurrentScreen('home')}
          onNavigateCategories={() => setCurrentScreen('categories')}
          onNavigateOrders={() => setCurrentScreen('orders')}
          onNavigateProfile={() => setCurrentScreen('profile')}
          onNavigateAddresses={() => setCurrentScreen('delivery-addresses')}
          onPlaceOrder={(orderData) => {
            setLastOrderData(orderData);
            setCurrentScreen('order-success');
          }}
        />
      )}

      {currentScreen === 'order-success' && (
        <OrderSuccessScreen
          orderData={lastOrderData}
          onTrackOrder={(id) => {
            setSelectedOrderId(id);
            setCurrentScreen('track-order');
          }}
          onContinueShopping={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'orders' && (
        <OrdersScreen
          onNavigateHome={() => setCurrentScreen('home')}
          onNavigateCategories={() => setCurrentScreen('categories')}
          onNavigateCheckout={() => setCurrentScreen('checkout')}
          onNavigateTrackOrder={(id) => {
            setSelectedOrderId(id);
            setCurrentScreen('track-order');
          }}
          onNavigateDetail={(id) => {
            setSelectedOrderId(id);
            setCurrentScreen('order-detail');
          }}
          onNavigateProfile={() => setCurrentScreen('profile')}
        />
      )}

      {currentScreen === 'profile' && (
        <ProfileScreen
          onNavigateHome={() => setCurrentScreen('home')}
          onNavigateCategories={() => setCurrentScreen('categories')}
          onNavigateCheckout={() => setCurrentScreen('checkout')}
          onNavigateOrders={() => setCurrentScreen('orders')}
          onLogout={handleLogout}
          onEditProfile={() => setCurrentScreen('edit-profile')}
          onNavigateAddresses={() => setCurrentScreen('delivery-addresses')}
          onNavigatePayment={() => setCurrentScreen('payment-methods')}
          onNavigateWallet={() => setCurrentScreen('wallet')}
          onNavigateHelp={() => setCurrentScreen('help-support')}
        />
      )}

      {currentScreen === 'edit-profile' && (
        <EditProfileScreen
          onBack={() => setCurrentScreen('profile')}
          onSave={() => setCurrentScreen('profile')}
        />
      )}

      {currentScreen === 'delivery-addresses' && (
        <DeliveryAddressesScreen onBack={() => setCurrentScreen('profile')} />
      )}

      {currentScreen === 'payment-methods' && (
        <PaymentMethodsScreen onBack={() => setCurrentScreen('profile')} />
      )}

      {currentScreen === 'wallet' && (
        <WalletScreen onBack={() => setCurrentScreen('profile')} />
      )}

      {currentScreen === 'help-support' && (
        <HelpSupportScreen onBack={() => setCurrentScreen('profile')} />
      )}

      {currentScreen === 'track-order' && (
        <TrackOrderScreen
          orderId={selectedOrderId}
          onBack={() => setCurrentScreen('orders')}
          onNavigateHome={() => setCurrentScreen('home')}
          onNavigateCategories={() => setCurrentScreen('categories')}
          onNavigateCheckout={() => setCurrentScreen('checkout')}
          onNavigateOrders={() => setCurrentScreen('orders')}
          onNavigateProfile={() => setCurrentScreen('profile')}
        />
      )}

      {currentScreen === 'order-detail' && (
        <OrderDetailScreen
          orderId={selectedOrderId}
          onBack={() => setCurrentScreen('orders')}
        />
      )}
    </>
  );
};

// ── Root: wrap in Redux Provider ──────────────────────────────────────────────
const App = () => {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <RootNavigator />
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;