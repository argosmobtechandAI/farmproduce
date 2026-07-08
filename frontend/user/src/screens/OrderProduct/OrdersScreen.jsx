import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
    StatusBar,
    TextInput,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, ChevronRight, Clock, Package, CheckCircle2, Truck, RefreshCcw, Star } from 'lucide-react-native';
import BottomTabs from '../../components/BottomTabs';
import { orderListApi, BASE_URL } from '../../api/api';
import { apiFunction } from '../../api/apifunction';
import { useEffect } from 'react';

const { width } = Dimensions.get('window');

const OrdersScreen = ({ onNavigateHome, onNavigateCategories, onNavigateCheckout, onNavigateTrackOrder, onNavigateDetail, onNavigateProfile }) => {
    const [activeTab, setActiveTab] = useState('Ongoing');
    const [ongoingOrders, setOngoingOrders] = useState([]);
    const [pastOrders, setPastOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setIsLoading(true);
        const res = await apiFunction(orderListApi, [], {}, "get", true);
        console.log("=====================================================", res.data);
        if (res && res?.data?.results) {
            const allOrders = res.data.results;
            const ongoing = allOrders.filter(o =>
                !['delivered', 'cancelled'].includes(o.status.toLowerCase())
            );
            const past = allOrders.filter(o =>
                ['delivered', 'cancelled'].includes(o.status.toLowerCase())
            );
            setOngoingOrders(ongoing);
            setPastOrders(past);
        }
        setIsLoading(false);
    };

    const getStatusStyles = (status) => {
        const s = status.toLowerCase();
        switch (s) {
            case 'placed':
            case 'farmer_assigned':
                return { color: '#F59E0B', bg: '#FEF3C7' }; // Processing/Yellow
            case 'sent_to_collection':
            case 'at_collection_center':
            case 'out_for_delivery':
                return { color: '#0EA5E9', bg: '#E0F2FE' }; // In Transit/Blue
            case 'delivered':
                return { color: '#10B981', bg: '#D1FAE5' }; // Delivered/Green
            case 'cancelled':
                return { color: '#EF4444', bg: '#FEE2E2' }; // Cancelled/Red
            default:
                return { color: '#64748B', bg: '#F1F5F9' };
        }
    };

    const renderOrderCard = (order) => {
        const isOngoing = activeTab === 'Ongoing';

        return (
            <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                    <View>
                        <Text style={styles.orderNumber}>ORDER ID: #{order.id}</Text>
                        <Text style={styles.orderDate}>{new Date(order.created_at).toLocaleDateString()} • {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusStyles(order.status).bg }]}>
                        <Text style={[styles.statusText, { color: getStatusStyles(order.status).color }]}>{order.status.replace(/_/g, ' ').toUpperCase()}</Text>
                    </View>
                </View>

                <View style={styles.orderBody}>
                    <View style={styles.itemsPreview}>
                        {order.items && order.items.slice(0, 2).map((item, index) => (
                            <View key={item.id} style={[styles.itemImageWrapper, { zIndex: 10 - index }]}>
                                <Image
                                    source={{
                                        uri: item.product_image
                                            ? (item.product_image.startsWith('http')
                                                ? item.product_image
                                                : `${BASE_URL}${item.product_image}`)
                                            : 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?q=80&w=800&auto=format&fit=crop'
                                    }}
                                    style={styles.itemImage}
                                />
                            </View>
                        ))}
                        {order.items && order.items.length > 2 && (
                            <View style={styles.moreItemsBadge}>
                                <Text style={styles.moreItemsText}>+{order.items.length - 2}</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.orderInfo}>
                        <Text style={styles.itemNames} numberOfLines={1}>
                            {order.items && order.items.length > 0
                                ? order.items[0]?.product_name
                                : 'FreshFarm Order'}
                            {order.items && order.items.length > 1 ? ` + ${order.items.length - 1} more` : ''}
                        </Text>
                        <Text style={styles.orderTotal}>₹{order.total_price}</Text>
                    </View>
                </View>

                <View style={styles.orderActions}>
                    {isOngoing ? (
                        <>
                            <TouchableOpacity
                                style={styles.trackButton}
                                onPress={() => onNavigateTrackOrder(order.id)}
                            >
                                <Text style={styles.trackButtonText}>Track Order</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.detailsButton}
                                onPress={() => onNavigateDetail(order.id)}
                            >
                                <Text style={styles.detailsButtonText}>Details</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity style={styles.reorderButton}>
                                <RefreshCcw size={16} color="#38BDF8" style={{ marginRight: 6 }} />
                                <Text style={styles.reorderButtonText}>Reorder</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.rateButton}>
                                <Star size={16} color="#64748B" style={{ marginRight: 6 }} />
                                <Text style={styles.rateButtonText}>Rate</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>My Orders</Text>
                    <TouchableOpacity style={styles.searchButton}>
                        <Search size={22} color="#1E293B" />
                    </TouchableOpacity>
                </View>

                {/* Custom Tab Switcher */}
                <View style={styles.tabContainer}>
                    <View style={styles.tabBackground}>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'Ongoing' && styles.activeTab]}
                            onPress={() => setActiveTab('Ongoing')}
                        >
                            <Text style={[styles.tabText, activeTab === 'Ongoing' && styles.activeTabText]}>Ongoing</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeTab === 'Past Orders' && styles.activeTab]}
                            onPress={() => setActiveTab('Past Orders')}
                        >
                            <Text style={[styles.tabText, activeTab === 'Past Orders' && styles.activeTabText]}>Past Orders</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 120 }}
                >
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#38BDF8" />
                        </View>
                    ) : activeTab === 'Ongoing' ? (
                        ongoingOrders.length > 0 ? (
                            ongoingOrders.map(order => renderOrderCard(order))
                        ) : (
                            <View style={styles.emptyContainer}>
                                <Package size={64} color="#CBD5E1" />
                                <Text style={styles.emptyText}>No ongoing orders</Text>
                            </View>
                        )
                    ) : (
                        <>
                            <Text style={styles.sectionHeading}>PAST ORDERS</Text>
                            {pastOrders.length > 0 ? (
                                pastOrders.map(order => renderOrderCard(order))
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <Package size={64} color="#CBD5E1" />
                                    <Text style={styles.emptyText}>No past orders</Text>
                                </View>
                            )}
                        </>
                    )}
                </ScrollView>
            </SafeAreaView>

            <BottomTabs
                activeTab="orders"
                onNavigateHome={onNavigateHome}
                onNavigateCategories={onNavigateCategories}
                onNavigateCheckout={onNavigateCheckout}
                onNavigateOrders={() => { }}
                onNavigateProfile={onNavigateProfile}
            />
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFFFFF',
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1E293B',
    },
    searchButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabContainer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    tabBackground: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        borderRadius: 15,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 12,
    },
    activeTab: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94A3B8',
    },
    activeTabText: {
        color: '#38BDF8',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionHeading: {
        fontSize: 12,
        fontWeight: '800',
        color: '#94A3B8',
        letterSpacing: 1,
        marginBottom: 15,
        marginTop: 5,
    },
    orderCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    orderNumber: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94A3B8',
        marginBottom: 4,
    },
    orderDate: {
        fontSize: 13,
        color: '#64748B',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
    },
    orderBody: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    itemsPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
    },
    itemImageWrapper: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        overflow: 'hidden',
        marginLeft: -15,
    },
    itemImage: {
        width: '100%',
        height: '100%',
    },
    moreItemsBadge: {
        width: 35,
        height: 35,
        borderRadius: 10,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        borderWidth: 1,
        borderColor: '#E0F2FE',
    },
    moreItemsText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#0EA5E9',
    },
    orderInfo: {
        flex: 1,
    },
    itemNames: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 4,
    },
    orderTotal: {
        fontSize: 18,
        fontWeight: '800',
        color: '#38BDF8',
    },
    orderActions: {
        flexDirection: 'row',
        gap: 12,
    },
    trackButton: {
        flex: 2,
        height: 48,
        backgroundColor: '#38BDF8',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#38BDF8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    trackButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    detailsButton: {
        flex: 1,
        height: 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    detailsButtonText: {
        color: '#1E293B',
        fontSize: 14,
        fontWeight: '600',
    },
    reorderButton: {
        flex: 2,
        height: 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#38BDF8',
        flexDirection: 'row',
    },
    reorderButtonText: {
        color: '#38BDF8',
        fontSize: 14,
        fontWeight: '700',
    },
    rateButton: {
        flex: 1,
        height: 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        flexDirection: 'row',
    },
    rateButtonText: {
        color: '#64748B',
        fontSize: 14,
        fontWeight: '600',
    },
    loadingContainer: {
        marginTop: 100,
        alignItems: 'center',
    },
    emptyContainer: {
        marginTop: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: '#94A3B8',
        fontWeight: '600',
    },
});

export default OrdersScreen;
