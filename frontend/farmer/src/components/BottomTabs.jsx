import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Home, LayoutGrid, ShoppingBasket, ShoppingBag, User } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const BottomTabs = ({ activeTab, onNavigateHome, onNavigateCategories, onNavigateCheckout, onNavigateOrders, onNavigateProfile }) => {
    return (
        <View style={styles.tabBar}>
            <TouchableOpacity
                style={styles.tabItem}
                onPress={onNavigateHome}
            >
                <Home size={24} color={activeTab === 'home' ? '#38BDF8' : '#94A3B8'} fill={activeTab === 'home' ? '#38BDF8' : 'transparent'} />
                <Text style={[styles.tabText, activeTab === 'home' && { color: '#38BDF8' }]}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.tabItem}
                onPress={onNavigateCategories}
            >
                <LayoutGrid size={24} color={activeTab === 'categories' ? '#38BDF8' : '#94A3B8'} fill={activeTab === 'categories' ? '#38BDF8' : 'transparent'} />
                <Text style={[styles.tabText, activeTab === 'categories' && { color: '#38BDF8' }]}>Categories</Text>
            </TouchableOpacity>

            <View style={styles.cartButtonWrapper}>
                <TouchableOpacity
                    style={[styles.floatingCartButton, activeTab === 'checkout' && styles.activeFloatingButton]}
                    onPress={onNavigateCheckout}
                >
                    <ShoppingBasket size={28} color="#FFFFFF" />
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>2</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.tabItem}
                onPress={onNavigateOrders}
            >
                <ShoppingBag size={24} color={activeTab === 'orders' ? '#38BDF8' : '#94A3B8'} fill={activeTab === 'orders' ? '#38BDF8' : 'transparent'} />
                <Text style={[styles.tabText, activeTab === 'orders' && { color: '#38BDF8' }]}>Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.tabItem}
                onPress={onNavigateProfile}
            >
                <User size={24} color={activeTab === 'profile' ? '#38BDF8' : '#94A3B8'} fill={activeTab === 'profile' ? '#38BDF8' : 'transparent'} />
                <Text style={[styles.tabText, activeTab === 'profile' && { color: '#38BDF8' }]}>Profile</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 85,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 25,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        zIndex: 100,
    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    tabText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#94A3B8',
        marginTop: 4,
    },
    cartButtonWrapper: {
        marginTop: -45,
        width: width * 0.2,
        alignItems: 'center',
    },
    floatingCartButton: {
        width: 64,
        height: 64,
        backgroundColor: '#38BDF8',
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#F8FAFC',
        shadowColor: '#38BDF8',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 8,
    },
    activeFloatingButton: {
        backgroundColor: '#0EA5E9',
        borderColor: '#E0F2FE',
    },
    badge: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: '#F87171',
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '800',
    },
});

export default BottomTabs;
