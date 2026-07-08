import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    StatusBar,
    Dimensions,
    Platform,
    TextInput,
    Alert,
    ActivityIndicator,
    PermissionsAndroid,
    Linking,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Navigation,
    Home,
    Truck,
    CircleDollarSign,
    User,
    Key,
    Phone,
    MessageSquare,
    Plus,
    Minus,
    FileText,
    CheckCircle,
    MapPin,
    Camera
} from 'lucide-react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../../context/AuthContext';
import { API_URLS, GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_DARK_STYLE } from '../../config/api';
import { WebView } from 'react-native-webview';

const getLeafletHtml = (lat, lon, zoomLevel) => `
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        body { margin: 0; padding: 0; background-color: #F8FAFC; }
        #map { height: 100vh; width: 100vw; }
        .leaflet-control-attribution { display: none !important; }
        
        /* Modern Pulsing Blue Marker */
        .blue-dot {
            width: 14px;
            height: 14px;
            background-color: #38BDF8;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 10px rgba(56, 189, 248, 0.6);
            position: relative;
        }
        .blue-dot::after {
            content: '';
            width: 30px;
            height: 30px;
            background-color: rgba(56, 189, 248, 0.4);
            border-radius: 50%;
            position: absolute;
            top: -10px;
            left: -10px;
            animation: pulse 1.8s infinite ease-in-out;
        }
        @keyframes pulse {
            0% { transform: scale(0.5); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
        }
    </style>
</head>
<body>
    <div id="map"></div>
    <script>
        var map = L.map('map', {
            zoomControl: false,
            attributionControl: false
        }).setView([${lat}, ${lon}], ${zoomLevel});
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            subdomains: ['a', 'b', 'c']
        }).addTo(map);

        var customIcon = L.divIcon({
            className: 'blue-dot-container',
            html: '<div class="blue-dot"></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        var marker = L.marker([${lat}, ${lon}], { icon: customIcon }).addTo(map);

        window.updateLocation = function(newLat, newLon, newZoom) {
            map.panTo([newLat, newLon]);
            marker.setLatLng([newLat, newLon]);
            if (newZoom !== undefined) {
                map.setZoom(newZoom);
            }
        };
    </script>
</body>
</html>
`;

const { width, height } = Dimensions.get('window');

