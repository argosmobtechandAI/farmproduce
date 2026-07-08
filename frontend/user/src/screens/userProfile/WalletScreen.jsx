import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Dimensions,
} from 'react-native';
import {
    ChevronLeft,
    Plus,
    ArrowUpRight,
    ArrowDownLeft,
    History,
    TrendingUp,
    TrendingDown,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const transactionsData = [
    {
        id: 1,
        title: 'Order #9874',
        date: '18 Mar 2024, 11:20 AM',
        amount: '-$45.80',
        type: 'DEBIT',
        status: 'Completed'
    },
    {
        id: 2,
        title: 'Refund - Order #9821',
        date: '16 Mar 2024, 02:45 PM',
        amount: '+$12.50',
        type: 'CREDIT',
        status: 'Completed'
    },
    {
        id: 3,
        title: 'Topup - Wallet',
        date: '15 Mar 2024, 10:00 AM',
        amount: '+$100.00',
        type: 'CREDIT',
        status: 'Completed'
    },
    {
        id: 4,
        title: 'Order #9810',
        date: '12 Mar 2024, 05:30 PM',
        amount: '-$22.40',
        type: 'DEBIT',
        status: 'Completed'
    }
];

const WalletScreen = ({ onBack }) => {
    const [transactions] = useState(transactionsData);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0EA5E9" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <ChevronLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Wallet</Text>
                    <TouchableOpacity style={styles.historyButton}>
                        <History size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* Balance Card */}
                <View style={styles.balanceSection}>
                    <View style={styles.balanceCard}>
                        <Text style={styles.balanceLabel}>Total Balance</Text>
                        <Text style={styles.balanceAmount}>$1,245.50</Text>
                        <Text style={styles.balanceSub}>+ 2.5% from last month</Text>

                        <View style={styles.actionRow}>
                            <TouchableOpacity style={styles.actionButton}>
                                <View style={[styles.actionIcon, { backgroundColor: '#38BDF8' }]}>
                                    <Plus size={20} color="#FFFFFF" />
                                </View>
                                <Text style={styles.actionText}>Top Up</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <View style={[styles.actionIcon, { backgroundColor: '#F472B6' }]}>
                                    <ArrowUpRight size={20} color="#FFFFFF" />
                                </View>
                                <Text style={styles.actionText}>Withdraw</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <View style={[styles.actionIcon, { backgroundColor: '#A78BFA' }]}>
                                    <ArrowDownLeft size={20} color="#FFFFFF" />
                                </View>
                                <Text style={styles.actionText}>Transfer</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Transactions */}
                <View style={styles.transactionsContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Transactions</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.transactionsScroll}>
                        {transactions.map((item) => (
                            <View key={item.id} style={styles.transactionCard}>
                                <View style={styles.transactionLeft}>
                                    <View style={[
                                        styles.transactionIcon,
                                        { backgroundColor: item.type === 'CREDIT' ? '#DCFCE7' : '#FEE2E2' }
                                    ]}>
                                        {item.type === 'CREDIT' ? (
                                            <TrendingUp size={20} color="#22C55E" />
                                        ) : (
                                            <TrendingDown size={20} color="#EF4444" />
                                        )}
                                    </View>
                                    <View style={styles.transactionInfo}>
                                        <Text style={styles.transactionTitle}>{item.title}</Text>
                                        <Text style={styles.transactionDate}>{item.date}</Text>
                                    </View>
                                </View>
                                <View style={styles.transactionRight}>
                                    <Text style={[
                                        styles.transactionAmount,
                                        { color: item.type === 'CREDIT' ? '#22C55E' : '#1E293B' }
                                    ]}>
                                        {item.amount}
                                    </Text>
                                    <Text style={styles.transactionStatus}>{item.status}</Text>
                                </View>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0EA5E9',
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
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    historyButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    balanceSection: {
        paddingHorizontal: 20,
        paddingVertical: 30,
        alignItems: 'center',
    },
    balanceCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        padding: 30,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    balanceLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94A3B8',
        marginBottom: 10,
    },
    balanceAmount: {
        fontSize: 36,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 8,
    },
    balanceSub: {
        fontSize: 12,
        fontWeight: '700',
        color: '#22C55E',
        marginBottom: 30,
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
    },
    actionButton: {
        alignItems: 'center',
        gap: 8,
    },
    actionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
    },
    transactionsContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    seeAllText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0EA5E9',
    },
    transactionsScroll: {
        paddingBottom: 40,
    },
    transactionCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    transactionIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    transactionInfo: {
        gap: 4,
    },
    transactionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
    },
    transactionDate: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
    },
    transactionRight: {
        alignItems: 'flex-end',
        gap: 4,
    },
    transactionAmount: {
        fontSize: 15,
        fontWeight: '800',
    },
    transactionStatus: {
        fontSize: 11,
        color: '#64748B',
        fontWeight: '600',
    },
});

export default WalletScreen;
