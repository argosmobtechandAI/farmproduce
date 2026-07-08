import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
    Dimensions,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin, Package, Clock, CreditCard, ChevronRight } from 'lucide-react-native';
import { orderDetailApi, BASE_URL } from '../../api/api';
import { apiFunction } from '../../api/apifunction';

const { width } = Dimensions.get('window');

const OrderDetailScreen = ({ orderId, onBack }) => {
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (orderId) {
            fetchOrderDetail();
        }
    }, [orderId]);
    console.log("orderId", orderId)
    const fetchOrderDetail = async () => {
        setIsLoading(true);
        const res = await apiFunction(orderDetailApi(orderId), [], {}, "get", true);
        console.log("response", res)
        if (res && res.data) {
            setOrder(res.data);
        }
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#38BDF8" />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Order details not found.</Text>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onBack} style={styles.iconButton}>
                        <ArrowLeft size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Order Details</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Order ID & Status */}
                    <View style={styles.section}>
                        <View style={styles.rowBetween}>
                            <Text style={styles.orderIdText}>Order ID: #{order.id}</Text>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>{order.status.replace(/_/g, ' ').toUpperCase()}</Text>
                            </View>
                        </View>
                        <Text style={styles.dateText}>
                            Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>

                    {/* Delivery Address */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MapPin size={20} color="#38BDF8" />
                            <Text style={styles.sectionTitle}>Delivery Address</Text>
                        </View>
                        <View style={styles.addressCard}>
                            <Text style={styles.addressName}>Home</Text>
                            {order.address_details ? (
                                <>
                                    <Text style={styles.addressText}>{order.address_details.address_line}</Text>
                                    <Text style={styles.addressText}>
                                        {order.address_details.city_name}, {order.address_details.state_name} - {order.address_details.pincode}
                                    </Text>
                                </>
                            ) : (
                                <Text style={styles.addressText}>Address ID: {order.address}</Text>
                            )}
                            <Text style={styles.addressText}>Collection Center: {order.collection_center || 'Direct Delivery'}</Text>
                        </View>
                    </View>

                    {/* Items List */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Package size={20} color="#38BDF8" />
                            <Text style={styles.sectionTitle}>Items Ordered</Text>
                        </View>
                        {order.items && order.items.map((item) => (
                            <View key={item.id} style={styles.itemRow}>
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
                                <View style={styles.itemInfo}>
                                    <Text style={styles.itemName}>{item.product_name}</Text>
                                    <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                                </View>
                                <Text style={styles.itemPrice}>₹{item.price}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Payment Info */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <CreditCard size={20} color="#38BDF8" />
                            <Text style={styles.sectionTitle}>Payment Summary</Text>
                        </View>
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Method</Text>
                            <Text style={styles.paymentValue}>{order.order_type.toUpperCase()}</Text>
                        </View>
                        <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Status</Text>
                            <Text style={[styles.paymentValue, { color: order.payment_status === 'paid' ? '#10B981' : '#F59E0B' }]}>
                                {order.payment_status.toUpperCase()}
                            </Text>
                        </View>
                        <View style={[styles.paymentRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total Amount</Text>
                            <Text style={styles.totalValue}>₹{order.total_price}</Text>
                        </View>
                    </View>

                    <View style={{ height: 40 }} />
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
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFFFFF',
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
    },
    scrollContent: {
        padding: 20,
    },
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderIdText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
    },
    statusBadge: {
        backgroundColor: '#E0F2FE',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#38BDF8',
    },
    dateText: {
        fontSize: 13,
        color: '#64748B',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
        marginLeft: 10,
    },
    addressCard: {
        paddingLeft: 30,
    },
    addressName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 13,
        color: '#64748B',
        marginBottom: 2,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 10,
    },
    itemInfo: {
        flex: 1,
        marginLeft: 12,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
    itemQty: {
        fontSize: 12,
        color: '#94A3B8',
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
    },
    paymentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    paymentLabel: {
        fontSize: 13,
        color: '#64748B',
    },
    paymentValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1E293B',
    },
    totalRow: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    totalLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#38BDF8',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#EF4444',
        marginBottom: 20,
    },
    backButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#38BDF8',
        borderRadius: 10,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
    }
});

export default OrderDetailScreen;
