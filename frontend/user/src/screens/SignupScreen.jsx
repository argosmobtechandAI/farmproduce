import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    TextInput, StatusBar, Animated, ScrollView,
} from 'react-native';
import { User, Phone, Mail, ChevronLeft, Check } from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import Svg, { Path } from 'react-native-svg';
import { registerUser, clearError } from '../store/slices/authSlice';

const SignupScreen = ({ onBack, onLogin, onContinue, role }) => {
    const dispatch = useDispatch();

    const { loading, error } = useSelector((state) => state.auth)

    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [agree, setAgree] = useState(false);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        dispatch(clearError());
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleSignup = async () => {
        if (!fullName.trim()) {
            alert('Full name is required');
            return;
        }

        if (fullName.trim().length < 3) {
            alert('Name must be at least 3 characters');
            return;
        }

        if (!/^[A-Za-z ]+$/.test(fullName)) {
            alert('Name should contain only letters');
            return;
        }

        // 🔥 Phone validation (Indian)
        if (!phoneNumber) {
            alert('Phone number is required');
            return;
        }

        if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
            alert('Enter valid 10-digit Indian phone number');
            return;
        }

        // 🔥 Email validation
        if (!email) {
            alert('Email is required');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Enter valid email address');
            return;
        }

        // 🔥 Terms checkbox
        if (!agree) {
            alert('Please accept terms & conditions');
            return;
        }

        try {
            const result = await dispatch(registerUser({
                userName: fullName,
                email: email,
                phone: phoneNumber,
                country_code: '+91',
            })).unwrap();
            alert('Registration successful! Please log in.');
            onLogin();
        } catch (err) {
            const msg = typeof err === 'string'
                ? err
                : err?.message || err?.data?.message || 'Registration failed';
            alert(msg);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <LinearGradient colors={['#F0F9FF', '#FFFFFF']} style={styles.gradient}>

                <View style={styles.bgDecoration}>
                    <Svg height="300" width="300" viewBox="0 0 100 100">
                        <Path d="M80,20 C60,20 40,40 20,80 C40,80 60,60 80,20 Z" fill="#0EA5E9" fillOpacity="0.05" />
                        <Path d="M20,80 Q50,50 80,20" stroke="#0EA5E9" strokeWidth="0.5" strokeOpacity="0.1" />
                    </Svg>
                </View>

                <SafeAreaView style={styles.safeArea}>
                    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                        {/* Back button */}
                        <Animated.View style={[styles.backButtonContainer, { opacity: fadeAnim }]}>
                            <TouchableOpacity style={styles.backButton} onPress={onBack}>
                                <ChevronLeft size={28} color="#0F172A" />
                            </TouchableOpacity>
                        </Animated.View>

                        {/* Header */}
                        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                            <Text style={styles.title}>Join FarmFresh</Text>
                            <Text style={styles.subtitle}>Start your journey to fresher produce today.</Text>
                        </Animated.View>

                        {/* Form */}
                        <Animated.View style={[styles.form, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Full Name</Text>
                                <View style={styles.inputContainer}>
                                    <View style={styles.iconBox}><User size={20} color="#94A3B8" /></View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="John Doe"
                                        placeholderTextColor="#94A3B8"
                                        value={fullName}
                                        onChangeText={setFullName}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Phone Number</Text>
                                <View style={styles.inputContainer}>
                                    <View style={styles.iconBox}><Phone size={20} color="#94A3B8" /></View>
                                    <View style={styles.countryCodeBox}>
                                        <Text style={styles.countryCodeText}>+91</Text>
                                    </View>
                                    <View style={styles.divider} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="1234567890"
                                        placeholderTextColor="#94A3B8"
                                        keyboardType="phone-pad"
                                        maxLength={10}
                                        value={phoneNumber}
                                        onChangeText={(text) => {
                                            const cleaned = text.replace(/[^0-9]/g, ''); // digits only
                                            setPhoneNumber(cleaned);
                                        }}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Email Address</Text>
                                <View style={styles.inputContainer}>
                                    <View style={styles.iconBox}><Mail size={20} color="#94A3B8" /></View>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="john@example.com"
                                        placeholderTextColor="#94A3B8"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={email}
                                        onChangeText={setEmail}
                                    />
                                </View>
                            </View>

                            {/* Terms */}
                            <TouchableOpacity style={styles.termsContainer} onPress={() => setAgree(!agree)} activeOpacity={0.7}>
                                <View style={[styles.checkbox, agree && styles.checkboxActive]}>
                                    {agree && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                                </View>
                                <Text style={styles.termsText}>
                                    I agree to the <Text style={styles.linkText}>Terms & Conditions</Text> and{' '}
                                    <Text style={styles.linkText}>Privacy Policy</Text>.
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.createButton, (!agree || loading) && styles.createButtonDisabled]}
                                activeOpacity={0.8}
                                disabled={!agree || loading}
                                onPress={handleSignup}
                            >
                                <Text style={styles.createButtonText}>{loading ? 'Creating...' : 'Create Account'}</Text>
                            </TouchableOpacity>

                        </Animated.View>

                        {/* Footer */}
                        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
                            <Text style={styles.footerText}>
                                Already have an account?{' '}
                                <Text style={styles.linkText} onPress={onLogin}>Login</Text>
                            </Text>
                        </Animated.View>

                    </ScrollView>
                </SafeAreaView>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    gradient: { flex: 1 },
    bgDecoration: { position: 'absolute', top: -50, right: -50, zIndex: 0 },
    safeArea: { flex: 1 },
    scrollContent: { paddingHorizontal: 28, paddingBottom: 40 },
    backButtonContainer: { marginTop: 12, marginBottom: 24 },
    backButton: { width: 54, height: 54, backgroundColor: '#FFFFFF', borderRadius: 27, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 3 },
    header: { marginBottom: 44 },
    title: { fontSize: 38, fontWeight: '800', color: '#0F172A', marginBottom: 10, letterSpacing: -0.5 },
    subtitle: { fontSize: 18, color: '#64748B', fontWeight: '500', lineHeight: 26 },
    form: { gap: 24, marginBottom: 44 },
    inputGroup: { gap: 10 },
    inputLabel: { fontSize: 15, fontWeight: '700', color: '#475569', marginLeft: 4 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#F1F5F9', borderRadius: 20, paddingHorizontal: 16, height: 64, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
    iconBox: { width: 24, alignItems: 'center', marginRight: 12 },
    input: { flex: 1, fontSize: 16, color: '#1E293B', fontWeight: '600' },
    termsContainer: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 8, paddingRight: 10 },
    checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
    checkboxActive: { borderColor: '#0EA5E9', backgroundColor: '#0EA5E9' },
    termsText: { flex: 1, fontSize: 15, color: '#64748B', fontWeight: '500', lineHeight: 22 },
    createButton: { backgroundColor: '#38BDF8', height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginTop: 16, shadowColor: '#0EA5E9', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 15, elevation: 6 },
    createButtonDisabled: { backgroundColor: '#CBD5E1', shadowOpacity: 0, elevation: 0 },
    createButtonText: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
    footer: { alignItems: 'center', paddingBottom: 20 },
    footerText: { fontSize: 16, color: '#64748B', fontWeight: '600' },
    linkText: { color: '#0EA5E9', fontWeight: '800' },
    countryCodeBox: {
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    countryCodeText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    divider: {
        width: 1.5,
        height: 28,
        backgroundColor: '#E2E8F0',
        marginHorizontal: 10,
    },
});
export default SignupScreen;