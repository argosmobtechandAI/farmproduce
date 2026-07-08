import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Image,
} from 'react-native';
import {
    ChevronLeft,
    Plus,
    CreditCard,
    MoreVertical,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const paymentMethodsData = [
    {
        id: 1,
        type: 'Visa',
        number: '**** **** **** 4589',
        expiry: '12/26',
        isDefault: true,
        bg: '#1E293B',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png'
    },
    {
        id: 2,
        type: 'MasterCard',
        number: '**** **** **** 8742',
        expiry: '09/25',
        isDefault: false,
        bg: '#334155',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1200px-Mastercard-logo.svg.png'
    }
];

const PaymentMethodsScreen = ({ onBack }) => {
    const [methods] = useState(paymentMethodsData);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <ChevronLeft size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Payment Methods</Text>
                    <TouchableOpacity style={styles.addButton}>
                        <Plus size={20} color="#38BDF8" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.sectionTitle}>Your Cards</Text>

                    {methods.map((item) => (
                        <View key={item.id} style={[styles.card, { backgroundColor: item.bg }]}>
                            <View style={styles.cardHeader}>
                                <Image source={{ uri: item.logo }} style={styles.cardLogo} resizeMode="contain" />
                                <TouchableOpacity>
                                    <MoreVertical size={20} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.cardNumber}>{item.number}</Text>
                            <View style={styles.cardFooter}>
                                <View>
                                    <Text style={styles.cardLabel}>CARD HOLDER</Text>
                                    <Text style={styles.cardValue}>ALEX JOHNSON</Text>
                                </View>
                                <View>
                                    <Text style={styles.cardLabel}>EXPIRES</Text>
                                    <Text style={styles.cardValue}>{item.expiry}</Text>
                                </View>
                            </View>
                            {item.isDefault && (
                                <View style={styles.defaultBadge}>
                                    <Text style={styles.defaultText}>DEFAULT</Text>
                                </View>
                            )}
                        </View>
                    ))}

                    <TouchableOpacity style={styles.addNewCard}>
                        <View style={styles.addIconBox}>
                            <Plus size={24} color="#38BDF8" />
                        </View>
                        <Text style={styles.addNewText}>Add New Payment Method</Text>
                    </TouchableOpacity>

                    <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Other Methods</Text>
                    <TouchableOpacity style={styles.otherMethod}>
                        <View style={styles.otherMethodLeft}>
                            <View style={styles.otherIconBox}>
                                <Image
                                    source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg' }}
                                    style={styles.paypalLogo}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text style={styles.otherMethodText}>PayPal</Text>
                        </View>
                        <ChevronLeft size={20} color="#94A3B8" style={{ transform: [{ rotate: '180deg' }] }} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.otherMethod}>
                        <View style={styles.otherMethodLeft}>
                            <View style={styles.otherIconBox}>
                                <Image
                                    source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg' }}
                                    style={styles.appleLogo}
                                    resizeMode="contain"
                                />
                            </View>
                            <Text style={styles.otherMethodText}>Apple Pay</Text>
                        </View>
                        <ChevronLeft size={20} color="#94A3B8" style={{ transform: [{ rotate: '180deg' }] }} />
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 20,
    },
    card: {
        borderRadius: 24,
        padding: 24,
        height: 200,
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    cardLogo: {
        width: 60,
        height: 30,
        tintColor: '#FFFFFF',
    },
    cardNumber: {
        fontSize: 22,
        color: '#FFFFFF',
        fontWeight: '700',
        letterSpacing: 2,
        marginBottom: 30,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '600',
        marginBottom: 4,
    },
    cardValue: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    defaultBadge: {
        position: 'absolute',
        top: 24,
        right: 60,
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    defaultText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '800',
    },
    addNewCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        marginTop: 10,
        justifyContent: 'center',
        gap: 12,
    },
    addIconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addNewText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#38BDF8',
    },
    otherMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    otherMethodLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    otherIconBox: {
        width: 44,
        height: 44,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    paypalLogo: {
        width: 24,
        height: 24,
    },
    appleLogo: {
        width: 24,
        height: 24,
    },
    otherMethodText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
    },
});

export default PaymentMethodsScreen;
