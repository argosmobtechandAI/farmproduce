import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Dimensions,
    Platform,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
    ChevronLeft, 
    Calendar,
    Home,
    Truck,
    CircleDollarSign,
    User,
    Wallet,
    Package,
    Gift,
    TrendingUp
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { API_URLS } from '../../config/api';

const { width } = Dimensions.get('window');

const TransactionItem = ({ icon: Icon, title, date, amount, iconBg }) => (
    <View style={styles.transactionItem}>
        <View style={styles.transactionLeft}>
            <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
                <Icon size={20} color={iconBg === '#F0FDF4' ? '#22C55E' : '#EAB308'} />
            </View>
            <View>
                <Text style={styles.transactionTitle}>{title}</Text>
                <Text style={styles.transactionDate}>{date}</Text>
            </View>
        </View>
        <Text style={styles.transactionAmount}>+₹{amount}</Text>
    </View>
);

const WeeklyBar = ({ day, height, active }) => (
    <View style={styles.barContainer}>
        <View style={[styles.bar, { height: height }, active && styles.activeBar]} />
        <Text style={[styles.dayText, active && styles.activeDayText]}>{day}</Text>
    </View>
);

const EarningsScreen = ({ onBack, onNavigateHome, onNavigateTrips, onNavigateProfile }) => {
    const { token } = useAuth();
    const [earnings, setEarnings] = useState({
        total_deliveries: 0,
        total_earned: '0.00',
        this_month: '0.00',
        per_delivery_rate: '100.00',
    });
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        setError(null);
        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            // Fetch Earnings Summary
            const earnRes = await fetch(API_URLS.DELIVERY_EARNINGS, { method: 'GET', headers });
            const earnData = await earnRes.json();

            // Fetch Delivery History
            const histRes = await fetch(API_URLS.DELIVERY_HISTORY, { method: 'GET', headers });
            const histData = await histRes.json();

            if (earnRes.ok && histRes.ok) {
                setEarnings(earnData);
                setHistory(histData.results || []);
            } else {
                setError('Failed to load financial records.');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData(false);
    };

    const formatDate = (isoString) => {
        if (!isoString) return 'Completed';
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (err) {
            return isoString;
        }
    };

    // Calculate bar heights dynamically
    const countsByDay = [0, 0, 0, 0, 0, 0, 0]; // Sun=0, Mon=1, etc.
    history.forEach(item => {
        if (item.delivery_time) {
            const day = new Date(item.delivery_time).getDay();
            countsByDay[day] += 1;
        }
    });

    const maxCount = Math.max(...countsByDay, 1);
    const getBarHeight = (dayIndex) => {
        if (countsByDay[dayIndex] === 0) return 0;
        return (countsByDay[dayIndex] / maxCount) * 80 + 10;
    };

    const currentDayOfWeek = new Date().getDay();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.headerButton} onPress={onBack}>
                        <ChevronLeft size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Earnings</Text>
                    <TouchableOpacity 
                        style={[styles.headerButton, styles.calendarButton]}
                        onPress={() => Alert.alert('History Detail', `Total Deliveries: ${earnings.total_deliveries}`)}
                    >
                        <Calendar size={20} color="#64748B" />
                    </TouchableOpacity>
                </View>

                {loading && !refreshing ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#38BDF8" />
                    </View>
                ) : (
                    <ScrollView 
                        style={styles.scrollView} 
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#38BDF8']}
                            />
                        }
                    >
                        {/* Earnings Card */}
                        <LinearGradient
                            colors={['#38BDF8', '#0EA5E9']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.earningsCard}
                        >
                            <View>
                                <Text style={styles.earningsLabel}>This Month's Earnings</Text>
                                <Text style={styles.earningsValue}>₹{parseFloat(earnings.this_month).toFixed(2)}</Text>
                            </View>
                            
                            <View style={styles.divider} />
                            
                            <View style={styles.weeklyRow}>
                                <View>
                                    <Text style={styles.weeklyLabel}>TOTAL ACCUMULATED EARNINGS</Text>
                                    <Text style={styles.weeklyValue}>₹{parseFloat(earnings.total_earned).toFixed(2)}</Text>
                                </View>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{earnings.total_deliveries} orders</Text>
                                </View>
                            </View>
                        </LinearGradient>

                        {/* Error message */}
                        {error && (
                            <View style={{ padding: 16, backgroundColor: '#FEF2F2', borderRadius: 20, marginBottom: 20 }}>
                                <Text style={{ color: '#EF4444', textAlign: 'center', fontWeight: '600' }}>{error}</Text>
                            </View>
                        )}

                        {/* Weekly Activity */}
                        <View style={styles.sectionCard}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Weekly Activity</Text>
                                <Text style={styles.sectionSubtitle}>Last 7 Days</Text>
                            </View>
                            
                            <View style={styles.chartContainer}>
                                <WeeklyBar day="MON" height={getBarHeight(1)} active={currentDayOfWeek === 1} />
                                <WeeklyBar day="TUE" height={getBarHeight(2)} active={currentDayOfWeek === 2} />
                                <WeeklyBar day="WED" height={getBarHeight(3)} active={currentDayOfWeek === 3} />
                                <WeeklyBar day="THU" height={getBarHeight(4)} active={currentDayOfWeek === 4} />
                                <WeeklyBar day="FRI" height={getBarHeight(5)} active={currentDayOfWeek === 5} />
                                <WeeklyBar day="SAT" height={getBarHeight(6)} active={currentDayOfWeek === 6} />
                                <WeeklyBar day="SUN" height={getBarHeight(0)} active={currentDayOfWeek === 0} />
                            </View>
                        </View>

                        {/* Transaction History */}
                        <View style={styles.transactionHeader}>
                            <Text style={styles.sectionTitle}>Transaction History</Text>
                            <TouchableOpacity onPress={() => Alert.alert('Info', 'Showing latest completed payouts.')}>
                                <Text style={styles.viewAllText}>View All</Text>
                            </TouchableOpacity>
                        </View>

                        {history.length === 0 ? (
                            <View style={{ padding: 24, alignItems: 'center', backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9' }}>
                                <Text style={{ color: '#94A3B8', fontWeight: '600' }}>No payout history found</Text>
                            </View>
                        ) : (
                            history.map(item => (
                                <TransactionItem 
                                    key={item.id}
                                    icon={Package} 
                                    title={`Order Delivery Payout (#${item.order_id})`}
                                    date={formatDate(item.delivery_time)}
                                    amount={parseFloat(earnings.per_delivery_rate || 100).toFixed(2)}
                                    iconBg="#F0FDF4"
                                />
                            ))
                        )}

                        {/* Withdraw Button */}
                        <TouchableOpacity 
                            style={styles.withdrawButton} 
                            activeOpacity={0.8}
                            onPress={() => Alert.alert('Withdraw Request', 'Your request has been submitted to admin for processing.')}
                        >
                            <Wallet size={20} color="#FFF" />
                            <Text style={styles.withdrawButtonText}>Withdraw Funds</Text>
                        </TouchableOpacity>
                    </ScrollView>
                )}
            </SafeAreaView>

            {/* Bottom Nav */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={onNavigateHome}>
                    <Home size={24} color="#94A3B8" />
                    <Text style={styles.navText}>HOME</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={onNavigateTrips}>
                    <Truck size={24} color="#94A3B8" />
                    <Text style={styles.navText}>MY TRIPS</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <CircleDollarSign size={24} color="#38BDF8" />
                    <Text style={[styles.navText, styles.activeNavText]}>EARNINGS</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={onNavigateProfile}>
                    <User size={24} color="#94A3B8" />
                    <Text style={styles.navText}>PROFILE</Text>
                </TouchableOpacity>
            </View>
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
        height: 60,
        backgroundColor: '#FFF',
    },
    headerButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarButton: {
        backgroundColor: '#F1F5F9',
        borderRadius: 10,
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
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 120,
    },
    earningsCard: {
        padding: 24,
        borderRadius: 28,
        marginBottom: 20,
        shadowColor: '#0EA5E9',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    earningsLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 4,
    },
    earningsValue: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FFF',
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginVertical: 20,
    },
    weeklyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    weeklyLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: 'rgba(255, 255, 255, 0.7)',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    weeklyValue: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFF',
    },
    badge: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFF',
    },
    sectionCard: {
        backgroundColor: '#FFF',
        borderRadius: 28,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#1E293B',
    },
    sectionSubtitle: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '600',
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 120,
        paddingBottom: 20,
    },
    barContainer: {
        alignItems: 'center',
        flex: 1,
    },
    bar: {
        width: 28,
        backgroundColor: '#E0F2FE',
        borderRadius: 14,
        marginBottom: 8,
    },
    activeBar: {
        backgroundColor: '#38BDF8',
    },
    dayText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#94A3B8',
    },
    activeDayText: {
        color: '#38BDF8',
    },
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    viewAllText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#38BDF8',
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 24,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    transactionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    transactionTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 2,
    },
    transactionDate: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
    },
    transactionAmount: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
    },
    withdrawButton: {
        backgroundColor: '#38BDF8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 16,
        gap: 8,
        marginTop: 12,
        shadowColor: '#38BDF8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    withdrawButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '800',
    },
    bottomNav: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    navItem: {
        flex: 1,
        alignItems: 'center',
    },
    navText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94A3B8',
        marginTop: 6,
    },
    activeNavText: {
        color: '#38BDF8',
    },
});

export default EarningsScreen;
