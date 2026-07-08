import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Easing,
    StatusBar,
    Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ShoppingBag, Leaf } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const SplashScreen = () => {
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // Rotation animation for the loading spinner
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 1500,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();

        // Entry animation for the content
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
            <LinearGradient
                colors={['#57C1EB', '#25A9E1']}
                style={styles.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >
                <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                    {/* Logo Container */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoBox}>
                            <ShoppingBag size={50} color="#25A9E1" fill="#25A9E1" />
                        </View>
                        <View style={styles.leafBadge}>
                            <Leaf size={14} color="white" fill="white" />
                        </View>
                    </View>

                    {/* Text Content */}
                    <Text style={styles.title}>FarmFresh</Text>
                    <Text style={styles.subtitle}>Fresh from Farm to Door</Text>
                </Animated.View>

                {/* Loading Footer */}
                <View style={styles.footer}>
                    <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
                        <View style={styles.spinnerCircle} />
                    </Animated.View>
                    <Text style={styles.loadingText}>LOADING EXPERIENCE</Text>
                </View>
            </LinearGradient>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        marginBottom: 100,
    },
    logoContainer: {
        position: 'relative',
        marginBottom: 30,
    },
    logoBox: {
        width: 120,
        height: 120,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    leafBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#38BDF8',
        width: 35,
        height: 35,
        borderRadius: 17.5,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    title: {
        fontSize: 42,
        fontWeight: '800',
        color: 'white',
        letterSpacing: 1,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: 'white',
        opacity: 0.9,
        fontWeight: '500',
    },
    footer: {
        position: 'absolute',
        bottom: 60,
        alignItems: 'center',
    },
    spinner: {
        width: 30,
        height: 30,
        marginBottom: 15,
    },
    spinnerCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderTopColor: 'white',
    },
    loadingText: {
        color: 'white',
        fontSize: 12,
        letterSpacing: 3,
        fontWeight: 'bold',
        opacity: 0.8,
    },
});

export default SplashScreen;
