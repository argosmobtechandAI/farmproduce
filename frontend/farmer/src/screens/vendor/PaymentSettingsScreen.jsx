import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    StatusBar,
    Image,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    ChevronLeft, 
    CreditCard, 
    Landmark, 
    History, 
    AlertCircle, 
    CheckCircle2,
    DollarSign,
    MoreVertical
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const PaymentSettingsScreen = ({ onBack }) => {
    const [bankName, setBankName] = useState('Central Agricultural Bank');
    const [accountName, setAccountName] = useState('Green Valley Farm LLC');
    const [accountNumber, setAccountNumber] = useState('**** **** **** 8829');
    const [ifsc, setIfsc] = useState('CABN0001245');

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <ChevronLeft size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Payment Settings</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView 
                    style={styles.scrollView} 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Active Bank Account Card */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Primary Payout Method</Text>
                        <TouchableOpacity>
                            <Text style={styles.editLink}>Edit</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.bankCard}>
                        <View style={styles.bankHeader}>
                            <View style={styles.bankIconContainer}>
                                <Landmark size={24} color="#38BDF8" />
                            </View>
                            <View>
                                <Text style={styles.bankNameText}>{bankName}</Text>
                                <Text style={styles.accountTypeText}>Business Checking Account</Text>
                            </View>
                            <CheckCircle2 size={24} color="#10B981" style={styles.checkIcon} />
                        </View>
                        
                        <View style={styles.cardDetails}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Account Holder</Text>
                                <Text style={styles.detailValue}>{accountName}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Account Number</Text>
                                <Text style={styles.detailValue}>{accountNumber}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>IFSC Code</Text>
                                <Text style={styles.detailValue}>{ifsc}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Payout Schedule Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Payout Schedule</Text>
                    </View>
                    <View style={styles.scheduleCard}>
                        <View style={styles.scheduleRow}>
                            <View style={styles.scheduleLeft}>
                                <View style={styles.scheduleIconBox}>
                                    <History size={20} color="#64748B" />
                                </View>
                                <View>
                                    <Text style={styles.scheduleTitle}>Weekly Payouts</Text>
                                    <Text style={styles.scheduleSubtext}>Processed every Monday morning</Text>
                                </View>
                            </View>
                            <TouchableOpacity style={styles.changeLink}>
                                <Text style={styles.changeLinkText}>Change</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Next Payout Info */}
                    <View style={styles.payoutEstimate}>
                        <View style={styles.payoutLeft}>
                            <View style={styles.payoutIconBox}>
                                <DollarSign size={24} color="#10B981" />
                            </View>
                            <View>
                                <Text style={styles.payoutLabel}>Next Payout (EST)</Text>
                                <Text style={styles.payoutDate}>March 23, 2026</Text>
                            </View>
                        </View>
                        <Text style={styles.payoutAmount}>$1,480.25</Text>
                    </View>

                    {/* Verification Status */}
                    <View style={styles.alertCard}>
                        <AlertCircle size={20} color="#F59E0B" />
                        <Text style={styles.alertText}>Your billing address needs confirmation by April 5th to avoid payout delays.</Text>
                    </View>

                    {/* Add New Method */}
                    <TouchableOpacity style={styles.addMethodButton}>
                        <Landmark size={20} color="#38BDF8" style={{ marginRight: 10 }} />
                        <Text style={styles.addMethodText}>Link Another Account</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 40,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
    },
    editLink: {
        fontSize: 14,
        fontWeight: '700',
        color: '#38BDF8',
    },
    bankCard: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    bankHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    bankIconContainer: {
        width: 52,
        height: 52,
        backgroundColor: '#F0F9FF',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    bankNameText: {
        fontSize: 17,
        fontWeight: '800',
        color: '#1E293B',
    },
    accountTypeText: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '600',
        marginTop: 2,
    },
    checkIcon: {
        marginLeft: 'auto',
    },
    cardDetails: {
        gap: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 13,
        color: '#94A3B8',
        fontWeight: '600',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
    },
    scheduleCard: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
    },
    scheduleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    scheduleLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    scheduleIconBox: {
        width: 40,
        height: 40,
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scheduleTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
    },
    scheduleSubtext: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
    },
    changeLinkText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#38BDF8',
    },
    payoutEstimate: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        padding: 24,
        borderRadius: 24,
        marginBottom: 24,
    },
    payoutLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    payoutIconBox: {
        width: 48,
        height: 48,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    payoutLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    payoutDate: {
        fontSize: 16,
        color: '#FFF',
        fontWeight: '700',
        marginTop: 2,
    },
    payoutAmount: {
        fontSize: 22,
        fontWeight: '800',
        color: '#10B981',
    },
    alertCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        padding: 16,
        borderRadius: 16,
        gap: 12,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    alertText: {
        flex: 1,
        fontSize: 12,
        color: '#92400E',
        fontWeight: '600',
        lineHeight: 18,
    },
    addMethodButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 18,
        borderRadius: 20,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#CBD5E1',
        marginTop: 30,
    },
    addMethodText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#38BDF8',
    },
});

export default PaymentSettingsScreen;
