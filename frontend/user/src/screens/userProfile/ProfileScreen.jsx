import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
    StatusBar,
} from 'react-native';
import {
    User,
    MapPin,
    CreditCard,
    Wallet,
    Bell,
    HelpCircle,
    ChevronRight,
    LogOut,
    Pencil
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import BottomTabs from '../../components/BottomTabs';
import { fetchProfile } from '../../store/slices/profileSlice';

const { width } = Dimensions.get('window');

const ProfileScreen = ({
    onNavigateHome,
    onNavigateCategories,
    onNavigateCheckout,
    onNavigateOrders,
    onLogout,
    onEditProfile,
    onNavigateAddresses,
    onNavigatePayment,
    onNavigateWallet,
    onNavigateHelp
}) => {
    const { profile } = useSelector((state) => state.profile);
    const dispatch = useDispatch();
    console.log("profile", profile)

    useEffect(() => {
        if (!profile) {

            dispatch(fetchProfile());
        }
    }, [dispatch])

    const menuItems = [
        { id: 1, title: 'My Profile', icon: User, color: '#0EA5E9' },
        { id: 2, title: 'Delivery Addresses', icon: MapPin, color: '#0EA5E9' },
        { id: 3, title: 'Payment Methods', icon: CreditCard, color: '#0EA5E9' },
        { id: 4, title: 'Wallet', icon: Wallet, color: '#0EA5E9', extra: '$124.50' },
        { id: 5, title: 'Notifications', icon: Bell, color: '#0EA5E9' },
        { id: 6, title: 'Help & Support', icon: HelpCircle, color: '#0EA5E9' },
    ];

    const handleLogout = async () => {
        await dispatch(logoutUser()).unwrap();
        if (onLogout) onLogout();
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#E0F2FE" />
            <SafeAreaView style={styles.safeArea}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {/* Blue Header Background */}
                    <View style={styles.headerBackground} />

                    {/* Profile Header */}
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={{
                                    uri:
                                        profile?.profile_image
                                }}
                                style={styles.avatar}
                            />
                            <TouchableOpacity style={styles.editIconContainer} onPress={onEditProfile}>
                                <Pencil size={14} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.userName}>{profile?.username || 'Alex Johnson'}</Text>
                        <Text style={styles.userEmail}>{profile?.email || 'alex.johnson@example.com'}</Text>
                    </View>

                    {/* Menu Items */}
                    <View style={styles.menuContainer}>
                        {menuItems.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.menuItem}
                                onPress={() => {
                                    if (item.id === 1 && onEditProfile) onEditProfile();
                                    if (item.id === 2 && onNavigateAddresses) onNavigateAddresses();
                                    if (item.id === 3 && onNavigatePayment) onNavigatePayment();
                                    if (item.id === 4 && onNavigateWallet) onNavigateWallet();
                                    if (item.id === 6 && onNavigateHelp) onNavigateHelp();
                                }}
                            >
                                <View style={styles.menuItemLeft}>
                                    <View style={styles.iconContainer}>
                                        <item.icon size={22} color={item.color} />
                                    </View>
                                    <Text style={styles.menuTitle}>{item.title}</Text>
                                </View>
                                <View style={styles.menuItemRight}>
                                    {item.extra && <Text style={styles.extraText}>{item.extra}</Text>}
                                    <ChevronRight size={20} color="#94A3B8" />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Logout Button */}
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <LogOut size={20} color="#64748B" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>

                    {/* Version Info */}
                    <Text style={styles.versionText}>VERSION 1.2.4 (BUILD 45)</Text>
                </ScrollView>
            </SafeAreaView>

            <BottomTabs
                activeTab="profile"
                onNavigateHome={onNavigateHome}
                onNavigateCategories={onNavigateCategories}
                onNavigateCheckout={onNavigateCheckout}
                onNavigateOrders={onNavigateOrders}
                onNavigateProfile={() => { }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    headerBackground: {
        position: 'absolute',
        top: -100,
        left: 0,
        right: 0,
        height: 400,
        backgroundColor: '#E0F2FE',
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
    },
    profileHeader: {
        alignItems: 'center',
        paddingTop: 40,
        paddingBottom: 30,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#FFFFFF',
    },
    editIconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#38BDF8',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    userName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
    },
    menuContainer: {
        paddingHorizontal: 20,
        marginTop: 10,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 15,
        marginBottom: 12,
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
    },
    menuItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    extraText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#22C55E',
        marginRight: 10,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F5F9',
        marginHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 15,
        marginTop: 20,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#64748B',
        marginLeft: 10,
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        color: '#94A3B8',
        marginTop: 25,
        fontWeight: '600',
        letterSpacing: 1,
    },
});

export default ProfileScreen;
