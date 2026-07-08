import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    TextInput, StatusBar, Animated, Image, Alert, ScrollView,
} from 'react-native';
import { Sprout } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import { BASE_URL } from '../api/api';

import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, clearError } from '../store/slices/authSlice';
import { sendOtp, googleLogin } from '../store/slices/authSlice';

const LoginScreen = ({ onBack, onSignup, onContinue, role, onLoginSuccess }) => {
    const dispatch = useDispatch();


    const [phoneNumber, setPhoneNumber] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const { loading } = useSelector((state) => state.auth);


    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        dispatch(clearError());

        GoogleSignin.configure({
            webClientId: '957154860735-1582fvgetnfjqle730eth5a9gcponrfp.apps.googleusercontent.com',
            offlineAccess: true,
        });
        requestFCMPermission();

        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]).start();
    }, []);
    const requestFCMPermission = async () => {
        try {
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            if (enabled) {
                console.log('✅ FCM permission granted');
                // Get and store FCM token
                const fcmToken = await messaging().getToken();
                if (fcmToken) {
                    await AsyncStorage.setItem('fcmToken', fcmToken);
                    console.log('✅ FCM Token stored:', fcmToken.substring(0, 50) + '...');
                }
            } else {
                console.log('⚠️ FCM permission denied or not yet granted');
            }
        } catch (error) {
            console.error('❌ FCM permission request error:', error);
        }
    };

    // 🔴 NEW: Save FCM token to backend after login
    const saveFCMTokenToBackend = async (accessToken) => {
        try {
            const fcmToken = await AsyncStorage.getItem('fcmToken');

            if (!fcmToken) {
                console.warn('⚠️ No FCM token found in storage');
                return false;
            }

            console.log('📱 Sending FCM token to backend...');

            const response = await fetch(
                `${BASE_URL}/api/user/fcm-token/`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({ token: fcmToken }),
                }
            );

            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.warn('⚠️ FCM backend returned HTML instead of JSON. Endpoint might be missing.', responseText.substring(0, 100));
                return false;
            }

            if (response.ok) {
                console.log('✅ FCM token saved to backend!', data);
                return true;
            } else {
                console.error('❌ Failed to save FCM token:', data);
                return false;
            }
        } catch (error) {
            console.error('❌ Error saving FCM token:', error);
            // Don't block login even if FCM fails
            return false;
        }
    };


    const handleSendOTP = async () => {
        if (!phoneNumber || phoneNumber.length < 10) {
            Alert.alert('Error', 'Please enter a valid phone number');
            return;
        }

        try {
            const result = await dispatch(
                sendOtp({ phone: phoneNumber, country_code: countryCode })
            ).unwrap();
            const allowedRoles = ['user'];
            if (allowedRoles.includes(result.role)) {
                Alert.alert('Success', 'OTP sent successfully!');
                setTimeout(() => onContinue(phoneNumber, 'user'), 300);
            } else {
                Alert.alert('Access Denied', 'No account found for this phone number.');
            }
        } catch (err) {
            const msg = err?.data?.message || err?.data?.error || 'Failed to send OTP';
            Alert.alert('Error', msg);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const idToken = userInfo?.data?.idToken ?? userInfo?.idToken;

            const result = await dispatch(
                googleLogin({ idToken })
            ).unwrap();

            const token = result.token || result.access || result.access_token;
            const userData = result.user;
            if (token) {
                dispatch(setCredentials({ token, user: userData }));
                await saveFCMTokenToBackend(token);
            }

            Alert.alert('Success', 'Login Successful!');
            if (onLoginSuccess) {
                onLoginSuccess();
            }
        } catch (err) {
            if (err.code === statusCodes.SIGN_IN_CANCELLED) return;
            if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Alert.alert('Error', 'Play services not available');
                return;
            }
            Alert.alert('Error', err?.data?.error || 'Google Sign-In failed');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <LinearGradient colors={['#F0F9FF', '#FFFFFF']} style={styles.gradient}>
                <SafeAreaView style={styles.safeArea}>
                    <ScrollView
                        contentContainerStyle={styles.content}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >

                        {/* Logo */}
                        <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: fadeAnim }] }]}>
                            <View style={styles.logoBox}>
                                <Sprout size={40} color="#38BDF8" fill="#38BDF8" />
                            </View>
                        </Animated.View>

                        {/* Header */}
                        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                            <Text style={styles.title}>Welcome Back!</Text>
                            <Text style={styles.subtitle}>Your fresh harvest awaits</Text>
                        </Animated.View>

                        {/* Form */}
                        <Animated.View style={[styles.formCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                            <Text style={styles.inputLabel}>Phone Number</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={[styles.input, { maxWidth: 60 }]}
                                    value={countryCode}
                                    onChangeText={setCountryCode}
                                    keyboardType="phone-pad"
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter phone number"
                                    placeholderTextColor="#94A3B8"
                                    keyboardType="phone-pad"
                                    value={phoneNumber}
                                    onChangeText={setPhoneNumber}
                                />
                            </View>

                            <TouchableOpacity
                                style={[styles.otpButton, loading && styles.disabledButton]}
                                activeOpacity={0.8}
                                onPress={handleSendOTP}
                                disabled={loading}
                            >
                                <Text style={styles.otpButtonText}>{loading ? 'Sending...' : 'Send OTP'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.cancelButton} activeOpacity={0.7} onPress={onBack}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Social divider */}
                        <Animated.View style={[styles.socialDivider, { opacity: fadeAnim }]}>
                            <View style={styles.line} />
                            <Text style={styles.socialText}>Login with Social</Text>
                            <View style={styles.line} />
                        </Animated.View>

                        {/* Social buttons */}
                        <Animated.View style={[styles.socialButtonsRow, { opacity: fadeAnim }]}>
                            <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin} disabled={loading}>
                                <Image
                                    source={{ uri: 'https://img.icons8.com/color/72/google-logo.png' }}
                                    style={styles.socialIcon}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton}>
                                <FontAwesome name="apple" size={28} color="#000" />
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Footer */}
                        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                            <Text style={styles.footerText}>
                                New to FarmFresh?{' '}
                                <Text style={styles.linkText} onPress={onSignup}>Create an Account</Text>
                            </Text>
                        </Animated.View>

                    </ScrollView>
                </SafeAreaView>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    gradient: { flex: 1 },
    safeArea: { flex: 1 },
    content: { flexGrow: 1, paddingHorizontal: 24, alignItems: 'center', paddingTop: 60, paddingBottom: 100 },
    logoContainer: { marginBottom: 32 },
    logoBox: { width: 80, height: 80, backgroundColor: '#FFFFFF', borderRadius: 24, justifyContent: 'center', alignItems: 'center', shadowColor: '#0EA5E9', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 5 },
    header: { alignItems: 'center', marginBottom: 40 },
    title: { fontSize: 36, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
    subtitle: { fontSize: 18, color: '#64748B', fontWeight: '500' },
    formCard: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 32, padding: 32, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 4, marginBottom: 40 },
    inputLabel: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 12, marginLeft: 4 },
    inputContainer: { flexDirection: 'row', marginBottom: 24, gap: 12 },
    input: { flex: 1, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 16, fontSize: 16, color: '#1E293B', height: 56 },
    otpButton: { backgroundColor: '#38BDF8', height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#38BDF8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 5 },
    otpButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
    cancelButton: { marginTop: 16, height: 50, justifyContent: 'center', alignItems: 'center' },
    cancelButtonText: { color: '#64748B', fontSize: 16, fontWeight: '600' },
    socialDivider: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 32 },
    line: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
    socialText: { marginHorizontal: 16, color: '#94A3B8', fontSize: 14, fontWeight: '500' },
    socialButtonsRow: { flexDirection: 'row', gap: 20, marginBottom: 48 },
    socialButton: { width: 160, height: 56, backgroundColor: '#FFFFFF', borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 },
    socialIcon: { width: 30, height: 30, resizeMode: 'contain' },
    footer: { marginTop: 'auto', paddingBottom: 20 },
    footerText: { fontSize: 16, color: '#64748B', fontWeight: '500' },
    linkText: { color: '#38BDF8', fontWeight: '700' },
    disabledButton: { backgroundColor: '#CBD5E1', shadowOpacity: 0, elevation: 0 },
});

export default LoginScreen;