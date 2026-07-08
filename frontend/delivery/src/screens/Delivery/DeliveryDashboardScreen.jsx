import React, { useState, useEffect, useRef } from 'react';
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
    Switch,
    ActivityIndicator,
    RefreshControl,
    PermissionsAndroid,
    Alert,
    Linking,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Menu,
    Bell,
    Navigation,
    Home,
    Truck,
    CircleDollarSign,
    User,
    Play,
    Leaf,
    Egg,
    Plus,
    Minus,
    X,
    Check,
    Trash2,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { API_URLS, GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_DARK_STYLE } from '../../config/api';
import Geolocation from '@react-native-community/geolocation';
import messaging from '@react-native-firebase/messaging';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

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

        /* Sleek Modern Floating Tooltip */
        .custom-tooltip {
            background-color: rgba(15, 23, 42, 0.9) !important; /* Slate 900 */
            color: #38BDF8 !important; /* Neon blue */
            border: 1px solid rgba(56, 189, 248, 0.4) !important;
            border-radius: 6px !important;
            padding: 4px 8px !important;
            font-size: 10px !important;
            font-family: system-ui, -apple-system, sans-serif !important;
            font-weight: 800 !important;
            box-shadow: 0 4px 10px rgba(56, 189, 248, 0.25) !important;
            white-space: nowrap !important;
        }
        .custom-tooltip::before {
            border-top-color: rgba(15, 23, 42, 0.9) !important;
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

        window.updateLocation = function(newLat, newLon, newZoom, locationName) {
            map.panTo([newLat, newLon]);
            marker.setLatLng([newLat, newLon]);
            if (newZoom !== undefined) {
                map.setZoom(newZoom);
            }
            if (locationName) {
                marker.unbindTooltip();
                marker.bindTooltip(locationName, {
                    permanent: true,
                    direction: 'top',
                    className: 'custom-tooltip',
                    offset: [0, -15]
                }).openTooltip();
            }
        };
    </script>
</body>
</html>
`;

const AssignedDeliveryCard = ({ id, order_id, status, price, pickup, dropoff, isActive, onStartTrip, onAccept, onDecline }) => (
    <View style={styles.deliveryCard}>
        <View style={styles.deliveryHeader}>
            <View style={styles.itemInfo}>
                <View style={[styles.itemIconContainer, { backgroundColor: isActive ? '#F0F9FF' : '#F8FAFC' }]}>
                    <Leaf size={20} color={isActive ? '#38BDF8' : '#94A3B8'} />
                </View>
                <View>
                    <Text style={styles.orderIdText}>Order #{order_id}</Text>
                    <Text style={styles.itemText}>
                        {status === 'picked_up' ? 'In Transit' : (status === 'accepted' ? 'Accepted' : 'Assigned')}
                    </Text>
                </View>
            </View>
            <Text style={[styles.priceText, { color: isActive ? '#38BDF8' : '#1E293B' }]}>₹{price}</Text>
        </View>

        <View style={styles.routeContainer}>
            {/* Timeline Line */}
            <View style={styles.timelineLine} />

            {/* Pickup */}
            <View style={styles.routePoint}>
                <View style={[styles.pointDot, { backgroundColor: isActive ? '#38BDF8' : '#CBD5E1' }]} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.pointLabel}>PICKUP FROM</Text>
                    <Text style={styles.pointName}>{pickup?.name || 'Pickup Center'}</Text>
                    <Text style={styles.addressText} numberOfLines={1}>{pickup?.address || 'Pickup Address'}</Text>
                </View>
            </View>

            {/* Dropdown */}
            <View style={[styles.routePoint, { marginTop: 24 }]}>
                <View style={[styles.pointDotHollow, { borderColor: isActive ? '#38BDF8' : '#CBD5E1' }]} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.pointLabel}>DROP-OFF TO</Text>
                    <Text style={styles.pointName}>{dropoff?.customer_name || 'Customer'}</Text>
                    <Text style={styles.addressText} numberOfLines={1}>
                        {dropoff?.address_line ? `${dropoff.address_line}, ${dropoff.city}` : 'Delivery Address'}
                    </Text>
                </View>
            </View>
        </View>

        {isActive && (
            status === 'assigned' ? (
                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.declineButton]}
                        activeOpacity={0.8}
                        onPress={onDecline}
                    >
                        <X size={18} color="#EF4444" />
                        <Text style={styles.declineButtonText}>Decline</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.acceptButton]}
                        activeOpacity={0.8}
                        onPress={onAccept}
                    >
                        <Check size={18} color="#FFF" />
                        <Text style={styles.acceptButtonText}>Accept</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <TouchableOpacity
                    style={[styles.startTripButton, { backgroundColor: status === 'picked_up' ? '#10B981' : '#38BDF8' }]}
                    activeOpacity={0.8}
                    onPress={onStartTrip}
                >
                    <Play size={20} color="#FFF" fill="#FFF" />
                    <Text style={styles.startTripText}>{status === 'picked_up' ? 'Resume Trip' : 'Start Trip'}</Text>
                </TouchableOpacity>
            )
        )}
    </View>
);

const DeliveryDashboardScreen = ({ onLogout, onNavigateProfile, onStartTrip, onNavigateTrips, onNavigateEarnings }) => {
    const { token } = useAuth();
    const [isOnline, setIsOnline] = useState(true);
    const [deliveries, setDeliveries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const [latitude, setLatitude] = useState(28.6139);
    const [longitude, setLongitude] = useState(77.2090);
    const [zoom, setZoom] = useState(14);
    const [trackingLocation, setTrackingLocation] = useState(false);
    const [locationName, setLocationName] = useState('');

    const mapRef = useRef(null);

    const fetchLocationName = async (lat, lon) => {
        try {
            // Local landmark proximity check
            const distBlueSapphire = Math.sqrt(Math.pow(lat - 28.6096, 2) + Math.pow(lon - 77.4243, 2));
            const distGaurCityMall = Math.sqrt(Math.pow(lat - 28.6083, 2) + Math.pow(lon - 77.4304, 2));
            
            if (distBlueSapphire < 0.006) {
                setLocationName("Blue Sapphire, Noida Extension");
                return;
            } else if (distGaurCityMall < 0.006) {
                setLocationName("Gaur City Mall, Noida Extension");
                return;
            }

            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`, {
                headers: {
                    'User-Agent': 'FreshFarmDeliveryApp/1.0'
                }
            });
            const data = await response.json();
            if (data && data.address) {
                const addr = data.address;
                
                // Replace administrative "Dadri" with "Gaur City" or "Noida Extension" in Noida Extension bounds
                if (lat >= 28.58 && lat <= 28.63 && lon >= 77.40 && lon <= 77.45) {
                    if (addr.suburb === 'Dadri') addr.suburb = 'Gaur City';
                    if (addr.city === 'Dadri') addr.city = 'Noida Extension';
                    if (addr.village === 'Dadri') addr.village = 'Noida Extension';
                }

                // Prioritize specific building/place names
                const place = addr.mall || addr.shopping_centre || addr.shop || addr.building || addr.amenity || addr.tourism || addr.leisure || addr.house_name;
                const road = addr.road || addr.highway;
                const suburb = addr.neighbourhood || addr.suburb || addr.city_district;
                const city = addr.city || addr.town || addr.village;
                
                let parts = [];
                if (place) parts.push(place);
                if (road) parts.push(road);
                if (suburb && (!place || !place.includes(suburb))) parts.push(suburb);
                
                // If we don't have enough specific parts, append the city name
                if (parts.length < 2 && city) {
                    parts.push(city);
                }
                
                // Final join
                if (parts.length > 0) {
                    let parsedName = parts.slice(0, 2).join(', ').trim();
                    parsedName = parsedName.replace(/\bDadri\b/gi, 'Noida Extension');
                    setLocationName(parsedName);
                } else {
                    const fallbackParts = data.display_name.split(',');
                    let parsedName = fallbackParts.slice(0, 2).join(', ').trim();
                    parsedName = parsedName.replace(/\bDadri\b/gi, 'Noida Extension');
                    setLocationName(parsedName);
                }
            } else if (data && data.display_name) {
                const fallbackParts = data.display_name.split(',');
                let parsedName = fallbackParts.slice(0, 2).join(', ').trim();
                parsedName = parsedName.replace(/\bDadri\b/gi, 'Noida Extension');
                setLocationName(parsedName);
            }
        } catch (err) {
            console.log("Error reverse geocoding coordinates:", err);
        }
    };

    useEffect(() => {
        if (latitude && longitude) {
            fetchLocationName(latitude, longitude);
        }
    }, [latitude, longitude]);

    // Live tracking location watch effect when online
    useEffect(() => {
        let watchId = null;
        if (isOnline && token) {
            watchId = Geolocation.watchPosition(
                async (pos) => {
                    const latVal = pos.coords.latitude;
                    const lonVal = pos.coords.longitude;
                    setLatitude(latVal);
                    setLongitude(lonVal);
                    
                    try {
                        await fetch(API_URLS.DELIVERY_LOCATION_UPDATE, {
                            method: 'PATCH',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                latitude: parseFloat(latVal.toFixed(6)),
                                longitude: parseFloat(lonVal.toFixed(6))
                            })
                        });
                    } catch (e) {
                        console.log("Live coordinate update failed:", e);
                    }
                },
                (err) => {
                    console.log("GPS Watch Error:", err.code, err.message);
                },
                {
                    enableHighAccuracy: true,
                    distanceFilter: 10, // Update every 10 meters
                    interval: 10000,    // Update every 10 seconds
                    fastestInterval: 5000
                }
            );
        }
        return () => {
            if (watchId !== null) {
                Geolocation.clearWatch(watchId);
            }
        };
    }, [isOnline, token]);

    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.injectJavaScript(`
                if (window.updateLocation) {
                    window.updateLocation(${latitude}, ${longitude}, ${zoom}, "${locationName.replace(/"/g, '\\"')}");
                }
                true;
            `);
        }
    }, [latitude, longitude, zoom, locationName]);

    // Notifications state
    const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
    const [notifications, setNotifications] = useState([
        {
            id: 'welcome',
            title: 'Welcome to FreshFarm',
            body: 'Your delivery boy profile is verified and active. Happy delivering!',
            time: '1h ago',
            unread: true,
        }
    ]);

    const handleMarkAsRead = (id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, unread: false } : n)
        );
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, unread: false }))
        );
    };

    const handleClearAll = () => {
        setNotifications([]);
    };

    useEffect(() => {
        if (deliveries.length > 0) {
            const newNotifications = deliveries.map(d => ({
                id: `delivery-${d.id}`,
                title: 'New Delivery Assigned',
                body: `Order #${d.order_id} is assigned. Pick up from ${d.pickup?.name || 'Collection Center'}.`,
                time: 'Just now',
                unread: true
            }));

            setNotifications(prev => {
                const existingIds = new Set(prev.map(n => n.id));
                const filteredNew = newNotifications.filter(n => !existingIds.has(n.id));
                if (filteredNew.length === 0) return prev;
                return [...filteredNew, ...prev];
            });
        }
    }, [deliveries]);

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

    // const trackDeviceLocation = async () => {
    //     if (trackingLocation) return;
    //     setTrackingLocation(true);

    //     const onSuccess = async (position, isGPS = false) => {
    //         const { latitude, longitude } = position.coords;
    //         setLatitude(latitude);
    //         setLongitude(longitude);
    //         if (isGPS) {
    //             setTrackingLocation(false);
    //         }

    //         // Update location on backend
    //         try {
    //             await fetch(API_URLS.DELIVERY_LOCATION_UPDATE, {
    //                 method: 'PATCH',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'Authorization': `Bearer ${token}`
    //                 },
    //                 body: JSON.stringify({
    //                     latitude: parseFloat(latitude.toFixed(6)),
    //                     longitude: parseFloat(longitude.toFixed(6))
    //                 })
    //             });
    //         } catch (err) {
    //             console.log("Error updating location on backend:", err);
    //         }
    //     };

    //     const runIPFallback = async () => {
    //         console.log("Fetching instant IP location...");

    //         const fetchWithTimeout = async (url, ms = 4000) => {
    //             const controller = new AbortController();
    //             const timeoutId = setTimeout(() => controller.abort(), ms);
    //             try {
    //                 const response = await fetch(url, { signal: controller.signal });
    //                 clearTimeout(timeoutId);
    //                 return response;
    //             } catch (err) {
    //                 clearTimeout(timeoutId);
    //                 throw err;
    //             }
    //         };

    //         try {
    //             const response = await fetchWithTimeout('https://ipinfo.io/json');
    //             const ipData = await response.json();
    //             if (ipData.loc) {
    //                 const [latStr, lonStr] = ipData.loc.split(',');
    //                 onSuccess({
    //                     coords: {
    //                         latitude: parseFloat(latStr),
    //                         longitude: parseFloat(lonStr)
    //                     }
    //                 }, false);
    //                 return true;
    //             }
    //         } catch (e) {
    //             console.log("ipinfo failed, trying freeipapi...", e);
    //         }

    //         try {
    //             const response2 = await fetchWithTimeout('https://freeipapi.com/api/json');
    //             const ipData2 = await response2.json();
    //             if (ipData2.latitude && ipData2.longitude) {
    //                 onSuccess({
    //                     coords: {
    //                         latitude: parseFloat(ipData2.latitude),
    //                         longitude: parseFloat(ipData2.longitude)
    //                     }
    //                 }, false);
    //                 return true;
    //             }
    //         } catch (e2) {
    //             console.log("All IP location services failed:", e2);
    //         }
    //         return false;
    //     };

    //     // Trigger IP fallback in parallel immediately so map updates instantly
    //     const ipPromise = runIPFallback();

    //     const hasPermission = await requestLocationPermission();
    //     if (!hasPermission) {
    //         await fetchSavedLocation();
    //         console.log("Location permission denied, using IP fallback only.");
    //         // const ipFound = await ipPromise;
    //         setTrackingLocation(false);
    //         // if (!ipFound) {
    //         //     Alert.alert(
    //         //         "Location Error",
    //         //         "Location permission denied and network-based location failed. Please enable permissions or check your internet."
    //         //     );
    //         // }
    //         return;
    //     }

    //     // Try High Accuracy GPS first with 10 second timeout
    //     Geolocation.getCurrentPosition(
    //         async (pos) => {
    //             const { latitude, longitude } = pos.coords;
    //             setLatitude(latitude);
    //             setLongitude(longitude);
    //             setTrackingLocation(false);
    //             // backend update...
    //         },
    //         async (err) => {
    //             console.log("GPS failed:", err);
    //             await fetchSavedLocation(); // fallback to backend
    //             setTrackingLocation(false);
    //         },
    //         {
    //             enableHighAccuracy: false,
    //             timeout: 25000,
    //             maximumAge: 60000  // ← 1 min cached location accept karo
    //         }
    //     );
    // };

    const trackDeviceLocation = async () => {
        if (trackingLocation) return;
        setTrackingLocation(true);

        const hasPermission = await requestLocationPermission();
        if (!hasPermission) {
            setTrackingLocation(false);
            Alert.alert("Permission Denied", "Location permission required.");
            return;
        }

        // First try cached location (instant)
        Geolocation.getCurrentPosition(
            async (pos) => {
                setLatitude(pos.coords.latitude);
                setLongitude(pos.coords.longitude);
                setTrackingLocation(false);
                try {
                    await fetch(API_URLS.DELIVERY_LOCATION_UPDATE, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            latitude: parseFloat(pos.coords.latitude.toFixed(6)),
                            longitude: parseFloat(pos.coords.longitude.toFixed(6))
                        })
                    });
                } catch (e) { console.log("Backend update failed:", e); }
            },
            async (err) => {
                console.log("GPS Error:", err.code, err.message);
                // Fallback: use backend saved location
                await fetchSavedLocation();
                setTrackingLocation(false);
            },
            {
                enableHighAccuracy: false,  // LOW accuracy - faster, works indoors
                timeout: 20000,
                maximumAge: 300000,         // Accept 5 min old cached location
                forceRequestLocation: true, // Android specific - forces fresh read
            }
        );
    };


    const handleMapPress = () => {
        Alert.alert(
            "Map Options",
            "What would you like to do?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Open in Google Maps",
                    onPress: () => {
                        const url = Platform.select({
                            ios: `maps:0,0?q=${latitude},${longitude}`,
                            android: `geo:0,0?q=${latitude},${longitude}(My Location)`
                        });
                        Linking.openURL(url).catch(() => {
                            Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
                        });
                    }
                },
                { text: "Update GPS Location", onPress: () => trackDeviceLocation() }
            ]
        );
    };

    const registerFCMToken = async () => {
        try {
            const authStatus = await messaging().requestPermission();
            const enabled =
                authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                authStatus === messaging.AuthorizationStatus.PROVISIONAL;

            if (enabled) {
                const fcmToken = await messaging().getToken();
                if (fcmToken) {
                    console.log("FCM TOKEN FETCHED:", fcmToken);
                    const response = await fetch(API_URLS.DELIVERY_FCM_TOKEN, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ token: fcmToken })
                    });
                    const resData = await response.json();
                    console.log("FCM Registration Response:", resData);
                } else {
                    console.log("Failed to get FCM token");
                }
            } else {
                console.log("Notification permission not enabled");
            }
        } catch (error) {
            console.log("Error registering FCM token:", error);
        }
    };

    const fetchDeliveries = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        setError(null);
        try {
            const response = await fetch(API_URLS.DELIVERY_ASSIGNMENTS, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                // Filter active assignments (status is 'assigned', 'accepted', or 'picked_up')
                const active = (data.results || []).filter(
                    d => d.status === 'assigned' || d.status === 'accepted' || d.status === 'picked_up'
                );
                setDeliveries(active);
            } else {
                setError(data.message || data.error || 'Failed to fetch deliveries');
            }
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleAcceptDelivery = async (id) => {
        try {
            const response = await fetch(API_URLS.DELIVERY_ACCEPT(id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                Alert.alert("Success", "Delivery accepted successfully!");
                fetchDeliveries(false);
            } else {
                Alert.alert("Error", data.error || data.message || "Failed to accept delivery");
            }
        } catch (err) {
            Alert.alert("Error", err.message || "Failed to accept delivery");
        }
    };

    const handleDeclineDelivery = async (id) => {
        Alert.alert(
            "Decline Assignment",
            "Are you sure you want to decline this delivery assignment?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Decline",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const response = await fetch(API_URLS.DELIVERY_DECLINE(id), {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                }
                            });
                            const data = await response.json();
                            if (response.ok) {
                                Alert.alert("Declined", "Delivery declined. The assignment has been removed.");
                                fetchDeliveries(false);
                            } else {
                                Alert.alert("Error", data.error || data.message || "Failed to decline delivery");
                            }
                        } catch (err) {
                            Alert.alert("Error", err.message || "Failed to decline delivery");
                        }
                    }
                }
            ]
        );
    };

    const handleToggleOnline = async (value) => {
        setIsOnline(value);
        if (value) {
            trackDeviceLocation();
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchDeliveries(false);
    };

    useEffect(() => {
        if (token) {
            fetchDeliveries();
            fetchSavedLocation();
            registerFCMToken();
            // Delay so activity is fully ready (fixes ACTIVITY_NULL)
            const timer = setTimeout(() => trackDeviceLocation(), 1500);
            return () => clearTimeout(timer);
        }
    }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Custom Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.headerIconButton}>
                        <Menu size={24} color="#1E293B" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Delivery Partner</Text>
                    <TouchableOpacity
                        style={styles.notificationButton}
                        onPress={() => setIsNotificationsVisible(true)}
                    >
                        <Bell size={24} color="#38BDF8" />
                        {notifications.some(n => n.unread) && (
                            <View style={styles.badgeDot} />
                        )}
                    </TouchableOpacity>
                </View>

                {loading && !refreshing ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#38BDF8" />
                    </View>
                ) : (
                    <ScrollView
                        style={styles.scrollView}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={['#38BDF8']}
                            />
                        }
                    >
                        {/* Duty Status Card */}
                        <View style={styles.statusCard}>
                            <View>
                                <Text style={styles.statusTitle}>Duty Status</Text>
                                <Text style={styles.statusSubtitle}>
                                    You are currently {isOnline ? 'online' : 'offline'}
                                </Text>
                            </View>
                            <Switch
                                trackColor={{ false: '#E2E8F0', true: '#BAE6FD' }}
                                thumbColor={isOnline ? '#38BDF8' : '#94A3B8'}
                                ios_backgroundColor="#E2E8F0"
                                onValueChange={handleToggleOnline}
                                value={isOnline}
                            />
                        </View>

                        {/* Map Section */}
                        <View style={styles.mapCard}>
                            <WebView
                                ref={mapRef}
                                originWhitelist={['*']}
                                source={{ html: getLeafletHtml(latitude, longitude, zoom) }}
                                style={styles.mapImage}
                                domStorageEnabled={true}
                                javaScriptEnabled={true}
                            />

                            {/* Zoom & Options controls overlay */}
                            <View style={styles.zoomContainerOverlay}>
                                <TouchableOpacity
                                    style={styles.zoomOverlayButton}
                                    onPress={() => setZoom(z => Math.min(18, z + 1))}
                                    activeOpacity={0.7}
                                >
                                    <Plus size={16} color="#475569" />
                                </TouchableOpacity>
                                <View style={styles.zoomDivider} />
                                <TouchableOpacity
                                    style={styles.zoomOverlayButton}
                                    onPress={() => setZoom(z => Math.max(10, z - 1))}
                                    activeOpacity={0.7}
                                >
                                    <Minus size={16} color="#475569" />
                                </TouchableOpacity>
                                <View style={styles.zoomDivider} />
                                <TouchableOpacity
                                    style={styles.zoomOverlayButton}
                                    onPress={handleMapPress}
                                    activeOpacity={0.7}
                                >
                                    <Menu size={16} color="#475569" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.mapOverlay}
                                onPress={trackDeviceLocation}
                                activeOpacity={0.8}
                            >
                                <View style={styles.locationChip}>
                                    {trackingLocation ? (
                                        <ActivityIndicator size="small" color="#38BDF8" style={{ marginRight: 6 }} />
                                    ) : (
                                        <Navigation size={14} color="#38BDF8" fill="#38BDF8" />
                                    )}
                                    <Text style={styles.locationText} numberOfLines={1}>
                                        {trackingLocation
                                            ? 'Fetching Location...'
                                            : (isOnline ? (locationName ? `${locationName} (Tap to Update)` : 'GPS Active • Online (Tap to Update)') : 'GPS Inactive • Offline (Tap to Update)')}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        {/* Assigned Deliveries Header */}
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Assigned Deliveries</Text>
                            <View style={styles.activeBadge}>
                                <Text style={styles.activeBadgeText}>{deliveries.length} ACTIVE</Text>
                            </View>
                        </View>

                        {/* Error state */}
                        {error && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                                <TouchableOpacity style={styles.retryButton} onPress={() => fetchDeliveries(true)}>
                                    <Text style={styles.retryButtonText}>Retry</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Empty state */}
                        {!error && deliveries.length === 0 && (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyTextTitle}>No Active Deliveries</Text>
                                <Text style={styles.emptyTextSubtitle}>You don't have any active delivery assignments right now.</Text>
                            </View>
                        )}

                        {/* Delivery Cards */}
                        {!error && deliveries.map((delivery) => (
                            <AssignedDeliveryCard
                                key={delivery.id}
                                id={delivery.id}
                                order_id={delivery.order_id}
                                status={delivery.status}
                                price={delivery.total_price}
                                pickup={delivery.pickup}
                                dropoff={delivery.deliver_to}
                                isActive={true}
                                onStartTrip={() => onStartTrip(delivery)}
                                onAccept={() => handleAcceptDelivery(delivery.id)}
                                onDecline={() => handleDeclineDelivery(delivery.id)}
                            />
                        ))}
                    </ScrollView>
                )}
            </SafeAreaView>

            {/* Notifications Modal */}
            <Modal
                visible={isNotificationsVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsNotificationsVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Bell size={22} color="#1E293B" />
                                <Text style={styles.modalTitle}>Notifications</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.closeModalButton}
                                onPress={() => setIsNotificationsVisible(false)}
                            >
                                <X size={20} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        {/* Actions */}
                        {notifications.length > 0 && (
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.actionLink}
                                    onPress={handleMarkAllAsRead}
                                >
                                    <Check size={16} color="#38BDF8" style={{ marginRight: 4 }} />
                                    <Text style={styles.actionLinkText}>Mark all as read</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.actionLink}
                                    onPress={handleClearAll}
                                >
                                    <Trash2 size={16} color="#EF4444" style={{ marginRight: 4 }} />
                                    <Text style={[styles.actionLinkText, { color: '#EF4444' }]}>Clear all</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Notifications List */}
                        <ScrollView
                            style={styles.notificationsList}
                            contentContainerStyle={styles.notificationsListContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {notifications.length === 0 ? (
                                <View style={styles.emptyNotifications}>
                                    <View style={styles.emptyBellContainer}>
                                        <Bell size={48} color="#94A3B8" />
                                    </View>
                                    <Text style={styles.emptyNotificationsTitle}>All caught up!</Text>
                                    <Text style={styles.emptyNotificationsSubtitle}>
                                        You don't have any new notifications at the moment.
                                    </Text>
                                </View>
                            ) : (
                                notifications.map((n) => (
                                    <TouchableOpacity
                                        key={n.id}
                                        style={[
                                            styles.notificationItem,
                                            n.unread && styles.notificationItemUnread
                                        ]}
                                        onPress={() => handleMarkAsRead(n.id)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.notificationInfo}>
                                            <View style={styles.notificationHeaderRow}>
                                                <Text style={[
                                                    styles.notificationItemTitle,
                                                    n.unread && { fontWeight: '800', color: '#1E293B' }
                                                ]}>
                                                    {n.title}
                                                </Text>
                                                {n.unread && <View style={styles.unreadDot} />}
                                            </View>
                                            <Text style={styles.notificationItemBody}>{n.body}</Text>
                                            <Text style={styles.notificationItemTime}>{n.time}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Bottom Tab Bar */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Home size={24} color="#38BDF8" />
                    <Text style={[styles.navText, styles.activeNavText]}>HOME</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={onNavigateTrips}>
                    <Truck size={24} color="#94A3B8" />
                    <Text style={styles.navText}>MY TRIPS</Text>
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
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        height: 60,
    },
    headerIconButton: {
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
    notificationButton: {
        width: 40,
        height: 40,
        backgroundColor: '#F0F9FF',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 100,
    },
    statusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    statusTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 4,
    },
    statusSubtitle: {
        fontSize: 13,
        color: '#64748B',
        fontWeight: '500',
    },
    mapCard: {
        height: 180,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 24,
    },
    mapImage: {
        width: '100%',
        height: '100%',
    },
    mapOverlay: {
        position: 'absolute',
        bottom: 12,
        left: 12,
    },
    locationChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        maxWidth: width - 80,
    },
    locationText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#38BDF8',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1E293B',
    },
    activeBadge: {
        backgroundColor: '#F0F9FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    activeBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#38BDF8',
    },
    deliveryCard: {
        backgroundColor: '#FFF',
        borderRadius: 28,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    deliveryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    itemInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    itemIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    orderIdText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94A3B8',
    },
    itemText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1E293B',
    },
    priceText: {
        fontSize: 16,
        fontWeight: '800',
    },
    routeContainer: {
        marginBottom: 24,
        paddingLeft: 4,
    },
    timelineLine: {
        position: 'absolute',
        left: 7.5,
        top: 20,
        bottom: 20,
        width: 1,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    routePoint: {
        flexDirection: 'row',
        gap: 16,
    },
    pointDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginTop: 4,
        borderWidth: 3,
        borderColor: '#FFF',
        elevation: 1,
    },
    pointDotHollow: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginTop: 4,
        borderWidth: 2,
        backgroundColor: '#FFF',
    },
    pointLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: '#94A3B8',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    pointName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
    },
    distanceText: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
        marginTop: 2,
    },
    addressText: {
        fontSize: 12,
        color: '#94A3B8',
        fontWeight: '500',
        marginTop: 2,
    },
    startTripButton: {
        backgroundColor: '#38BDF8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 28,
        gap: 8,
        shadowColor: '#38BDF8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    startTripText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'space-between',
        marginTop: 16,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 48,
        borderRadius: 24,
        gap: 6,
        borderWidth: 1.5,
    },
    acceptButton: {
        backgroundColor: '#38BDF8',
        borderColor: '#38BDF8',
    },
    acceptButtonText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '700',
    },
    declineButton: {
        backgroundColor: '#FFF',
        borderColor: '#EF4444',
    },
    declineButtonText: {
        color: '#EF4444',
        fontSize: 15,
        fontWeight: '700',
    },
    bottomNav: {
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
    zoomContainerOverlay: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 4,
        alignItems: 'center',
        gap: 4,
    },
    zoomOverlayButton: {
        width: 28,
        height: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    zoomDivider: {
        width: 16,
        height: 1,
        backgroundColor: '#E2E8F0',
    },
    errorContainer: {
        padding: 20,
        backgroundColor: '#FEF2F2',
        borderRadius: 24,
        alignItems: 'center',
        marginBottom: 20,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
        marginBottom: 10,
    },
    retryButton: {
        backgroundColor: '#EF4444',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    retryButtonText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF',
        borderRadius: 28,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        borderStyle: 'dashed',
        marginBottom: 20,
    },
    emptyTextTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 4,
    },
    emptyTextSubtitle: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 18,
    },
    badgeDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EF4444',
        borderWidth: 1.5,
        borderColor: '#FFF',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        maxHeight: '80%',
        minHeight: '50%',
        paddingTop: 24,
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderColor: '#F1F5F9',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1E293B',
    },
    closeModalButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderColor: '#F1F5F9',
    },
    actionLink: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    actionLinkText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#38BDF8',
    },
    notificationsList: {
        flex: 1,
        marginTop: 12,
    },
    notificationsListContent: {
        paddingBottom: 24,
    },
    emptyNotifications: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyBellContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyNotificationsTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 6,
    },
    emptyNotificationsSubtitle: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 18,
    },
    notificationItem: {
        backgroundColor: '#F8FAFC',
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        flexDirection: 'row',
    },
    notificationItemUnread: {
        backgroundColor: '#F0F9FF',
        borderColor: '#E0F2FE',
    },
    notificationInfo: {
        flex: 1,
    },
    notificationHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    notificationItemTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#475569',
        flex: 1,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#38BDF8',
        marginLeft: 8,
    },
    notificationItemBody: {
        fontSize: 13,
        color: '#64748B',
        lineHeight: 18,
        marginBottom: 8,
    },
    notificationItemTime: {
        fontSize: 11,
        fontWeight: '600',
        color: '#94A3B8',
    },
});

export default DeliveryDashboardScreen;
