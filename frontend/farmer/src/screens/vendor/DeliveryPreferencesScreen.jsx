import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    StatusBar,
    Switch,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    ChevronLeft,
    Truck,
    MapPin,
    CircleDollarSign,
    Clock,
    ShoppingBag,
    Save
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const PreferenceItem = ({ label, icon: Icon, children }) => (
    <View style={styles.preferenceItem}>
        <View style={styles.preferenceHeader}>
            <View style={styles.iconBox}>
                <Icon size={20} color="#38BDF8" />
            </View>
            <Text style={styles.preferenceLabel}>{label}</Text>
        </View>
        <View style={styles.preferenceContent}>
            {children}
        </View>
    </View>
);

const DeliveryPreferencesScreen = ({ onBack }) => {
    const [isDeliveryEnabled, setIsDeliveryEnabled] = useState(true);
    const [isPickupEnabled, setIsPickupEnabled] = useState(true);
    const [deliveryRadius, setDeliveryRadius] = useState('15');
    const [deliveryFee, setDeliveryFee] = useState('5.00');
    const [minOrder, setMinOrder] = useState('20.00');
    const [estimatedTime, setEstimatedTime] = useState('30-60');

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <ChevronLeft size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Delivery Preferences</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Main Toggles */}
                    <View style={styles.toggleSection}>
                        <View style={styles.toggleRow}>
                            <View style={styles.toggleInfo}>
                                <Truck size={22} color="#1E293B" />
                                <View style={{ marginLeft: 12 }}>
                                    <Text style={styles.toggleTitle}>Home Delivery</Text>
                                    <Text style={styles.toggleSubtext}>Provide delivery to customers</Text>
                                </View>
                            </View>
                            <Switch
                                trackColor={{ false: '#E2E8F0', true: '#38BDF8' }}
                                thumbColor="#FFF"
                                ios_backgroundColor="#E2E8F0"
                                onValueChange={setIsDeliveryEnabled}
                                value={isDeliveryEnabled}
                            />
                        </View>

                        <View style={[styles.toggleRow, { marginTop: 20, borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 20 }]}>
                            <View style={styles.toggleInfo}>
                                <ShoppingBag size={22} color="#1E293B" />
                                <View style={{ marginLeft: 12 }}>
                                    <Text style={styles.toggleTitle}>Store Pickup</Text>
                                    <Text style={styles.toggleSubtext}>Allow customers to pick up orders</Text>
                                </View>
                            </View>
                            <Switch
                                trackColor={{ false: '#E2E8F0', true: '#38BDF8' }}
                                thumbColor="#FFF"
                                ios_backgroundColor="#E2E8F0"
                                onValueChange={setIsPickupEnabled}
                                value={isPickupEnabled}
                            />
                        </View>
                    </View>

                    {/* Detailed Preferences - Only visible if delivery is enabled */}
                    {isDeliveryEnabled && (
                        <View style={styles.detailsSection}>
                            <Text style={styles.sectionTitle}>Delivery Configuration</Text>

                            <PreferenceItem label="Maximum Delivery Radius" icon={MapPin}>
                                <View style={styles.inputGroup}>
                                    <TextInput
                                        style={styles.textInput}
                                        value={deliveryRadius}
                                        onChangeText={setDeliveryRadius}
                                        keyboardType="numeric"
                                    />
                                    <Text style={styles.inputUnit}>km</Text>
                                </View>
                            </PreferenceItem>

                            <PreferenceItem label="Flat Delivery Fee" icon={CircleDollarSign}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputPrefix}>$</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={deliveryFee}
                                        onChangeText={setDeliveryFee}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </PreferenceItem>

                            <PreferenceItem label="Minimum Order for Delivery" icon={ShoppingBag}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputPrefix}>$</Text>
                                    <TextInput
                                        style={styles.textInput}
                                        value={minOrder}
                                        onChangeText={setMinOrder}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </PreferenceItem>

                            <PreferenceItem label="Estimated Delivery Time" icon={Clock}>
                                <View style={styles.inputGroup}>
                                    <TextInput
                                        style={styles.textInput}
                                        value={estimatedTime}
                                        onChangeText={setEstimatedTime}
                                        keyboardType="default"
                                    />
                                    <Text style={styles.inputUnit}>mins</Text>
                                </View>
                            </PreferenceItem>
                        </View>
                    )}

                    {/* Action Button */}
                    <TouchableOpacity style={styles.saveButton}>
                        <Save size={20} color="#FFF" style={{ marginRight: 8 }} />
                        <Text style={styles.saveButtonText}>Apply Preferences</Text>
                    </TouchableOpacity>

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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F8FAFC',
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
        paddingBottom: 40,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    toggleSection: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 1,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    toggleInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    toggleTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
    },
    toggleSubtext: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
    },
    detailsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 16,
        marginLeft: 4,
    },
    preferenceItem: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    preferenceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconBox: {
        width: 36,
        height: 36,
        backgroundColor: '#F0F9FF',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    preferenceLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
    },
    preferenceContent: {
        // Content area
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        paddingHorizontal: 16,
        height: 52,
        borderWidth: 1.5,
        borderColor: '#F1F5F9',
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: '#1E293B',
        fontWeight: '800',
    },
    inputUnit: {
        fontSize: 14,
        fontWeight: '700',
        color: '#94A3B8',
        marginLeft: 8,
    },
    inputPrefix: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
        marginRight: 4,
    },
    saveButton: {
        backgroundColor: '#38BDF8',
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        flexDirection: 'row',
        shadowColor: '#38BDF8',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    saveButtonText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
    },
});

export default DeliveryPreferencesScreen;
