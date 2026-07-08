import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    StatusBar,
    SafeAreaView,
    Platform,
    Alert,
} from 'react-native';
import {
    ChevronLeft,
    Share2,
    Heart,
    Star,
    Leaf,
    Clock,
    Minus,
    Plus,
    ShoppingBasket,
    MapPin,
    ArrowLeft
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');
import { addProductApi, getProductDetailApi, getProductVarients, BASE_URL } from "../../api/api"
import { apiFunction } from '../../api/apifunction';
import { getMappedProducts } from '../../utils/fallbackData';
import { ActivityIndicator } from 'react-native';
import { addproduct, getCartItems } from '../../store/slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';

const ProductDetailScreen = ({ onBack, onAddToCart, onNavigateCheckout, productId }) => {
    const [selectedVariant, setSelectedVariant] = useState(1);
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imageSource, setImageSource] = useState(null);

    const { cartItems } = useSelector((state) => state.auth);
    const dispatch = useDispatch();


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setImageSource(null);
            const res = await apiFunction(getProductDetailApi, [productId], {}, "get", true);

            if (res?.data) {
                setIsFavorite([res?.data]);
                const firstProduct = res?.data;
                if (firstProduct?.variants?.length > 0) {
                    setSelectedVariant(firstProduct.variants[0].id);
                }

                // Set initial image source
                if (firstProduct?.image) {
                    setImageSource({
                        uri: firstProduct.image.startsWith('http')
                            ? firstProduct.image
                            : `${BASE_URL}${firstProduct.image}`
                    });
                } else if (firstProduct?.category?.image) {
                    setImageSource({
                        uri: firstProduct.category.image.startsWith('http')
                            ? firstProduct.category.image
                            : `${BASE_URL}${firstProduct.category.image}`
                    });
                } else {
                    setImageSource({ uri: 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?q=80&w=800&auto=format&fit=crop' });
                }
            } else {
                const localProducts = getMappedProducts();
                const matchedProduct = localProducts.find(p => p.id === productId);
                if (matchedProduct) {
                    setIsFavorite([matchedProduct]);
                    if (matchedProduct.variants && matchedProduct.variants.length > 0) {
                        setSelectedVariant(matchedProduct.variants[0].id);
                    }
                    if (matchedProduct.image) {
                        setImageSource({
                            uri: matchedProduct.image.startsWith('http')
                                ? matchedProduct.image
                                : `${BASE_URL}${matchedProduct.image}`
                        });
                    } else {
                        setImageSource({ uri: 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?q=80&w=800&auto=format&fit=crop' });
                    }
                }
            }
            setLoading(false);
        };
        fetchData();
    }, [productId]);

    console.log("isFavorite", isFavorite, selectedVariant)

    const handleImageError = () => {
        const product = isFavorite[0];
        if (product) {
            const currentUri = imageSource?.uri;
            const productUri = product.image
                ? (product.image.startsWith('http') ? product.image : `${BASE_URL}${product.image}`)
                : null;
            const categoryUri = product.category?.image
                ? (product.category.image.startsWith('http') ? product.category.image : `${BASE_URL}${product.category.image}`)
                : null;

            if (currentUri === productUri && categoryUri) {
                // If product image failed and category image exists, try category image
                setImageSource({ uri: categoryUri });
            } else {
                // Otherwise fall back to the default placeholder
                setImageSource({ uri: 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?q=80&w=800&auto=format&fit=crop' });
            }
        }
    };

    const handleAddToCart = async () => {
        if (quantity === 0) {
            Alert.alert("Quantity", "Please add quantity");
            return;
        }
        
        const product = isFavorite[0];

        // Block vegetable products from being added to cart
        if (product?.category?.category_type !== 'grocery') {
            Alert.alert(
                "Fresh Vegetables",
                "Vegetables & Fruits are ordered fresh directly. This product cannot be added to the grocery cart."
            );
            return;
        }

        // Block fallback/demo products — they don't have real variant IDs in the database yet
        if (product?.isFallback) {
            Alert.alert(
                "Product Not Available",
                "This product is not yet in the store. Admin needs to add it via Django admin panel at:\nhttp://187.127.149.81/admin/"
            );
            return;
        }

        const currentVariant = product?.variants?.find(v => v.id === selectedVariant) || (product?.variants && product?.variants[0]);
        
        if (!currentVariant || !currentVariant.price || parseFloat(currentVariant.price) <= 0) {
            Alert.alert("Error", "Price not set by admin");
            return;
        }

        const data = {
            variant: selectedVariant,
            quantity: quantity
        };

        const res = await apiFunction(addProductApi, [], data, "post", true);
        if (res) {
            dispatch(getCartItems());
        }
        if (res && res.status == 201) {
            Alert.alert("Success", "Product added to cart");
        } else if (res && res.data && res.data.non_field_errors) {
            Alert.alert("Error", res.data.non_field_errors[0]);
        } else {
            Alert.alert("Error", "Product not added to cart");
        }

        console.log("Cart response:", res);
    };

    return (
        <View style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Product Image Header */}
                <View style={styles.imageHeader}>
                    <Image
                        source={imageSource || { uri: 'https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?q=80&w=800&auto=format&fit=crop' }}
                        style={styles.productImage}
                        onError={handleImageError}
                    />

                    {/* Toolbar Overlay */}
                    <SafeAreaView style={styles.toolbar}>
                        <TouchableOpacity style={styles.iconButton} onPress={onBack}>
                            <ArrowLeft size={22} color="#1E293B" />
                        </TouchableOpacity>

                        <View style={styles.toolbarRight}>
                            <TouchableOpacity style={styles.iconButton}>
                                <Share2 size={20} color="#1E293B" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.iconButton, { marginLeft: 12 }]}
                                onPress={onNavigateCheckout}
                            >
                                <ShoppingBasket size={22} color="#1E293B" />
                                {cartItems?.length > 0 && (
                                    <View style={styles.cartBadge}>
                                        <Text style={styles.cartBadgeText}>{cartItems.length}</Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>

                {/* Content Card */}
                <View style={styles.contentCard}>
                    <View style={styles.pullContainer}>
                        <View style={styles.pullBar} />
                    </View>

                    {loading ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#38BDF8" />
                        </View>
                    ) : (
                        isFavorite?.map((item) => {
                            const variant = item?.variants && item?.variants?.length > 0 ? item?.variants[0] : null;
                            const subtotal = variant ? (variant.price * quantity) : 0;

                            return (
                                <View key={item.id} style={{ marginBottom: 25 }}>
                                    <View style={styles.headerInfo}>
                                        <View style={styles.tagRow}>
                                            <View style={styles.organicTag}>
                                                <Text style={styles.organicTagText}>ORGANIC</Text>
                                            </View>
                                            <View style={styles.ratingContainer}>
                                                <Star size={16} color="#FBBF24" fill="#FBBF24" />
                                                <Text style={styles.ratingText}>4.9 <Text style={styles.reviewCount}>(124 reviews)</Text></Text>
                                            </View>
                                        </View>

                                        <Text style={styles.productName}>{item.name}</Text>
                                        <Text style={styles.productPrice}>
                                            ₹{variant ? variant.price : '0.00'}<Text style={styles.priceUnit}> / {variant ? variant.unit : 'unit'}</Text>
                                        </Text>
                                        <Text style={styles.subtotalText}>
                                            Subtotal: ₹{subtotal.toFixed(2)}
                                        </Text>
                                    </View>

                                    {/* Weight Selection */}
                                    {/* <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>SELECT WEIGHT</Text>
                                        <View style={styles.weightRow}>
                                            {isFavorite.map((v) => (
                                                <TouchableOpacity
                                                    key={v.id}
                                                    style={[
                                                        styles.weightButton,
                                                        selectedVariant === v.id && styles.selectedWeightButton
                                                    ]}
                                                    onPress={() => setSelectedVariant(v.id)}
                                                >
                                                    <Text style={[
                                                        styles.weightButtonText,
                                                        selectedVariant === v.id && styles.selectedWeightButtonText
                                                    ]}>{v.unit}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View> */}
                                </View>
                            );
                        })
                    )}
                </View>


                {/* Farm Origin */}
                {/* <View style={styles.farmCard}>
                    <Text style={styles.farmLabel}>FARM ORIGIN</Text>
                    <View style={styles.farmContent}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop' }}
                            style={styles.farmerAvatar}
                        />
                        <View style={styles.farmInfo}>
                            <Text style={styles.farmName}>Green Valley Orchards</Text>
                            <View style={styles.locationRow}>
                                <MapPin size={12} color="#94A3B8" />
                                <Text style={styles.locationText}>Sonoma, California</Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.viewFarmButton}>
                            <Text style={styles.viewFarmText}>View Farm</Text>
                        </TouchableOpacity>
                    </View>
                </View> */}

                {/* Freshness Notes */}
                {/* <View style={styles.section}>
                    <Text style={styles.sectionTitle}>FRESHNESS NOTES</Text>
                    <Text style={styles.description}>
                        Harvested just 4 hours ago. These tomatoes are naturally ripened on the vine,
                        ensuring maximum lycopene levels and a sweet, tangy flavor profile.
                        Best consumed within 5 days for peak freshness.
                    </Text>
                </View> */}

                {/* Badges */}
                < View style={styles.badgeRow} >
                    <View style={styles.badgeItem}>
                        <View style={styles.badgeIconBg}>
                            <Leaf size={20} color="#38BDF8" fill="#38BDF8" opacity={0.2} />
                            <Leaf size={20} color="#38BDF8" style={{ position: 'absolute' }} />
                        </View>
                        <View>
                            <Text style={styles.badgeLabel}>Pesticide</Text>
                            <Text style={styles.badgeValue}>Free</Text>
                        </View>
                    </View>
                    <View style={styles.badgeItem}>
                        <View style={styles.badgeIconBg}>
                            <Clock size={20} color="#38BDF8" />
                        </View>
                        <View>
                            <Text style={styles.badgeLabel}>Delivery</Text>
                            <Text style={styles.badgeValue}>Same Day</Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Bottom Sticky Action Bar */}
            {(() => {
                const product = isFavorite[0];
                const isGrocery = product?.category?.category_type === 'grocery';
                return (
                    <View style={styles.bottomBar}>
                        <View style={styles.quantityContainer}>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => setQuantity(Math.max(0, quantity - 1))}
                            >
                                <Minus size={20} color="#64748B" />
                            </TouchableOpacity>
                            <Text style={styles.quantityText}>{quantity}</Text>
                            <TouchableOpacity
                                style={styles.quantityButton}
                                onPress={() => setQuantity(quantity + 1)}
                            >
                                <Plus size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        {isGrocery ? (
                            <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
                                <ShoppingBasket size={22} color="#FFFFFF" strokeWidth={2.5} />
                                <Text style={styles.addToCartText}>Add to Cart</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={[styles.addToCartButton, styles.freshOrderButton]} onPress={onBack}>
                                <Leaf size={22} color="#FFFFFF" strokeWidth={2.5} />
                                <Text style={styles.addToCartText}>Order Fresh</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                );
            })()}
        </View>


    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        flexGrow: 1,
    },
    imageHeader: {
        width: width,
        height: height * 0.45,
        backgroundColor: '#F1F5F9',
    },
    productImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    toolbar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
    },
    toolbarRight: {
        flexDirection: 'row',
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 4,
    },
    contentCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        marginTop: -40,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        paddingHorizontal: 24,
        paddingTop: 10,
    },
    pullContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    pullBar: {
        width: 40,
        height: 5,
        backgroundColor: '#E2E8F0',
        borderRadius: 3,
    },
    headerInfo: {
        marginBottom: 25,
    },
    tagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    organicTag: {
        backgroundColor: '#BAE6FD',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    organicTagText: {
        color: '#0EA5E9',
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
        marginLeft: 6,
    },
    reviewCount: {
        fontWeight: '500',
        color: '#94A3B8',
    },
    productName: {
        fontSize: 28,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 8,
        lineHeight: 34,
    },
    productPrice: {
        fontSize: 24,
        fontWeight: '800',
        color: '#38BDF8',
    },
    priceUnit: {
        fontSize: 16,
        color: '#94A3B8',
        fontWeight: '500',
    },
    section: {
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#94A3B8',
        letterSpacing: 1,
        marginBottom: 15,
    },
    weightRow: {
        flexDirection: 'row',
        gap: 12,
    },
    weightButton: {
        flex: 1,
        height: 50,
        borderRadius: 15,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedWeightButton: {
        borderColor: '#38BDF8',
        backgroundColor: '#F0F9FF',
    },
    weightButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#64748B',
    },
    selectedWeightButtonText: {
        color: '#38BDF8',
    },
    farmCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
        marginBottom: 25,
    },
    farmLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#94A3B8',
        letterSpacing: 1,
        marginBottom: 15,
    },
    farmContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    farmerAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F1F5F9',
    },
    farmInfo: {
        flex: 1,
        marginLeft: 15,
    },
    farmName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        fontSize: 13,
        color: '#94A3B8',
        marginLeft: 4,
        fontWeight: '500',
    },
    viewFarmButton: {
        backgroundColor: '#F0F9FF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    viewFarmText: {
        color: '#38BDF8',
        fontSize: 12,
        fontWeight: '700',
    },
    description: {
        fontSize: 15,
        color: '#64748B',
        lineHeight: 24,
        fontWeight: '500',
    },
    badgeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    badgeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 20,
        width: (width - 60) / 2,
    },
    badgeIconBg: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    badgeLabel: {
        fontSize: 11,
        color: '#94A3B8',
        fontWeight: '600',
    },
    badgeValue: {
        fontSize: 13,
        color: '#1E293B',
        fontWeight: '700',
    },
    bottomBar: {
        position: 'absolute',
        bottom: 25,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        height: 80,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        padding: 5,
        borderRadius: 15,
    },
    quantityButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
        paddingHorizontal: 15,
    },
    addToCartButton: {
        flex: 1,
        marginLeft: 15,
        height: 55,
        backgroundColor: '#38BDF8',
        borderRadius: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        shadowColor: '#38BDF8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    addToCartText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },
    freshOrderButton: {
        backgroundColor: '#16A34A',
        shadowColor: '#16A34A',
    },
    subtotalText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#64748B',
        marginTop: 5,
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
});

export default ProductDetailScreen;
