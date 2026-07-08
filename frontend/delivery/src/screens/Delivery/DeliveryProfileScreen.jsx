import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    StatusBar,
    Dimensions,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChevronLeft,
    ChevronRight,
    User,
    Truck,
    FileText,
    LifeBuoy,
    LogOut,
    Star,
    ShieldCheck,
    Home,
    CircleDollarSign,
    Camera
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { API_URLS } from '../../config/api';
import { launchImageLibrary } from 'react-native-image-picker';

const { width } = Dimensions.get('window');

const ProfileItem = ({ icon: Icon, title, value, iconBg, color, onPress }) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.itemLeft}>
            <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
                <Icon size={20} color={color} />
            </View>
            <View>
                <Text style={styles.itemTitle}>{title}</Text>
                {value ? <Text style={styles.itemValue}>{value}</Text> : null}
            </View>
        </View>
        <ChevronRight size={18} color="#CBD5E1" />
    </TouchableOpacity>
);

const DeliveryProfileScreen = ({ onBack, onLogout, onNavigateHome, onNavigateTrips, onNavigateEarnings }) => {
    const { token } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProfile = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URLS.USER_PROFILE, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setProfile(data);
            } else {
                setError(data.message || data.error || 'Failed to fetch profile details');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const uploadProfileImage = async (imageUri) => {
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            const filename = imageUri.split('/').pop() || 'profile.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('profile_image', {
                uri: Platform.OS === 'android' ? imageUri : imageUri.replace('file://', ''),
                name: filename,
                type: type,
            });

            const response = await fetch(API_URLS.USER_PROFILE_UPDATE, {
                method: 'PATCH',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (response.ok) {
                fetchProfile(); // Re-fetch to get all delivery-specific fields (partner_id, vehicle_type, etc.)
                Alert.alert('Success', 'Profile image updated successfully.');
            } else {
                setError(data.message || data.error || 'Failed to upload image');
            }
        } catch (err) {
            console.error("Upload image error:", err);
            setError(err.message || 'Something went wrong during image upload');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectImage = () => {
        const options = {
            mediaType: 'photo',
            quality: 0.8,
            maxWidth: 500,
            maxHeight: 500,
        };

        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorMessage);
                Alert.alert('Error', 'Failed to pick image: ' + (response.errorMessage || 'Unknown error'));
            } else if (response.assets && response.assets.length > 0) {
                const asset = response.assets[0];
                if (asset.uri) {
                    uploadProfileImage(asset.uri);
                }
            }
        });
    };

    useEffect(() => {
        if (token) {
            fetchProfile();
        }
    }, [token]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.headerButton} onPress={onBack}>
                        <ChevronLeft size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Profile</Text>
                    <View style={styles.headerButton} />
                </View>

                {loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#38BDF8" />
                    </View>
                ) : (
                    <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        {/* Profile Header Section */}
                        <View style={styles.profileSection}>
                            <TouchableOpacity style={styles.avatarWrapper} onPress={handleSelectImage} activeOpacity={0.85}>
                                <View style={styles.avatarContainer}>
                                    <View style={styles.avatarPlaceholder}>
                                        {profile?.profile_image ? (
                                            <Image
                                                source={{ uri: profile.profile_image }}
                                                style={{ width: 100, height: 100, borderRadius: 50 }}
                                            />
                                        ) : (
                                            <User size={60} color="#FDBA74" />
                                        )}
                                    </View>
                                </View>
                                <View style={styles.badgeContainer}>
                                    <ShieldCheck size={16} color="#FFF" fill="#38BDF8" />
                                </View>
                            </TouchableOpacity>

                            <Text style={styles.profileName}>{profile?.full_name || 'Delivery Partner'}</Text>
                            <Text style={styles.partnerId}>Partner ID: {profile?.partner_id || 'DP-0000'}</Text>

                            <View style={styles.ratingBadge}>
                                <Star size={14} color="#EAB308" fill="#EAB308" />
                                <Text style={styles.ratingText}>
                                    {profile?.rating?.score || '4.5'}{' '}
                                    <Text style={styles.reviewsText}>
                                        ({profile?.rating?.label || 'Active Partner'})
                                    </Text>
                                </Text>
                            </View>
                        </View>

                        {/* Error message */}
                        {error && (
                            <View style={{ padding: 16, backgroundColor: '#FEF2F2', margin: 20, borderRadius: 20 }}>
                                <Text style={{ color: '#EF4444', textAlign: 'center', fontWeight: '600' }}>{error}</Text>
                            </View>
                        )}

                        {/* Account Information Section */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionLabel}>ACCOUNT INFORMATION</Text>
                        </View>

                        <View style={styles.listContainer}>
                            <ProfileItem
                                icon={User}
                                title="Phone Number"
                                value={profile?.phone || 'Not Provided'}
                                iconBg="#F0F9FF"
                                color="#38BDF8"
                                onPress={() => Alert.alert('Detail', `Phone: ${profile?.phone}`)}
                            />
                            <ProfileItem
                                icon={User}
                                title="Email Address"
                                value={profile?.email || 'Not Provided'}
                                iconBg="#F0F9FF"
                                color="#38BDF8"
                                onPress={() => Alert.alert('Detail', `Email: ${profile?.email}`)}
                            />
                            <ProfileItem
                                icon={Truck}
                                title="Vehicle Details"
                                value={profile?.vehicle_type || 'Two Wheeler (Default)'}
                                iconBg="#F0F9FF"
                                color="#38BDF8"
                                onPress={() => Alert.alert(
                                    'Vehicle Details',
                                    `Vehicle: ${profile?.vehicle_type || 'Two Wheeler (Default)'}`
                                )}
                            />
                            <ProfileItem
                                icon={FileText}
                                title="Documents (ID & License)"
                                value={profile?.documents_status === 'verified' ? 'Verified' : 'Pending Verification'}
                                iconBg="#F5F3FF"
                                color="#8B5CF6"
                                onPress={() => Alert.alert(
                                    'KYC & License Details',
                                    `Status: ${profile?.documents_status === 'verified' ? 'Verified' : 'Pending Review'}`
                                )}
                            />
                        </View>

                        {/* Support & Settings Section */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionLabel}>SUPPORT & SETTINGS</Text>
                        </View>

                        <View style={styles.listContainer}>
                            <ProfileItem
                                icon={LifeBuoy}
                                title="Support Center"
                                iconBg="#F0FDF4"
                                color="#22C55E"
                                onPress={() => Alert.alert('Support', 'Contact Support:\nsupport@freshfarm.com')}
                            />
                        </View>

                        {/* Logout Button */}
                        <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.8}>
                            <LogOut size={20} color="#64748B" />
                            <Text style={styles.logoutText}>Logout Account</Text>
                        </TouchableOpacity>

                        {/* Version Info */}
                        <Text style={styles.versionText}>VERSION 2.4.1 (BUILD 449)</Text>
                    </ScrollView>
                )}
            </SafeAreaView>

            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={onNavigateHome}>
                    <Home size={24} color="#94A3B8" />
                    <Text style={styles.navText}>HOME</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={onNavigateTrips}>
                    <Truck size={24} color="#94A3B8" />
                    <Text style={styles.navText}>MY TRIPS</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={onNavigateEarnings}>
                    <CircleDollarSign size={24} color="#94A3B8" />
                    <Text style={styles.navText}>EARNINGS</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <User size={24} color="#38BDF8" />
                    <Text style={[styles.navText, styles.activeNavText]}>PROFILE</Text>
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
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: '#FFF',
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 16,
    },
    avatarContainer: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#FFEDD5',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#FFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFEDD5',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    badgeContainer: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 2,
    },
    profileName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 4,
    },
    partnerId: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94A3B8',
        marginBottom: 16,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFBEB',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: '#FEF3C7',
    },
    ratingText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#D97706',
    },
    reviewsText: {
        fontWeight: '500',
        color: '#F59E0B',
        opacity: 0.6,
    },
    sectionHeader: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 12,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#94A3B8',
        letterSpacing: 1,
    },
    listContainer: {
        backgroundColor: '#FFF',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#F1F5F9',
    },
    profileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#334155',
    },
    itemValue: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F5F9',
        marginHorizontal: 20,
        marginTop: 32,
        height: 56,
        borderRadius: 16,
        gap: 10,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#64748B',
    },
    versionText: {
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: '#CBD5E1',
        marginTop: 24,
        letterSpacing: 0.5,
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

export default DeliveryProfileScreen;
