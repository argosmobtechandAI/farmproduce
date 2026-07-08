import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Dimensions,
    StatusBar,
    Image,
    ActivityIndicator
} from 'react-native';
import {
    Search,
    Leaf,
    Droplet,
    Sprout,
    Wheat,
    Citrus,
    Soup,
    Beef,
    Croissant,
    ShoppingBag
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabs from '../../components/BottomTabs';
import { getProductApi, BASE_URL } from '../../api/api';
import { apiFunction } from '../../api/apifunction';
import { fallbackCategories } from '../../utils/fallbackData';

const { width } = Dimensions.get('window');

const CategoriesScreen = ({ onNavigateHome, onNavigateProduct, onNavigateCheckout, onNavigateOrders, onNavigateProfile }) => {
    const [activeType, setActiveType] = useState('vegetable');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const filteredCategories = categories.filter(cat => cat.category_type === activeType);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        const response = await apiFunction(getProductApi, [], {}, "get", false);
        const categoryData = response?.data?.data || response?.data?.results || [];

        if (categoryData && categoryData.length > 0) {
            setCategories(categoryData);
        } else {
            setCategories(fallbackCategories);
        }
        setLoading(false);
    };

    // const filteredCategories = categories.filter(cat => cat.id === activeType);
    // console.log(filteredCategories)

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <View style={styles.searchInputWrapper}>
                            <Search size={20} color="#94A3B8" />
                            <TextInput
                                placeholder="Search categories..."
                                style={styles.searchInput}
                                placeholderTextColor="#94A3B8"
                            />
                        </View>
                    </View>

                    {/* Category Type Tabs */}
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, activeType === 'vegetable' && styles.activeTab]}
                            onPress={() => setActiveType('vegetable')}
                        >
                            <Leaf size={18} color={activeType === 'vegetable' ? '#FFFFFF' : '#64748B'} />
                            <Text style={[styles.tabText, activeType === 'vegetable' && styles.activeTabText]}>Vegetables</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, activeType === 'grocery' && styles.activeTab]}
                            onPress={() => setActiveType('grocery')}
                        >
                            <ShoppingBag size={18} color={activeType === 'grocery' ? '#FFFFFF' : '#64748B'} />
                            <Text style={[styles.tabText, activeType === 'grocery' && styles.activeTabText]}>Grocery</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Categories Grid */}
                    {loading ? (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color="#38BDF8" />
                        </View>
                    ) : (
                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.gridContainer}
                        >
                            {filteredCategories.length > 0 ? (
                                filteredCategories.map((item) => (
                                    <TouchableOpacity 
                                        key={item.id} 
                                        style={styles.categoryCard}
                                        onPress={() => onNavigateProduct(item.id)}
                                    >
                                        <View style={styles.iconWrapper}>
                                            <Image
                                                source={{
                                                    uri: item.image 
                                                        ? (item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`)
                                                        : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400'
                                                }}
                                                style={styles.categoryImg}
                                                resizeMode="contain"
                                            />
                                        </View>
                                        <Text style={styles.categoryName} numberOfLines={1}>{item.name}</Text>
                                        <Text style={styles.itemCount}>Fresh Items</Text>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>No categories found in this section</Text>
                                </View>
                            )}
                            {/* Space for bottom tab */}
                            <View style={{ height: 100 }} />
                        </ScrollView>
                    )}
                </View>
            </SafeAreaView>

            <BottomTabs
                activeTab="categories"
                onNavigateHome={onNavigateHome}
                onNavigateCategories={() => { }}
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
    content: {
        flex: 1,
        paddingTop: 10,
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 15,
        height: 50,
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
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        height: 45,
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    activeTab: {
        backgroundColor: '#38BDF8',
        borderColor: '#38BDF8',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
    },
    activeTabText: {
        color: '#FFFFFF',
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 15,
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: (width - 50) / 2,
        height: 160,
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 15,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 8,
        elevation: 2,
    },
    iconWrapper: {
        width: 70,
        height: 70,
        backgroundColor: '#F0FDF4',
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        overflow: 'hidden',
        padding: 10,
    },
    categoryImg: {
        width: '100%',
        height: '100%',
    },
    categoryName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 4,
        textAlign: 'center',
    },
    itemCount: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        width: '100%',
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: '#94A3B8',
        fontSize: 14,
    }
});

export default CategoriesScreen;
