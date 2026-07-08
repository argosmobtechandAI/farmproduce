import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ScrollView, Image,
    TouchableOpacity, TextInput, KeyboardAvoidingView,
    Platform, StatusBar, Alert, ActivityIndicator
} from 'react-native';
import { ChevronLeft, Camera, User, Mail, Phone, MapPin, Check } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProfile, updateProfile } from '../../store/slices/profileSlice';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const EditProfileScreen = ({ onBack, onSave }) => {
    const dispatch = useDispatch();
    const { profile, loading } = useSelector((state) => state.profile);
    console.log("profile", profile)
    const { user } = useSelector((state) => state.auth);

    const [fullName, setFullName] = useState(user?.username || '');
    const [email, setEmail] = useState(profile?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [location, setLocation] = useState(user?.location || '');
    const [profileImage, setProfileImage] = useState(profile?.profile_image || null);
    const [imageFile, setImageFile] = useState(null);

    useEffect(() => {
        if (!profile) dispatch(fetchProfile());
    }, [dispatch]);

    // ── Image Picker ──────────────────────────────────────────────────────────
    const handleImagePicker = () => {
        Alert.alert('Update Profile Picture', 'Choose an option', [
            {
                text: 'Take Photo',
                onPress: () =>
                    launchCamera({ mediaType: 'photo', quality: 0.8 }, handleImageResponse),
            },
            {
                text: 'Choose from Gallery',
                onPress: () =>
                    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, handleImageResponse),
            },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    const handleImageResponse = (response) => {
        if (response.didCancel || response.errorCode) return;
        const asset = response.assets?.[0];
        if (asset) {
            setProfileImage(asset.uri);  // instant preview
            setImageFile(asset);         // store for upload
        }
    };

    // ── Update Profile ────────────────────────────────────────────────────────
    const handleUpdateProfile = async () => {
        const formData = new FormData();
        formData.append('username', fullName);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('location', location);

        if (imageFile) {
            formData.append('profile_image', {
                uri: imageFile.uri,
                type: imageFile.type || 'image/jpeg',
                name: imageFile.fileName || 'profile.jpg',
            });
        }

        const result = await dispatch(updateProfile(formData));
        console.log("result", result)

        if (updateProfile.fulfilled.match(result)) {
            dispatch(fetchProfile()); // refresh redux state
            Alert.alert('Success', 'Profile updated successfully!', [
                { text: 'OK', onPress: () => onSave?.() },
            ]);
        } else {
            Alert.alert('Error', result.payload || 'Failed to update profile.');
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
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile} disabled={loading}>
                        <Check size={24} color="#38BDF8" />
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                        <View style={styles.avatarSection}>
                            <View style={styles.avatarContainer}>
                                <Image
                                    source={{ uri: profileImage }}
                                    style={styles.avatar}
                                />
                                <TouchableOpacity style={styles.cameraButton} onPress={handleImagePicker}>
                                    <Camera size={18} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity onPress={handleImagePicker}>
                                <Text style={styles.changePhotoText}>Change Profile Picture</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formSection}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Full Name</Text>
                                <View style={styles.inputWrapper}>
                                    <View style={styles.iconBox}><User size={20} color="#94A3B8" /></View>
                                    <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Enter your full name" placeholderTextColor="#94A3B8" />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Email Address</Text>
                                <View style={styles.inputWrapper}>
                                    <View style={styles.iconBox}><Mail size={20} color="#94A3B8" /></View>
                                    <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Enter your email" placeholderTextColor="#94A3B8" keyboardType="email-address" autoCapitalize="none" />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Phone Number</Text>
                                <View style={styles.inputWrapper}>
                                    <View style={styles.iconBox}><Phone size={20} color="#94A3B8" /></View>
                                    <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Enter your phone number" placeholderTextColor="#94A3B8" keyboardType="phone-pad" />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Location</Text>
                                <View style={styles.inputWrapper}>
                                    <View style={styles.iconBox}><MapPin size={20} color="#94A3B8" /></View>
                                    <TextInput style={styles.input} value={location} onChangeText={setLocation} placeholder="Enter your location" placeholderTextColor="#94A3B8" />
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.updateButton, loading && { opacity: 0.7 }]}
                            onPress={handleUpdateProfile}
                            disabled={loading}
                        >
                            {loading
                                ? <ActivityIndicator color="#FFFFFF" />
                                : <Text style={styles.updateButtonText}>Update Profile</Text>
                            }
                        </TouchableOpacity>

                    </ScrollView>
                </KeyboardAvoidingView>
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
    saveButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 40,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 40,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#F8FAFC',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 5,
        right: 5,
        backgroundColor: '#38BDF8',
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    changePhotoText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#38BDF8',
    },
    formSection: {
        gap: 20,
        marginBottom: 40,
    },
    inputGroup: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: '#64748B',
        marginLeft: 4,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        height: 56,
        paddingHorizontal: 12,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1E293B',
        fontWeight: '500',
    },
    updateButton: {
        backgroundColor: '#38BDF8',
        height: 56,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#38BDF8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    updateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default EditProfileScreen;
