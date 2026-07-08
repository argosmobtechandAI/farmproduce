import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import {
    ChevronLeft,
    MapPin,
    Plus,
    MoreVertical,
    Check
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const addressesData = [
    {
        id: 1,
        label: 'Home',
        address: '123 Market Street, Suite 456, San Francisco, CA 94103',
        selected: true
    },
    {
        id: 2,
        label: 'Office',
        address: '456 Business Park Road, Building B, San Jose, CA 95131',
        selected: false
    }
];

const DeliveryAddressesScreen = ({ onBack }) => {
    const [addresses, setAddresses] = useState(addressesData);

    const handleSelect = (id) => {
        setAddresses(addresses.map(addr => ({
            ...addr,
            selected: addr.id === id
        })));
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <ChevronLeft size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Delivery Addresses</Text>
                    <TouchableOpacity style={styles.addButton}>
                        <Plus size={20} color="#38BDF8" />
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.sectionTitle}>Saved Addresses</Text>

                    {addresses.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.addressCard, item.selected && styles.selectedCard]}
                            onPress={() => handleSelect(item.id)}
                        >
                            <View style={styles.cardLeft}>
                                <View style={[styles.iconBox, item.selected && styles.selectedIconBox]}>
                                    <MapPin size={22} color={item.selected ? '#FFFFFF' : '#38BDF8'} />
                                </View>
                                <View style={styles.addressInfo}>
                                    <View style={styles.labelRow}>
                                        <Text style={styles.addressLabel}>{item.label}</Text>
                                        {item.selected && (
                                            <View style={styles.defaultBadge}>
                                                <Text style={styles.defaultText}>Default</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.addressText} numberOfLines={2}>
                                        {item.address}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.cardRight}>
                                {item.selected ? (
                                    <View style={styles.checkCircle}>
                                        <Check size={16} color="#FFFFFF" />
                                    </View>
                                ) : (
                                    <TouchableOpacity style={styles.moreButton}>
                                        <MoreVertical size={20} color="#94A3B8" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity style={styles.addNewCard}>
                        <View style={styles.addIconBox}>
                            <Plus size={24} color="#38BDF8" />
                        </View>
                        <Text style={styles.addNewText}>Add New Address</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#64748B',
        marginBottom: 20,
    },
    addressCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    selectedCard: {
        borderColor: '#38BDF8',
        backgroundColor: '#F0F9FF',
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    selectedIconBox: {
        backgroundColor: '#38BDF8',
    },
    addressInfo: {
        flex: 1,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 8,
    },
    addressLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
    },
    defaultBadge: {
        backgroundColor: '#38BDF820',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    defaultText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#0EA5E9',
    },
    addressText: {
        fontSize: 14,
        color: '#64748B',
        lineHeight: 20,
    },
    cardRight: {
        marginLeft: 10,
    },
    checkCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#38BDF8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    moreButton: {
        padding: 4,
    },
    addNewCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        marginTop: 10,
        justifyContent: 'center',
        gap: 12,
    },
    addIconBox: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addNewText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#38BDF8',
    },
});

export default DeliveryAddressesScreen;
