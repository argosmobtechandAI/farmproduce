import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    PermissionsAndroid,
    Platform,
    Alert,
    ActivityIndicator,
    Modal,
    TextInput
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {
    ChevronLeft,
    Plus,
    MapPin,
    MoreVertical,
    Home,
    Briefcase,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiFunction } from '../../api/apifunction';
import { listAddressesApi, reverseGeocodeApi, saveAddressApi } from '../../api/api';



const DeliveryAddressesScreen = ({ onBack }) => {

    const [addresses, setAddresses] = useState([]);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newAddress, setNewAddress] = useState({
        address_line: '',
        city: '',
        state: '',
        pincode: '',
        latitude: '',
        longitude: ''
    });

    useEffect(() => {
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        const res = await apiFunction(listAddressesApi, [], {}, "get", true);
        if (res?.data) setAddresses(res.data);
    };

    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Permission',
                        message: 'We need access to your location to set your delivery address.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };



    const handleAddNewAddress = async () => {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
            Alert.alert("Permission Denied", "Cannot access location");
            return;
        }

        setIsLoadingLocation(true);
        Geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                setIsLoadingLocation(false);

                try {
                    const res = await apiFunction(reverseGeocodeApi, [], { latitude, longitude }, 'post', true);
                    if (res?.data) {
                        setNewAddress({
                            address_line: res.data.formatted_address || '',
                            city: res.data.city || '',
                            state: res.data.state || '',
                            pincode: res.data.pincode || '',
                            latitude: latitude,
                            longitude: longitude
                        });
                        setIsModalVisible(true);
                    }
                } catch (error) {
                    Alert.alert("Error", "Failed to fetch address details.");
                } finally {
                    setIsLoadingLocation(false);
                }
            },
            (error) => {
                setIsLoadingLocation(false);
                Alert.alert("Location Error", error.message);
            },
            { enableHighAccuracy: false, timeout: 30000, maximumAge: 60000 }
        );
    };
    const handleSaveAddress = async () => {
        // ✅ Validate before sending
        if (!newAddress.state.trim()) {
            Alert.alert("Error", "State is required. Please enter manually.");
            return;
        }
        if (!newAddress.city.trim()) {
            Alert.alert("Error", "City is required.");
            return;
        }

        try {
            const res = await apiFunction(saveAddressApi, [], newAddress, 'post', true);
            console.log(res?.data, "save address response");

            // ✅ FIXED: backend returns {id, address_line, city...} not {success: true}
            if (res?.data?.id) {
                Alert.alert("Success", "Address saved successfully");
                setIsModalVisible(false);
                setNewAddress({
                    address_line: '',
                    city: '',
                    state: '',
                    pincode: '',
                    latitude: '',
                    longitude: ''
                });
                fetchAddresses(); // refresh list
            } else {
                Alert.alert("Error", res?.data?.error || "Failed to save address");
            }
        } catch (error) {
            console.log("Save address error:", error);
            Alert.alert("Error", "Failed to save address");
        }
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

                    {addresses.map((addr) => (
                        <View key={addr.id} style={styles.addressCard}>
                            <View style={styles.addressLeft}>
                                <View style={[styles.iconBox, { backgroundColor: '#F0F9FF' }]}>
                                    <MapPin size={22} color="#38BDF8" />
                                </View>
                                <View style={styles.addressDetails}>
                                    <Text style={styles.addressType}>{addr.address_line}</Text>
                                    <Text style={styles.addressText}>{addr.city}, {addr.state}</Text>
                                    <Text style={styles.cityText}>Pincode: {addr.pincode}</Text>
                                </View>
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity style={styles.addNewAddress} onPress={handleAddNewAddress} disabled={isLoadingLocation}>
                        {isLoadingLocation ? (
                            <ActivityIndicator color="#38BDF8" size="small" />
                        ) : (
                            <>
                                <View style={styles.addIconBox}>
                                    <Plus size={24} color="#38BDF8" />
                                </View>
                                <Text style={styles.addNewText}>Add New Address</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
            <Modal visible={isModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Confirm Address</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Address Line"
                            value={newAddress.address_line}
                            onChangeText={(text) => setNewAddress({ ...newAddress, address_line: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="City"
                            value={newAddress.city}
                            onChangeText={(text) => setNewAddress({ ...newAddress, city: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="State"
                            value={newAddress.state}
                            onChangeText={(text) => setNewAddress({ ...newAddress, state: text })}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Pincode"
                            value={newAddress.pincode}
                            keyboardType="number-pad"
                            onChangeText={(text) => setNewAddress({ ...newAddress, pincode: text })}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
                                <Text style={styles.saveText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        padding: 16,
        borderRadius: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    addressLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    addressDetails: {
        flex: 1,
    },
    typeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    addressType: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1E293B',
        marginRight: 8,
    },
    defaultBadge: {
        backgroundColor: '#E0F2FE',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    defaultText: {
        color: '#0EA5E9',
        fontSize: 10,
        fontWeight: '800',
    },
    addressText: {
        fontSize: 14,
        color: '#64748B',
        fontWeight: '500',
        marginBottom: 2,
    },
    cityText: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '600',
    },
    moreButton: {
        padding: 8,
    },
    addNewAddress: {
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 20,
        color: '#1E293B',
    },
    input: {
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        color: '#1E293B',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    cancelButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
        marginRight: 10,
        alignItems: 'center',
    },
    saveButton: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        backgroundColor: '#38BDF8',
        marginLeft: 10,
        alignItems: 'center',
    },
    cancelText: {
        color: '#64748B',
        fontWeight: '600',
    },
    saveText: {
        color: '#FFF',
        fontWeight: '600',
    },
});

export default DeliveryAddressesScreen;
