import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Image,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    ActivityIndicator,
    Alert
} from 'react-native';
import {
    Search,
    SlidersHorizontal,
    Bell,
    MapPin,
    ChevronDown,
    Heart,
    Plus,
    ShoppingBasket
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import BottomTabs from '../components/BottomTabs';
import { getProductDetailApi, getProductApi, listAddressesApi, addProductApi, BASE_URL } from '../api/api';
import { apiFunction } from '../api/apifunction';
import { getCartItems } from '../store/slices/authSlice';
import { fallbackCategories, getMappedProducts } from '../utils/fallbackData';


const { width } = Dimensions.get('window');

// Categories can stay as is for now or be fetched similarly.
// const Categories = [
//     { id: 1, name: 'Fruits', icon: '🍊', color: '#FFF7ED' },
//     { id: 2, name: 'Vegetables', icon: '🌿', color: '#F0FDF4' },
//     { id: 3, name: 'Grains', icon: '🌾', color: '#FEFCE8' },
//     { id: 4, name: 'Dairy', icon: '💧', color: '#EFF6FF' },
// ];


const HomeScreen = ({ selectedCategoryId, setSelectedCategoryId, onNavigateCategories, onNavigateProduct, onNavigateCheckout, onNavigateOrders, onNavigateProfile, onNavigateAddresses }) => {
    const { user } = useSelector((state) => state.auth);

    const [popularProducts, setPopularProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentAddress, setCurrentAddress] = useState('Locating...');
    const cartItems = useSelector(state => state.auth.cartItems)
    const [searchQuery, setSearchQuery] = useState('');
    const dispatch = useDispatch()
    useEffect(() => {
        fetchProducts(searchQuery, selectedCategoryId);
        fetchCategories();
        fetchAddress();
        dispatch(getCartItems())
    }, [selectedCategoryId]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProducts(searchQuery, selectedCategoryId);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchAddress = async () => {
        try {
            const response = await apiFunction(listAddressesApi, [], {}, "get", true);
            if (response && response?.data && response.data.length > 0) {
                const addr = response.data[0];
                let display = '';
                if (addr.city && addr.state) {
                    display = `${addr.city}, ${addr.state}`;
                } else if (addr.city) {
                    display = addr.city;
                } else {
                    display = addr.address_line;
                }
                setCurrentAddress(display || 'Add Location');
            } else {
                setCurrentAddress('Add Location');
            }
        } catch (error) {
            console.log("Error fetching address:", error);
            setCurrentAddress('Add Location');
        }
    };

    const fetchCategories = async () => {
        const response = await apiFunction(getProductApi, [], {}, "get", false);
        if (response && (response?.data?.data || response?.data?.results)) {
            setCategories(response?.data?.data || response?.data?.results);
        } else {
            setCategories(fallbackCategories);
        }
    };

    const fetchProducts = async (search = '', categoryId = null) => {
        setLoading(true);
        let url = getProductDetailApi;
        const params = [];
        if (search) {
            params.push(`search=${search}`);
        }
        if (categoryId) {
            params.push(`category=${categoryId}`);
        }
        if (params.length > 0) {
            url = `${getProductDetailApi}?${params.join('&')}`;
        }
        const response = await apiFunction(url, [], {}, "get", false);
        console.log(response, "res from products")
        if (response && response?.data?.results && response.data.results.length > 0) {
            setPopularProducts(response?.data?.results);
        } else {
            let localProducts = getMappedProducts();
            if (search) {
                const query = search.toLowerCase();
                localProducts = localProducts.filter(p => 
                    p.name.toLowerCase().includes(query) || 
                    p.brand.toLowerCase().includes(query) ||
                    p.category.name.toLowerCase().includes(query)
                );
            }
            if (categoryId) {
                localProducts = localProducts.filter(p => p.category.id === categoryId);
            }
            setPopularProducts(localProducts);
        }
        setLoading(false);
    };

    const handleAddToCartDirect = async (product) => {
        // Only grocery products can be added to cart
        if (product.category?.category_type !== 'grocery') {
            Alert.alert(
                "Vegetables & Fruits",
                "Fresh vegetables are ordered directly. Tap the product to view details and place a fresh order."
            );
            return;
        }

        // Block fallback/demo products — they don't have real variant IDs in the database yet
        if (product.isFallback) {
            Alert.alert(
                "Product Not Available",
                "This product is not yet listed in the store. Please ask the admin to add it via Django admin panel."
            );
            return;
        }

        const variant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
        if (!variant) {
            Alert.alert("Error", "Product variants not available");
            return;
        }

        const data = {
            variant: variant.id,
            quantity: 1
        };

        const res = await apiFunction(addProductApi, [], data, "post", true);
        if (res) {
            dispatch(getCartItems());
            if (res.status === 201) {
                Alert.alert("Success", `${product.name} added to cart!`);
            } else if (res.data && res.data.non_field_errors) {
                Alert.alert("Error", res.data.non_field_errors[0]);
            } else {
                Alert.alert("Success", `${product.name} added to cart!`);
            }
        } else {
            Alert.alert("Error", "Could not add product to cart");
        }
    };

    // Extract first name for a friendlier greeting

    const getFirstName = () => {
        if (!user) return 'User';
        const name = user.full_name || user.username || 'User';
        return name.split(' ')[0];
    };


    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
            <SafeAreaView style={styles.safeArea}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={{ flex: 1, paddingRight: 15 }}>
                            <TouchableOpacity style={styles.locationSelector} onPress={onNavigateAddresses}>
                                <MapPin size={16} color="#38BDF8" fill="#38BDF8" />
                                <Text style={styles.locationText} numberOfLines={1}>{currentAddress}</Text>
                                <ChevronDown size={14} color="#64748B" />
                            </TouchableOpacity>
                            <Text style={styles.greetingHeader}>Good Morning,</Text>
                            <Text style={styles.userName} numberOfLines={1}>{getFirstName()}</Text>
                        </View>
                        <View style={styles.headerRight}>
                            <TouchableOpacity
                                style={styles.notificationButton}
                                onPress={onNavigateCheckout}
                            >
                                <ShoppingBasket size={24} color="#1E293B" />
                                {cartItems?.length > 0 && (
                                    <View style={styles.cartBadge}>
                                        <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.notificationButton, { marginLeft: 12 }]}>
                                <Bell size={24} color="#1E293B" />
                                <View style={styles.notificationDot} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <View style={styles.searchInputWrapper}>
                            <Search size={20} color="#94A3B8" />
                            <TextInput
                                placeholder="Search fresh produce..."
                                style={styles.searchInput}
                                placeholderTextColor="#94A3B8"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                            <TouchableOpacity style={styles.filterButton}>
                                <SlidersHorizontal size={20} color="#38BDF8" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Banner */}
                    <View style={styles.bannerContainer}>
                        <View style={styles.bannerBackground}>
                            <Image
                                source={{ uri: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=800&auto=format&fit=crop' }}
                                style={styles.bannerImage}
                            />
                            <View style={styles.bannerOverlay}>
                                <View style={styles.offerTag}>
                                    <Text style={styles.offerTagText}>SEASONAL OFFER</Text>
                                </View>
                                <Text style={styles.bannerTitle}>Organic Summer{'\n'}Fruits</Text>
                                <Text style={styles.bannerSubtitle}>Up to 30% OFF</Text>
                                <TouchableOpacity style={styles.shopNowButton}>
                                    <Text style={styles.shopNowText}>Shop Now</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    {/* Categories Section */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Categories</Text>
                        <TouchableOpacity onPress={onNavigateCategories}>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesScrollContainer}
                        style={styles.categoriesContainer}
                    >
                        {categories.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={styles.categoryCard}
                                onPress={() => setSelectedCategoryId(category.id)}
                            >
                                <View style={[styles.categoryIconContainer, { backgroundColor: '#F0FDF4' }]}>
                                    <Image
                                        source={{ uri: category.image.startsWith('http') ? category.image : `${BASE_URL}${category.image}` }}
                                        style={styles.categoryImage}
                                        resizeMode="contain"
                                    />
                                </View>
                                <Text style={styles.categoryName} numberOfLines={1}>{category.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Popular Products Header */}
                    <View style={styles.sectionHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <Text style={styles.sectionTitle}>
                                {selectedCategoryId ? 'Filtered Products' : 'Popular Products'}
                            </Text>
                            {selectedCategoryId && (
                                <TouchableOpacity
                                    style={styles.filterBadge}
                                    onPress={() => setSelectedCategoryId(null)}
                                >
                                    <Text style={styles.filterBadgeText}>
                                        {categories.find(c => c.id === selectedCategoryId)?.name || 'Category'} ✕
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        {selectedCategoryId && (
                            <TouchableOpacity onPress={() => setSelectedCategoryId(null)}>
                                <Text style={styles.seeAllText}>Clear Filter</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Products Grid */}
                    <View style={styles.productsGrid}>
                        {loading ? (
                            <View style={{ width: '100%', padding: 20, alignItems: 'center' }}>
                                <ActivityIndicator size="large" color="#38BDF8" />
                            </View>
                        ) : (
                            popularProducts.map((product) => {
                                const variant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
                                const discountPercent = 15;
                                const currentPrice = variant ? parseFloat(variant.price) : 0;
                                const originalPrice = currentPrice / (1 - (discountPercent / 100));

                                return (
                                    <View key={product.id} style={styles.productCard}>
                                        <TouchableOpacity
                                            onPress={() => onNavigateProduct(product.id)}
                                            style={styles.cardClickableArea}
                                            activeOpacity={0.85}
                                        >
                                            <View style={styles.productImageContainer}>
                                                <Image
                                                    source={{
                                                        uri: product.image 
                                                            ? (product.image.startsWith('http') ? product.image : `${BASE_URL}${product.image}`)
                                                            : (product.category?.image?.startsWith('http') ? product.category.image : `${BASE_URL}${product.category?.image}`)
                                                    }}
                                                    style={styles.productImage}
                                                    onError={(e) => console.log('Image load failed:', e.nativeEvent.error)}
                                                    defaultSource={{ uri: 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?w=400&fit=crop' }}
                                                />
                                                <View style={styles.discountBadge}>
                                                    <Text style={styles.discountBadgeText}>{discountPercent}% OFF</Text>
                                                </View>
                                                <TouchableOpacity style={styles.wishlistButton} activeOpacity={0.7}>
                                                    <Heart size={14} color="#94A3B8" />
                                                </TouchableOpacity>
                                            </View>

                                            <View style={styles.productInfo}>
                                                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                                                <View style={styles.deliveryTimeContainer}>
                                                    <Text style={styles.productFarm} numberOfLines={1}>
                                                        {product.category?.category_type === 'grocery' ? '⚡ 10-15 mins' : '🌱 Same Day'}
                                                    </Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>

                                        <View style={styles.productFooter}>
                                            <View style={styles.priceContainer}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                    <Text style={styles.productPrice}>₹{currentPrice.toFixed(0)}</Text>
                                                    <Text style={styles.productOriginalPrice}>₹{originalPrice.toFixed(0)}</Text>
                                                </View>
                                                <Text style={styles.priceUnit}>{variant ? variant.unit : 'unit'}</Text>
                                            </View>

                                            {product.category?.category_type === 'grocery' ? (
                                                <TouchableOpacity
                                                    style={styles.addButton}
                                                    onPress={() => handleAddToCartDirect(product)}
                                                    activeOpacity={0.8}
                                                >
                                                    <Text style={styles.addButtonText}>ADD</Text>
                                                    <Plus size={12} color="#10B981" strokeWidth={3} />
                                                </TouchableOpacity>
                                            ) : (
                                                <TouchableOpacity
                                                    style={styles.vegetableButton}
                                                    onPress={() => onNavigateProduct(product.id)}
                                                    activeOpacity={0.8}
                                                >
                                                    <Text style={styles.vegetableButtonText}>🌱 View</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </View>


                    {/* Extra space for bottom tab */}
                    <View style={{ height: 100 }} />
                </ScrollView>
            </SafeAreaView>

            <BottomTabs
                activeTab="home"
                onNavigateHome={() => { }}
                onNavigateCategories={onNavigateCategories}
                onNavigateCheckout={onNavigateCheckout}
                onNavigateOrders={onNavigateOrders}
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
        paddingTop: 10,
        marginBottom: 20,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 4,
    },
    locationText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    greetingHeader: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E293B',
    },
    userName: {
        fontSize: 24,
        fontWeight: '800',
        color: '#1E293B',
    },
    notificationButton: {
        width: 44,
        height: 44,
        backgroundColor: '#FFFFFF',
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    notificationDot: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        backgroundColor: '#F87171',
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: '#FFFFFF',
    },
    cartBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#38BDF8',
        borderRadius: 10,
        width: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    cartBadgeText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '900',
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        paddingHorizontal: 15,
        height: 55,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 15,
        color: '#1E293B',
    },
    filterButton: {
        padding: 5,
    },
    bannerContainer: {
        paddingHorizontal: 20,
        marginBottom: 30,
    },
    bannerBackground: {
        height: 180,
        borderRadius: 25,
        overflow: 'hidden',
        backgroundColor: '#1E293B',
    },
    bannerImage: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.7,
    },
    bannerOverlay: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    offerTag: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    offerTagText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#38BDF8',
    },
    bannerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
        lineHeight: 28,
        marginBottom: 5,
    },
    bannerSubtitle: {
        fontSize: 16,
        color: '#E2E8F0',
        marginBottom: 15,
    },
    shopNowButton: {
        backgroundColor: '#38BDF8',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    shopNowText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    seeAllText: {
        color: '#38BDF8',
        fontWeight: '600',
        fontSize: 14,
    },
    categoriesContainer: {
        marginBottom: 30,
    },
    categoriesScrollContainer: {
        paddingHorizontal: 15,
        gap: 12,
    },
    categoryCard: {
        alignItems: 'center',
        width: 80,
    },
    categoryIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        overflow: 'hidden',
        padding: 12,
    },
    categoryImage: {
        width: '100%',
        height: '100%',
    },
    categoryIcon: {
        fontSize: 24,
    },
    categoryName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#64748B',
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 12,
        justifyContent: 'space-between',
    },
    productCard: {
        width: (width - 36) / 2,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        padding: 8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 1,
        justifyContent: 'space-between',
    },
    cardClickableArea: {
        width: '100%',
    },
    productImageContainer: {
        width: '100%',
        height: 120,
        backgroundColor: '#F8FAFC',
        borderRadius: 12,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    productImage: {
        width: '85%',
        height: '85%',
        resizeMode: 'contain',
    },
    discountBadge: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        backgroundColor: '#10B981', // green discount badge for blinkit/swiggy style
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderTopRightRadius: 8,
        borderBottomLeftRadius: 12,
    },
    discountBadgeText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontWeight: '800',
    },
    wishlistButton: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 24,
        height: 24,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    productInfo: {
        marginTop: 8,
        paddingHorizontal: 2,
    },
    productName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1E293B',
        lineHeight: 17,
        height: 34, // Exactly 2 lines height
    },
    deliveryTimeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 4,
    },
    productFarm: {
        fontSize: 11,
        fontWeight: '500',
        color: '#64748B',
    },
    productFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 8,
        paddingHorizontal: 2,
    },
    priceContainer: {
        flex: 1,
    },
    productPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
    },
    productOriginalPrice: {
        fontSize: 11,
        color: '#94A3B8',
        textDecorationLine: 'line-through',
    },
    priceUnit: {
        fontSize: 11,
        color: '#64748B',
        marginTop: 2,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#10B981',
        borderRadius: 6,
        width: 64,
        height: 28,
        gap: 3,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    addButtonText: {
        color: '#10B981',
        fontSize: 11,
        fontWeight: '700',
    },
    vegetableButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F0FDF4',
        borderWidth: 1,
        borderColor: '#86EFAC',
        borderRadius: 6,
        width: 64,
        height: 28,
        gap: 2,
    },
    vegetableButtonText: {
        color: '#16A34A',
        fontSize: 10,
        fontWeight: '700',
    },
    filterBadge: {
        backgroundColor: '#F0F9FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#38BDF8',
    },
    filterBadgeText: {
        color: '#38BDF8',
        fontSize: 12,
        fontWeight: '700',
    },
});

export default HomeScreen;
