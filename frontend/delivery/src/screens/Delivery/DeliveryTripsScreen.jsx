import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Platform,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChevronLeft,
    Home,
    Truck,
    CircleDollarSign,
    User,
    ArrowUpRight,
    CheckCircle2
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { API_URLS } from '../../config/api';

const TripItem = ({ id, orderId, status, date, amount, isActive, onSelect }) => (
    <TouchableOpacity 
        style={[styles.tripItem, isActive && styles.activeTripItem]} 
        onPress={onSelect}
        activeOpacity={0.8}
    >
        <View style={styles.tripLeft}>
            <View style={[styles.iconContainer, { backgroundColor: isActive ? '#E0F2FE' : '#F0FDF4' }]}>
                {isActive ? (
                    <Truck size={20} color="#0284C7" />
                ) : (
                    <CheckCircle2 size={20} color="#15803D" />
                )}
            </View>
            <View>
                <Text style={styles.tripTitle}>Order #{orderId}</Text>
                <Text style={styles.tripDate}>{date}</Text>
            </View>
        </View>
        <View style={styles.tripRight}>
            <Text style={[styles.tripAmount, isActive && styles.activeAmountText]}>
                {isActive ? 'Active' : `+₹${amount}`}
            </Text>
            {isActive && <ArrowUpRight size={16} color="#0284C7" />}
        </View>
    </TouchableOpacity>
);

const DeliveryTripsScreen = ({ onBack, onNavigateHome, onNavigateProfile, onNavigateEarnings, onStartTrip }) => {
    const { token } = useAuth();
    const [activeDeliveries, setActiveDeliveries] = useState([]);
    const [history, setHistory] = useState([]);
    const [earnings, setEarnings] = useState({
        total_deliveries: 0,
        total_earned: '0.00',
        this_month: '0.00',
        per_delivery_rate: '100.00',
    });
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

            // Fetch Active Assignments
            const activeRes = await fetch(API_URLS.DELIVERY_ASSIGNMENTS, { method: 'GET', headers });
            const activeData = await activeRes.json();

            // Fetch Earnings Summary
            const earnRes = await fetch(API_URLS.DELIVERY_EARNINGS, { method: 'GET', headers });
            const earnData = await earnRes.json();

            // Fetch Past Trips
            const histRes = await fetch(API_URLS.DELIVERY_HISTORY, { method: 'GET', headers });
            const histData = await histRes.json();

            if (activeRes.ok && earnRes.ok && histRes.ok) {
                // Filter active status
                const active = (activeData.results || []).filter(
                    d => d.status === 'assigned' || d.status === 'accepted' || d.status === 'picked_up'
                );
                setActiveDeliveries(active);
                setEarnings(earnData);
                setHistory(histData.results || []);
            } else {
                setError('Failed to load trips data.');
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
    }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

    const onRefresh = () => {
        setRefreshing(true);
        fetchData(false);
    };

    const formatDate = (isoString) => {
        if (!isoString) return 'Pending';
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

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.headerButton} onPress={onBack}>
                        <ChevronLeft size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>My Trips</Text>
                    <View style={styles.headerButton} />
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
                        {/* Summary Gradient Card */}
                        <LinearGradient
                            colors={['#0EA5E9', '#38BDF8']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.summaryCard}
                        >
                            <View style={styles.summaryRow}>
                                <View>
                                    <Text style={styles.summaryLabel}>Total Earnings</Text>
                                    <Text style={styles.summaryValue}>₹{parseFloat(earnings.total_earned).toFixed(2)}</Text>
                                </View>
                                <View style={styles.badge}>
                                    <Text style={styles.badgeText}>{earnings.total_deliveries} Trips Done</Text>
                                </View>
                            </View>
                        </LinearGradient>

                        {error && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        {/* Active Trips Section */}
                        <Text style={styles.sectionTitle}>Active Trips ({activeDeliveries.length})</Text>
                        {activeDeliveries.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No active trips at the moment.</Text>
                            </View>
                        ) : (
                            activeDeliveries.map(trip => (
                                <TripItem
                                    key={trip.id}
                                    id={trip.id}
                                    orderId={trip.order_id}
                                    status={trip.status}
                                    date="In Progress"
                                    amount={earnings.per_delivery_rate}
                                    isActive={true}
                                    onSelect={() => onStartTrip(trip)}
                                />
                            ))
                        )}

                        {/* Completed Trips History Section */}
                        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Trip History ({history.length})</Text>
                        {history.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No completed trips found.</Text>
                            </View>
                        ) : (
                            history.map(trip => (
                                <TripItem
                                    key={trip.id}
                                    id={trip.id}
                                    orderId={trip.order_id}
                                    status={trip.status}
                                    date={formatDate(trip.delivery_time)}
                                    amount={earnings.per_delivery_rate}
                                    isActive={false}
                                    onSelect={() => Alert.alert('Trip Details', `Order #${trip.order_id} delivered successfully on ${formatDate(trip.delivery_time)}.`)}
                                />
                            ))
                        )}
                    </ScrollView>
                )}
            </SafeAreaView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={onNavigateHome}>
                    <Home size={24} color="#94A3B8" />
                    <Text style={styles.navText}>HOME</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Truck size={24} color="#38BDF8" />
                    <Text style={[styles.navText, styles.activeNavText]}>MY TRIPS</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={onNavigateEarnings}>
                    <CircleDollarSign size={24} color="#94A3B8" />
                    <Text style={styles.navText}>EARNINGS</Text>
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
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    headerButton: {
        width: 40,
        height: 40,
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
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 100,
    },
    summaryCard: {
        padding: 24,
        borderRadius: 24,
        marginBottom: 24,
        shadowColor: '#0EA5E9',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 6,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.85)',
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 32,
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
        fontSize: 12,
        fontWeight: '700',
        color: '#FFF',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 12,
        letterSpacing: 0.2,
    },
    tripItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 20,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    activeTripItem: {
        borderColor: '#BAE6FD',
        backgroundColor: '#F0F9FF',
    },
    tripLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tripTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 2,
    },
    tripDate: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '600',
    },
    tripRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    tripAmount: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1E293B',
    },
    activeAmountText: {
        color: '#0284C7',
    },
    emptyContainer: {
        padding: 24,
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        borderStyle: 'dashed',
    },
    emptyText: {
        color: '#94A3B8',
        fontWeight: '600',
        fontSize: 14,
    },
    errorContainer: {
        padding: 16,
        backgroundColor: '#FEF2F2',
        borderRadius: 20,
        marginBottom: 20,
    },
    errorText: {
        color: '#EF4444',
        textAlign: 'center',
        fontWeight: '600',
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

export default DeliveryTripsScreen;