const DeliveryTripScreen = ({ trip, onBack, onConfirmOtp, onNavigateProfile, onNavigateTrips, onNavigateEarnings }) => {
    const { token } = useAuth();
    const [status, setStatus] = useState(trip?.status || 'assigned');
    const [otpInput, setOtpInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [latitude, setLatitude] = useState(28.6139);
    const [longitude, setLongitude] = useState(77.2090);
    const [zoom, setZoom] = useState(14);
    const [trackingLocation, setTrackingLocation] = useState(false);
    const [returnImage, setReturnImage] = useState(null);

    const mapRef = useRef(null);

    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.injectJavaScript(`
                if (window.updateLocation) {
                    window.updateLocation(${latitude}, ${longitude}, ${zoom});
                }
                true;
            `);
        }
    }, [latitude, longitude, zoom]);

    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
                ]);
                return (
                    granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED ||
                    granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED
                );
            } catch (err) {
                console.warn("Location permission error:", err);
                return false;
            }
        }
        return true;
    };

    const fetchSavedLocation = async () => {
        try {
            const response = await fetch(API_URLS.DELIVERY_LOCATION_UPDATE, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok && data.latitude && data.longitude) {
                setLatitude(parseFloat(data.latitude));
                setLongitude(parseFloat(data.longitude));
            }
        } catch (err) {
            console.log("Error fetching saved location:", err);
        }
    };

    const openExternalNavigation = () => {
        const destination = status === 'picked_up'
            ? `${trip.deliver_to?.address_line || ''}, ${trip.deliver_to?.city || ''}`
            : `${trip.pickup?.name || ''}`;

        const url = Platform.select({
            ios: `maps:0,0?q=${encodeURIComponent(destination)}`,
            android: `geo:0,0?q=${encodeURIComponent(destination)}`
        });

        Linking.openURL(url).catch(() => {
            Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`);
        });
    };

    const trackDeviceLocation = async () => {
        setTrackingLocation(true);

        const onSuccess = async (position, isGPS = false) => {
            const { latitude, longitude } = position.coords;
            setLatitude(latitude);
            setLongitude(longitude);
            if (isGPS) {
                setTrackingLocation(false);
            }

            // Update location on backend
            try {
                await fetch(API_URLS.DELIVERY_LOCATION_UPDATE, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        latitude: parseFloat(latitude.toFixed(6)),
                        longitude: parseFloat(longitude.toFixed(6))
                    })
                });
            } catch (err) {
                console.log("Error updating location on backend:", err);
            }
        };

        const runIPFallback = async () => {
            console.log("Fetching instant IP location in TripScreen...");

            const fetchWithTimeout = async (url, ms = 4000) => {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), ms);
                try {
                    const response = await fetch(url, { signal: controller.signal });
                    clearTimeout(timeoutId);
                    return response;
                } catch (err) {
                    clearTimeout(timeoutId);
                    throw err;
                }
            };

            try {
                const response = await fetchWithTimeout('https://ipinfo.io/json');
                const ipData = await response.json();
                if (ipData.loc) {
                    const [latStr, lonStr] = ipData.loc.split(',');
                    onSuccess({
                        coords: {
                            latitude: parseFloat(latStr),
                            longitude: parseFloat(lonStr)
                        }
                    }, false);
                    return true;
                }
            } catch (e) {
                console.log("ipinfo failed in TripScreen, trying freeipapi...", e);
            }

            try {
                const response2 = await fetchWithTimeout('https://freeipapi.com/api/json');
                const ipData2 = await response2.json();
                if (ipData2.latitude && ipData2.longitude) {
                    onSuccess({
                        coords: {
                            latitude: parseFloat(ipData2.latitude),
                            longitude: parseFloat(ipData2.longitude)
                        }
                    }, false);
                    return true;
                }
            } catch (e2) {
                console.log("All IP location services failed in TripScreen:", e2);
            }
            return false;
        };

        // Trigger IP fallback in parallel immediately so map updates instantly
        const ipPromise = runIPFallback();

        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
            console.log("Location permission denied in TripScreen, using IP fallback only.");
            const ipFound = await ipPromise;
            setTrackingLocation(false);
            if (!ipFound) {
                Alert.alert(
                    "Location Error",
                    "Location permission denied and network-based location failed. Please enable permissions or check your internet."
                );
            }
            return;
        }

        // Try High Accuracy GPS first with 10 second timeout
        Geolocation.getCurrentPosition(
            (pos) => onSuccess(pos, true),
            (err1) => {
                console.log("High accuracy GPS failed, trying low accuracy...", err1);
                // Try Low Accuracy GPS with 8 second timeout
                Geolocation.getCurrentPosition(
                    (pos) => onSuccess(pos, true),
                    async (err2) => {
                        console.log("Low accuracy GPS failed, checking if IP location succeeded...", err2);
                        const ipFound = await ipPromise;
                        setTrackingLocation(false);
                        if (!ipFound) {
                            Alert.alert(
                                "Location Error",
                                `GPS search timed out (${err2?.message || 'timeout'}) and network location failed. Please verify your GPS settings.`
                            );
                        }
                    },
                    { enableHighAccuracy: false, timeout: 8000, maximumAge: 10000 }
                );
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
        );
    };

    useEffect(() => {
        if (trip) {
            setStatus(trip.status);
            if (token) {
                fetchSavedLocation();
                trackDeviceLocation();
            }
        }
    }, [trip, token]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!trip) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
                <Text style={{ fontSize: 16, color: '#64748B', fontWeight: '600' }}>No active trip selected</Text>
                <TouchableOpacity
                    style={{ marginTop: 20, backgroundColor: '#38BDF8', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 }}
                    onPress={onBack}
                >
                    <Text style={{ color: '#FFF', fontWeight: '700' }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handlePickup = async () => {
        if (!otpInput) {
            Alert.alert('Error', 'Please enter pickup OTP.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URLS.DELIVERY_PICKED_UP(trip.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    otp: otpInput.trim()
                })
            });
            const data = await response.json();
            if (response.ok) {
                setStatus('picked_up');
                setOtpInput(''); // Clear OTP input for delivery confirmation step
                Alert.alert('Success', 'Order marked as Picked Up! Trip Started.');
            } else {
                setError(data.message || data.error || 'Failed to mark as picked up');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleDeliver = async () => {
        if (!otpInput) {
            Alert.alert('Error', 'Please enter delivery OTP.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URLS.DELIVERY_DELIVERED(trip.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    otp: otpInput.trim(),
                    payment_collected: trip.order_type === 'cod',
                    payment_method: trip.order_type || 'cod'
                })
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert('Success', 'Order delivered successfully!');
                onConfirmOtp();
            } else {
                setError(data.message || data.error || 'Failed to verify OTP and deliver');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handlePickReturnImage = () => {
        Alert.alert(
            "Return Verification Photo",
            "Select an option to capture/upload photographic evidence for the return.",
            [
                {
                    text: "Take Photo",
                    onPress: () => {
                        const options = {
                            mediaType: 'photo',
                            quality: 0.8,
                            saveToPhotos: true,
                        };
                        launchCamera(options, (response) => {
                            if (response.assets && response.assets.length > 0) {
                                setReturnImage(response.assets[0]);
                            }
                        });
                    }
                },
                {
                    text: "Choose from Gallery",
                    onPress: () => {
                        const options = {
                            mediaType: 'photo',
                            quality: 0.8,
                        };
                        launchImageLibrary(options, (response) => {
                            if (response.assets && response.assets.length > 0) {
                                setReturnImage(response.assets[0]);
                            }
                        });
                    }
                },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    const handleReturn = async () => {
        if (!returnImage) {
            Alert.alert('Error', 'Return verification photo is mandatory.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            const filename = returnImage.uri.split('/').pop() || 'return.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('return_image', {
                uri: Platform.OS === 'android' ? returnImage.uri : returnImage.uri.replace('file://', ''),
                name: filename,
                type: type,
            });

            const response = await fetch(API_URLS.DELIVERY_RETURNED(trip.id), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert('Success', 'Order return marked successfully!');
                onConfirmOtp();
            } else {
                setError(data.message || data.error || 'Failed to submit return request');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

            {/* Map Background */}
            <View style={styles.mapBackgroundContainer}>
                <WebView
                    ref={mapRef}
                    originWhitelist={['*']}
                    source={{ html: getLeafletHtml(latitude, longitude, zoom) }}
                    style={styles.mapBackground}
                    domStorageEnabled={true}
                    javaScriptEnabled={true}
                />
            </View>

            {/* Top Back Header Overlay */}
            <TouchableOpacity
                style={styles.backButtonOverlay}
                onPress={onBack}
                activeOpacity={0.8}
            >
                <Text style={styles.backButtonText}>← Back to Dashboard</Text>
            </TouchableOpacity>

            <View style={styles.mapControls}>
                <View style={styles.zoomControls}>
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={() => setZoom(z => Math.min(18, z + 1))}
                    >
                        <Plus size={20} color="#64748B" />
                    </TouchableOpacity>
                    <View style={styles.divider} />
                    <TouchableOpacity
                        style={styles.controlButton}
                        onPress={() => setZoom(z => Math.max(10, z - 1))}
                    >
                        <Minus size={20} color="#64748B" />
                    </TouchableOpacity>
                </View>

                {/* GPS Refresh Button */}
                <TouchableOpacity
                    style={[styles.controlButton, { marginTop: 12 }]}
                    onPress={trackDeviceLocation}
                    activeOpacity={0.8}
                    disabled={trackingLocation}
                >
                    {trackingLocation ? (
                        <ActivityIndicator size="small" color="#38BDF8" />
                    ) : (
                        <Navigation size={20} color="#38BDF8" />
                    )}
                </TouchableOpacity>

                {/* External Maps Launcher Button */}
                <TouchableOpacity
                    style={[styles.controlButton, { marginTop: 12 }]}
                    onPress={openExternalNavigation}
                    activeOpacity={0.8}
                >
                    <MapPin size={20} color="#10B981" />
                </TouchableOpacity>
            </View>

            {/* Destination Card Container */}
            <View style={styles.bottomCardContainer}>
                <View style={styles.destinationCard}>
                    {/* Header Info */}
                    <View style={styles.cardHeader}>
                        <View style={styles.customerIconContainer}>
                            <FileText size={32} color="#94A3B8" />
                        </View>
                        <View style={styles.infoContent}>
                            <Text style={styles.destinationLabel}>
                                {status === 'picked_up' ? 'CURRENT DROP-OFF' : 'CURRENT PICKUP'}
                            </Text>
                            <Text style={styles.customerName}>
                                {status === 'picked_up'
                                    ? (trip.deliver_to?.customer_name || 'Customer')
                                    : (trip.pickup?.name || 'Pickup Center')}
                            </Text>
                            <Text style={styles.addressText} numberOfLines={2}>
                                {status === 'picked_up'
                                    ? `${trip.deliver_to?.address_line || ''}, ${trip.deliver_to?.city || ''}`
                                    : `${trip.pickup?.address || ''}, ${trip.pickup?.city || ''}`}
                            </Text>
                        </View>
                        <View style={styles.statsContent}>
                            <Text style={styles.distanceValue}>₹{trip.total_price}</Text>
                            <Text style={styles.distanceUnit}>{trip.order_type?.toUpperCase()}</Text>
                        </View>
                    </View>

                    {error && (
                        <Text style={styles.errorText}>{error}</Text>
                    )}

                    {loading ? (
                        <ActivityIndicator size="large" color="#38BDF8" style={{ marginBottom: 16 }} />
                    ) : (
                        <>
                            {status === 'assigned' || status === 'accepted' ? (
                                <View>
                                    <TextInput
                                        style={styles.otpInput}
                                        placeholder="ENTER PICKUP OTP"
                                        placeholderTextColor="#94A3B8"
                                        keyboardType="numeric"
                                        maxLength={6}
                                        value={otpInput}
                                        onChangeText={setOtpInput}
                                    />
                                    <TouchableOpacity
                                        style={styles.confirmButton}
                                        onPress={handlePickup}
                                        activeOpacity={0.8}
                                    >
                                        <CheckCircle size={20} color="#FFF" />
                                        <Text style={styles.confirmButtonText}>Confirm Pickup via OTP</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <View>
                                    <TextInput
                                        style={styles.otpInput}
                                        placeholder="ENTER DELIVERY OTP"
                                        placeholderTextColor="#94A3B8"
                                        keyboardType="numeric"
                                        maxLength={6}
                                        value={otpInput}
                                        onChangeText={setOtpInput}
                                    />
                                    <TouchableOpacity
                                        style={[styles.confirmButton, { backgroundColor: '#10B981', shadowColor: '#10B981' }]}
                                        onPress={handleDeliver}
                                        activeOpacity={0.8}
                                    >
                                        <Key size={20} color="#FFF" />
                                        <Text style={styles.confirmButtonText}>Confirm Delivery via OTP</Text>
                                    </TouchableOpacity>

                                    {/* ── Return Verification Flow ── */}
                                    <View style={styles.returnContainer}>
                                        <View style={styles.returnDivider} />
                                        <Text style={styles.returnSectionTitle}>RETURN VERIFICATION</Text>
                                        
                                        {returnImage ? (
                                            <View style={styles.imagePreviewContainer}>
                                                <Image source={{ uri: returnImage.uri }} style={styles.previewImage} />
                                                <TouchableOpacity style={styles.changePhotoButton} onPress={handlePickReturnImage} activeOpacity={0.7}>
                                                    <Text style={styles.changePhotoText}>Change Photo</Text>
                                                </TouchableOpacity>
                                            </View>
                                        ) : (
                                            <TouchableOpacity style={styles.uploadPlaceholder} onPress={handlePickReturnImage} activeOpacity={0.7}>
                                                <Camera size={24} color="#64748B" />
                                                <Text style={styles.uploadPlaceholderText}>Capture Return Verification Photo *</Text>
                                            </TouchableOpacity>
                                        )}

                                        <TouchableOpacity
                                            style={[
                                                styles.confirmButton,
                                                {
                                                    backgroundColor: returnImage ? '#EF4444' : '#94A3B8',
                                                    shadowColor: returnImage ? 'rgba(239, 68, 68, 0.4)' : 'transparent',
                                                    marginTop: 12
                                                }
                                            ]}
                                            onPress={handleReturn}
                                            disabled={!returnImage || loading}
                                            activeOpacity={0.8}
                                        >
                                            <CheckCircle size={20} color="#FFF" />
                                            <Text style={styles.confirmButtonText}>Confirm Return on Server</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </>
                    )}

                    {/* Secondary Actions */}
                    <View style={styles.actionRow}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => {
                                const phoneNum = status === 'picked_up' ? trip.deliver_to?.phone : '';
                                if (phoneNum) {
                                    Alert.alert('Calling', `Dialing customer: ${phoneNum}`);
                                } else {
                                    Alert.alert('Calling', 'Call service not available');
                                }
                            }}
                        >
                            <Phone size={18} color="#64748B" fill="#64748B" />
                            <Text style={styles.actionButtonText}>Call</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => Alert.alert('Message', 'Chat messaging coming soon!')}
                        >
                            <MessageSquare size={18} color="#64748B" fill="#64748B" />
                            <Text style={styles.actionButtonText}>Message</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Bottom Tab Bar */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={onBack}>
                    <Home size={24} color="#94A3B8" />
                    <Text style={styles.navText}>HOME</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={onNavigateTrips}>
                    <Truck size={24} color="#38BDF8" />
                    <Text style={[styles.navText, styles.activeNavText]}>DELIVERIES</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={onNavigateEarnings}>
                    <CircleDollarSign size={24} color="#94A3B8" />
                    <Text style={styles.navText}>EARNINGS</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={onNavigateProfile}>
                    <User size={24} color="#94A3B8" />
                    <Text style={styles.navText}>PROFILE</Text>
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
    mapBackgroundContainer: {
        ...StyleSheet.absoluteFillObject,
        width: width,
        height: height,
    },
    mapBackground: {
        width: '100%',
        height: '100%',
    },
    mapControls: {
        position: 'absolute',
        right: 20,
        top: 200,
        alignItems: 'center',
    },
    zoomControls: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    controlButton: {
        width: 48,
        height: 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginHorizontal: 8,
    },
    bottomCardContainer: {
        position: 'absolute',
        bottom: 100,
        width: '100%',
        paddingHorizontal: 16,
    },
    destinationCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    customerIconContainer: {
        width: 64,
        height: 64,
        backgroundColor: '#F1F5F9',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContent: {
        flex: 1,
        marginLeft: 16,
    },
    destinationLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#38BDF8',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    customerName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 4,
    },
    addressText: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
        lineHeight: 18,
    },
    statsContent: {
        alignItems: 'flex-end',
    },
    distanceValue: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1E293B',
    },
    distanceUnit: {
        fontSize: 12,
        fontWeight: '700',
        color: '#94A3B8',
        marginTop: -4,
    },
    timeValue: {
        fontSize: 12,
        fontWeight: '700',
        color: '#38BDF8',
        marginTop: 4,
    },
    confirmButton: {
        backgroundColor: '#38BDF8',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 16,
        shadowColor: '#38BDF8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    confirmButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '800',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F1F5F9',
        height: 48,
        borderRadius: 16,
        gap: 8,
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        flexDirection: 'row',
        backgroundColor: '#FFF',
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 32 : 16,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
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
    otpInput: {
        backgroundColor: '#F1F5F9',
        height: 56,
        borderRadius: 16,
        paddingHorizontal: 20,
        fontSize: 18,
        fontWeight: '700',
        color: '#1E293B',
        textAlign: 'center',
        letterSpacing: 4,
        marginBottom: 16,
    },
    backButtonOverlay: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 60 : 40,
        left: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 10,
    },
    backButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#1E293B',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 12,
    },
    returnContainer: {
        marginTop: 20,
        paddingTop: 16,
    },
    returnDivider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginBottom: 16,
    },
    returnSectionTitle: {
        fontSize: 12,
        fontWeight: '800',
        color: '#64748B',
        letterSpacing: 1,
        marginBottom: 12,
    },
    uploadPlaceholder: {
        height: 120,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#CBD5E1',
        borderStyle: 'dashed',
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    uploadPlaceholderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#64748B',
    },
    imagePreviewContainer: {
        position: 'relative',
        height: 160,
        borderRadius: 16,
        overflow: 'hidden',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    changePhotoButton: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    changePhotoText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFF',
    },
});

export default DeliveryTripScreen;
