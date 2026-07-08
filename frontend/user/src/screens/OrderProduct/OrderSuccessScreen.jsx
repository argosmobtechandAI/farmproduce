import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    SafeAreaView,
    Animated,
    Dimensions,
} from 'react-native';
import {
    Check,
    Clock,
    DollarSign,
    Leaf,
    ArrowRight
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const OrderSuccessScreen = ({ orderData, onTrackOrder, onContinueShopping }) => {
    // Animations
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const orderId = orderData?.id ? `#FF-${orderData.id}` : '#FF-8902';
    const totalAmount = orderData?.total_price ? `₹${orderData.total_price}` : '₹0.00';
    const productName = orderData?.items?.[0]?.product_name || 'Fresh Produce';

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FDFEFE" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    {/* Background Decorative Leaf */}
                    <View style={styles.bgLeafContainer}>
                        <Leaf size={150} color="#F0FDF4" fill="#F0FDF4" style={styles.bgLeaf} />
                    </View>

                    {/* Success Icon */}
                    <Animated.View style={[styles.successIconContainer, { transform: [{ scale: scaleAnim }] }]}>
                        <View style={styles.successCircle}>
                            <Check size={48} color="#FFFFFF" strokeWidth={4} />
                        </View>
                    </Animated.View>

                    {/* Text Content */}
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], alignItems: 'center' }}>
                        <Text style={styles.title}>Order Placed Successfully!</Text>
                        <Text style={styles.subtitle}>
                            Your fresh produce is being prepared{'\n'}at the farm.
                        </Text>
                    </Animated.View>

                    {/* Order Details Card */}
                    <Animated.View style={[styles.orderCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                        <Text style={styles.orderIdLabel}>ORDER ID</Text>
                        <Text style={styles.orderIdValue}>{orderId}</Text>

                        <View style={styles.divider} />

                        <View style={styles.detailsRow}>
                            <View style={styles.detailItem}>
                                <View style={styles.detailHeader}>
                                    <Clock size={16} color="#94A3B8" />
                                    <Text style={styles.detailLabel}>Estimated Time</Text>
                                </View>
                                <Text style={styles.detailValue}>Today, 09:30 AM</Text>
                            </View>

                            <View style={styles.detailItem}>
                                <View style={styles.detailHeader}>
                                    <DollarSign size={16} color="#94A3B8" />
                                    <Text style={styles.detailLabel}>Total Amount</Text>
                                </View>
                                <Text style={[styles.detailValue, { color: '#38BDF8' }]}>{totalAmount}</Text>
                            </View>
                        </View>

                        <View style={styles.supportCard}>
                            <View style={styles.supportIconBg}>
                                <Leaf size={18} color="#22C55E" />
                            </View>
                            <View>
                                <Text style={styles.supportLabel}>Product</Text>
                                <Text style={styles.supportValue}>{productName}</Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* Actions */}
                    <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
                        <TouchableOpacity style={styles.trackButton} onPress={onTrackOrder}>
                            <Text style={styles.trackButtonText}>Track My Order</Text>
                            <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.continueButton} onPress={onContinueShopping}>
                            <Text style={styles.continueButtonText}>Continue Shopping</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                {/* Bottom Watermark - matched from image */}
                <Text style={styles.watermark}>Argosmob@123</Text>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFEFE',
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 30,
        justifyContent: 'center',
    },
    bgLeafContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        opacity: 0.5,
    },
    bgLeaf: {
        transform: [{ rotate: '-15deg' }],
    },
    successIconContainer: {
        marginBottom: 30,
    },
    successCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#38BDF8',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#38BDF8',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: '#64748B',
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 40,
        fontWeight: '500',
    },
    orderCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        marginBottom: 40,
    },
    orderIdLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#94A3B8',
        textAlign: 'center',
        letterSpacing: 1.5,
        marginBottom: 8,
    },
    orderIdValue: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1E293B',
        textAlign: 'center',
        marginBottom: 20,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        width: '100%',
        marginBottom: 20,
        borderStyle: 'dashed',
        borderRadius: 1,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
    },
    detailItem: {
        flex: 1,
    },
    detailHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 6,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94A3B8',
    },
    detailValue: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
    },
    supportCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 16,
    },
    supportIconBg: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#DCFCE7',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    supportLabel: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '600',
    },
    supportValue: {
        fontSize: 13,
        color: '#1E293B',
        fontWeight: '700',
    },
    actions: {
        width: '100%',
        gap: 16,
    },
    trackButton: {
        width: '100%',
        height: 60,
        backgroundColor: '#38BDF8',
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        shadowColor: '#38BDF8',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 4,
    },
    trackButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '800',
    },
    continueButton: {
        width: '100%',
        height: 60,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
    },
    continueButtonText: {
        color: '#64748B',
        fontSize: 17,
        fontWeight: '700',
    },
    watermark: {
        textAlign: 'center',
        fontSize: 10,
        color: '#CBD5E1',
        marginBottom: 10,
    }
});

export default OrderSuccessScreen;
