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
    Alert,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    MapPin,
    Clock,
    Sun,
    Moon,
    CreditCard,
    Wallet,
    Banknote,
    ArrowLeft,
    Plus,
    Trash2,
} from 'lucide-react-native';
import BottomTabs from '../../components/BottomTabs';
import { useDispatch, useSelector } from 'react-redux';
import { getCartItems } from '../../store/slices/authSlice';
import RazorpayCheckout from 'react-native-razorpay';

const { width } = Dimensions.get('window');
import { getProductApi, paymentCreateApi, listAddressesApi, orderCreateApi, paymentVerifyApi, orderCancelApi, RAZORPAY_KEY, BASE_URL, deleteCartItemApi } from '../../api/api';
import { apiFunction } from '../../api/apifunction';

const CheckoutScreen = ({ onBack, onPlaceOrder, onNavigateHome, onNavigateCategories, onNavigateOrders, onNavigateProfile, onNavigateAddresses }) => {
    const [selectedSlot, setSelectedSlot] = useState('morning');
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [allProducts, setAllProducts] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
    const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [createdOrderState, setCreatedOrderState] = useState(null);

    const { cartItems, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    const handleRemoveItem = (item) => {
        Alert.alert(
            'Remove Item',
            `Remove "${item.product_name}" from your cart?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        await apiFunction(deleteCartItemApi(item.id), [], {}, 'delete', true);
                        dispatch(getCartItems());
                    },
                },
            ]
        );
    };

    useEffect(() => {
        dispatch(getCartItems());
        fetchAllProducts();
        fetchAddresses();
    }, []);



    const fetchAddresses = async () => {
        setIsLoadingAddresses(true);
        const res = await apiFunction(listAddressesApi, [], {}, "get", true);
        console.log("Addresses response:", res?.data);
        if (res && res.data) {
            setAddresses(res.data);
            const primary = res.data.find(addr => addr.is_primary);
            if (primary) {
                setSelectedAddressId(primary.id);
                setSelectedAddress(primary);
            } else if (res.data.length > 0) {
                setSelectedAddressId(res.data[0].id);
                setSelectedAddress(res.data[0]);
            }
        }
        setIsLoadingAddresses(false);
    };


    const fetchAllProducts = async () => {
        const res = await apiFunction(getProductApi, [], {}, "get", false);
        if (res && res.data && res.data.results) {
            setAllProducts(res.data.results);
        }
    };
    console.log("cartItems", cartItems)

    // ════════════════════════════════
    // STEP 1 — Create Order
    // ════════════════════════════════
    const handleOrderCreate = async () => {
        if (!selectedAddressId) {
            Alert.alert("No Address", "Please select a delivery address.");
            return;
        }
        if (!cartItems || cartItems.length === 0) {
            Alert.alert("Empty Cart", "Please add items to cart.");
            return;
        }

        setIsPlacingOrder(true);

        const orderRes = await apiFunction(orderCreateApi, [], {
            address: selectedAddressId,
            order_type: paymentMethod === 'cod' ? 'cod' : 'pre_order',
        }, "post", true);

        console.log("STEP 1 - Order created:", orderRes?.data);

        if (orderRes?.status !== 201) {
            setIsPlacingOrder(false);
            Alert.alert("Error", orderRes?.data?.error || "Order creation failed.");
            return;
        }

        const createdOrder = orderRes.data.data; // {id, total_price, ...}
        console.log("Order ID:", createdOrder.id);
        setCreatedOrderState(createdOrder);

        // ── COD → skip payment ──
        if (paymentMethod === 'cod') {
            setIsPlacingOrder(false);
            dispatch(getCartItems());
            Alert.alert("Order Placed! 🎉", "Your order has been placed with Cash on Delivery.");
            if (onPlaceOrder) onPlaceOrder(createdOrder);
            return;
        }

        // ── Online → go to Razorpay ──
        await initiateRazorpay(createdOrder);
    };

    // ════════════════════════════════
    // STEP 2 — Initiate Payment
    // ════════════════════════════════
    const initiateRazorpay = async (order) => {
        const orderId = typeof order === 'object' ? order.id : order;
        const payRes = await apiFunction(paymentCreateApi, [], {
            order_id: orderId,
            method: paymentMethod,
        }, "post", true);

        console.log("STEP 2 - Payment initiated:", payRes?.data);

        if (!payRes?.data?.razorpay_order_id) {
            setIsPlacingOrder(false);
            Alert.alert("Error", "Payment initiation failed. Try again.");
            return;
        }

        const prefill = {};
        if (user?.phone) {
            prefill.contact = user.phone;
        } else if (user?.contact) {
            prefill.contact = user.contact;
        }
        if (user?.email) {
            prefill.email = user.email;
        }
        if (user?.username) {
            prefill.name = user.username;
        } else if (user?.name) {
            prefill.name = user.name;
        }

        const options = {
            description: 'FreshFarm Order Payment',
            currency: 'INR',
            key: payRes.data.key_id || RAZORPAY_KEY,
            amount: payRes.data.amount,            // in paise
            order_id: payRes.data.razorpay_order_id,
            name: 'FreshFarm',
            prefill: prefill,
            theme: { color: '#38BDF8' },
        };

        // ════════════════════════════════
        // STEP 3 — Open Razorpay
        // ════════════════════════════════
        RazorpayCheckout.open(options)
            .then(async (razorpayData) => {
                console.log("STEP 3 - Razorpay success:", razorpayData);
                // {razorpay_payment_id, razorpay_order_id, razorpay_signature}
                await verifyRazorpayPayment(razorpayData);
            })
            .catch(async (error) => {
                setIsPlacingOrder(false);
                console.log("Razorpay cancelled/failed:", error);

                // ── Cancel the order on backend so it doesn't stay as PLACED ──
                const orderIdToCancel = typeof order === 'object' ? order?.id : order;
                if (orderIdToCancel) {
                    try {
                        await apiFunction(orderCancelApi(orderIdToCancel), [], {}, 'post', true);
                        console.log('Order cancelled on backend:', orderIdToCancel);
                    } catch (e) {
                        console.log('Order cancel error:', e);
                    }
                    setCreatedOrderState(null);
                }

                const isCancelled =
                    error?.code === 0 ||
                    error?.description?.toLowerCase?.().includes('cancel');
                Alert.alert(
                    isCancelled ? 'Payment Cancelled' : 'Payment Failed',
                    isCancelled
                        ? 'Payment was cancelled. Your cart is intact — try again or choose Cash on Delivery.'
                        : 'Payment could not be completed. Please try again.',
                    [{ text: 'OK' }]
                );
            });
    };

    // ════════════════════════════════
    // STEP 4 — Verify Payment
    // ════════════════════════════════
    const verifyRazorpayPayment = async (razorpayData) => {
        const verifyRes = await apiFunction(paymentVerifyApi, [], {
            razorpay_order_id: razorpayData.razorpay_order_id,
            razorpay_payment_id: razorpayData.razorpay_payment_id,
            razorpay_signature: razorpayData.razorpay_signature,
        }, "post", true);

        setIsPlacingOrder(false);
        console.log("STEP 4 - Verify response:", verifyRes?.data);

        if (verifyRes?.data?.payment_status === 'paid') {
            // ✅ SUCCESS
            dispatch(getCartItems()); // cart clear
            Alert.alert(
                "Payment Successful! 🎉",
                "Your order has been placed successfully.",
                [{
                    text: "View Orders",
                    onPress: () => onPlaceOrder && onPlaceOrder(createdOrderState ? { ...createdOrderState, payment_status: 'paid' } : verifyRes.data)
                }]
            );
        } else {
            Alert.alert(
                "Verification Failed",
                "Payment could not be verified. Contact support with your payment ID."
            );
        }
    };

    const calculateSubtotal = () => {
        return cartItems?.reduce((total, item) => {
            const price = parseFloat(item.price) || 0;
            return total + (price * (item.quantity || 1));
        }, 0);
    };
    const subtotal = calculateSubtotal() || 0;
    const deliveryFee = subtotal > 0 ? 1.50 : 0;
    const total = subtotal + deliveryFee;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={onBack}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    >
                        <ArrowLeft size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Checkout</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Delivery Address */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Delivery Address</Text>
                        {isLoadingAddresses ? (
                            <ActivityIndicator color="#38BDF8" size="small" />
                        ) : selectedAddress ? (
                            <View style={styles.addressCard}>
                                <View style={styles.addressInfo}>
                                    <Text style={styles.addressLabel}>{selectedAddress.address_line}</Text>
                                    <Text style={styles.addressText}>
                                        {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                                    </Text>
                                    <TouchableOpacity
                                        style={styles.changeButton}
                                        onPress={() => setIsAddressModalVisible(true)}
                                    >
                                        <Text style={styles.changeButtonText}>Change</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.mapPinContainer}>
                                    <MapPin size={32} color="#38BDF8" />
                                </View>
                            </View>
                        ) : (
                            <TouchableOpacity style={styles.addAddressButton} onPress={onNavigateAddresses}>
                                <Plus size={20} color="#38BDF8" />
                                <Text style={styles.addAddressText}>Add Delivery Address</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Order Items */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Order Items</Text>
                        {cartItems && cartItems.length > 0 ? (
                            cartItems.map((item, index) => {
                                // const price = parseFloat(item.price) || 0;
                                // const subtotal = parseFloat(item.subtotal) || 0;
                                return (
                                    <View key={item.id || index} style={styles.itemCard}>
                                        <Image
                                            source={{
                                                uri: item.product_image
                                                    ? (item.product_image.startsWith('http')
                                                        ? item.product_image
                                                        : `${BASE_URL}${item.product_image}`)
                                                    : 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?q=80&w=800&auto=format&fit=crop'
                                            }}
                                            style={styles.itemCardImage}
                                        />
                                        <View style={styles.itemDetails}>
                                            <Text style={styles.itemName}>{item?.product_name || 'Unknown Product'}</Text>
                                            <Text style={styles.itemWeight}>{item?.unit || 'N/A'} x {item.quantity}</Text>
                                        </View>
                                        <Text style={styles.itemPrice}>₹{(item?.price || 0) * (item.quantity || 1)}</Text>
                                        <TouchableOpacity
                                            style={styles.removeButton}
                                            onPress={() => handleRemoveItem(item)}
                                        >
                                            <Trash2 size={18} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                );
                            })
                        ) : (
                            <View style={styles.emptyCartBox}>
                                <Text style={styles.emptyCartText}>Your cart is empty</Text>
                                <TouchableOpacity style={styles.shopNowInline} onPress={onNavigateHome}>
                                    <Text style={styles.shopNowInlineText}>Shop Now</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Delivery Slot */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Delivery Slot</Text>
                        <View style={styles.slotContainer}>
                            <TouchableOpacity
                                style={[styles.slotCard, selectedSlot === 'morning' && styles.selectedSlotCard]}
                                onPress={() => setSelectedSlot('morning')}
                            >
                                <Sun size={24} color={selectedSlot === 'morning' ? '#38BDF8' : '#94A3B8'} />
                                <Text style={[styles.slotName, selectedSlot === 'morning' && styles.selectedSlotText]}>Morning</Text>
                                <Text style={styles.slotTime}>8:00 AM - 11:00 AM</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.slotCard, selectedSlot === 'evening' && styles.selectedSlotCard]}
                                onPress={() => setSelectedSlot('evening')}
                            >
                                <Moon size={24} color={selectedSlot === 'evening' ? '#38BDF8' : '#94A3B8'} />
                                <Text style={[styles.slotName, selectedSlot === 'evening' && styles.selectedSlotText]}>Evening</Text>
                                <Text style={styles.slotTime}>5:00 PM - 8:00 PM</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Payment Method */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Payment Method</Text>
                        <View style={styles.paymentContainer}>
                            <TouchableOpacity
                                style={styles.paymentOption}
                                onPress={() => setPaymentMethod('upi')}
                            >
                                <View style={[styles.radioButton, paymentMethod === 'upi' && styles.radioButtonSelected]}>
                                    {paymentMethod === 'upi' && <View style={styles.radioButtonInner} />}
                                </View>
                                <View style={styles.paymentIconBg}>
                                    <Wallet size={20} color="#1E293B" />
                                </View>
                                <Text style={styles.paymentName}>UPI (GPay/PhonePe)</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.paymentOption}
                                onPress={() => setPaymentMethod('card')}
                            >
                                <View style={[styles.radioButton, paymentMethod === 'card' && styles.radioButtonSelected]}>
                                    {paymentMethod === 'card' && <View style={styles.radioButtonInner} />}
                                </View>
                                <View style={styles.paymentIconBg}>
                                    <CreditCard size={20} color="#1E293B" />
                                </View>
                                <Text style={styles.paymentName}>Credit/Debit Card</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.paymentOption}
                                onPress={() => setPaymentMethod('cod')}
                            >
                                <View style={[styles.radioButton, paymentMethod === 'cod' && styles.radioButtonSelected]}>
                                    {paymentMethod === 'cod' && <View style={styles.radioButtonInner} />}
                                </View>
                                <View style={styles.paymentIconBg}>
                                    <Banknote size={20} color="#1E293B" />
                                </View>
                                <Text style={styles.paymentName}>Cash on Delivery</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Order Summary Card */}
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Subtotal</Text>
                            <Text style={styles.summaryValue}>₹{subtotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Delivery Fee</Text>
                            <Text style={styles.summaryValue}>₹{deliveryFee.toFixed(2)}</Text>
                        </View>
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total</Text>
                            <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
                        </View>

                        <TouchableOpacity style={styles.placeOrderButton} onPress={handleOrderCreate}>
                            <Text style={styles.placeOrderButtonText}>Place Order</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 120 }} />
                </ScrollView>
            </SafeAreaView>

            <BottomTabs
                activeTab="checkout"
                onNavigateHome={onNavigateHome}
                onNavigateCategories={onNavigateCategories}
                onNavigateCheckout={() => { }}
                onNavigateOrders={onNavigateOrders}
                onNavigateProfile={onNavigateProfile}
            />

            {/* Address Selection Modal */}
            <Modal
                visible={isAddressModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsAddressModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select Address</Text>
                            <TouchableOpacity onPress={() => setIsAddressModalVisible(false)}>
                                <Text style={styles.closeText}>Close</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.addressList}>
                            {addresses.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.addressOption,
                                        selectedAddress?.id === item.id && styles.selectedAddressOption
                                    ]}
                                    onPress={() => {
                                        setSelectedAddress(item);
                                        setSelectedAddressId(item.id);
                                        setIsAddressModalVisible(false);
                                    }}
                                >
                                    <View style={styles.addressOptionInfo}>
                                        <Text style={styles.addressOptionLabel}>{item.address_line}</Text>
                                        <Text style={styles.addressOptionText}>
                                            {item.city}, {item.state} - {item.pincode}
                                        </Text>
                                    </View>
                                    {selectedAddress?.id === item.id && (
                                        <View style={styles.checkIcon}>
                                            <View style={styles.checkIconInner} />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style={styles.modalAddButton}
                            onPress={() => {
                                setIsAddressModalVisible(false);
                                onNavigateAddresses();
                            }}
                        >
                            <Plus size={20} color="#FFFFFF" />
                            <Text style={styles.modalAddButtonText}>Add New Address</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        paddingVertical: 15,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
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
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 15,
    },
    addressCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    addressInfo: {
        flex: 1,
        marginRight: 15,
    },
    addressLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 8,
    },
    addressText: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 18,
        marginBottom: 12,
    },
    changeButton: {
        backgroundColor: '#F0F9FF',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    changeButtonText: {
        color: '#38BDF8',
        fontSize: 13,
        fontWeight: '700',
    },
    mapImage: {
        width: 100,
        height: 100,
        borderRadius: 15,
    },
    itemCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
        elevation: 1,
    },
    itemCardImage: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
    },
    itemDetails: {
        flex: 1,
        marginLeft: 15,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    itemWeight: {
        fontSize: 13,
        color: '#94A3B8',
        fontWeight: '500',
    },
    itemPrice: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1E293B',
        marginRight: 8,
    },
    removeButton: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: '#FEF2F2',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 6,
    },
    slotContainer: {
        flexDirection: 'row',
        gap: 15,
    },
    slotCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 15,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
    },
    selectedSlotCard: {
        borderColor: '#38BDF8',
        backgroundColor: '#F0F9FF',
    },
    slotName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#64748B',
        marginTop: 10,
        marginBottom: 4,
    },
    selectedSlotText: {
        color: '#38BDF8',
    },
    slotTime: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '500',
    },
    paymentContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        paddingVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    radioButton: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    radioButtonSelected: {
        borderColor: '#38BDF8',
    },
    radioButtonInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#38BDF8',
    },
    paymentIconBg: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    paymentName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1E293B',
    },
    summaryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 15,
        elevation: 5,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    totalRow: {
        marginTop: 10,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        marginBottom: 20,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: 14,
        color: '#1E293B',
        fontWeight: '700',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
    },
    totalValue: {
        fontSize: 18,
        fontWeight: '800',
        color: '#38BDF8',
    },
    placeOrderButton: {
        backgroundColor: '#38BDF8',
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#38BDF8',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 4,
    },
    placeOrderButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
    },
    emptyCartBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        borderStyle: 'dashed',
    },
    emptyCartText: {
        fontSize: 16,
        color: '#64748B',
        fontWeight: '600',
        marginBottom: 10,
    },
    shopNowInline: {
        backgroundColor: '#F0F9FF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
    },
    shopNowInlineText: {
        color: '#38BDF8',
        fontWeight: '700',
    },
    mapPinContainer: {
        width: 60,
        height: 60,
        borderRadius: 15,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addAddressButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 25,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 10,
        borderWidth: 2,
        borderColor: '#F1F5F9',
        borderStyle: 'dashed',
    },
    addAddressText: {
        fontSize: 16,
        color: '#38BDF8',
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 25,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
    },
    closeText: {
        color: '#64748B',
        fontWeight: '600',
    },
    addressList: {
        marginBottom: 20,
    },
    addressOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        marginBottom: 12,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    selectedAddressOption: {
        borderColor: '#38BDF8',
        backgroundColor: '#F0F9FF',
    },
    addressOptionInfo: {
        flex: 1,
    },
    addressOptionLabel: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    addressOptionText: {
        fontSize: 13,
        color: '#64748B',
    },
    checkIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#38BDF8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkIconInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#38BDF8',
    },
    modalAddButton: {
        backgroundColor: '#38BDF8',
        height: 55,
        borderRadius: 18,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    modalAddButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default CheckoutScreen;
