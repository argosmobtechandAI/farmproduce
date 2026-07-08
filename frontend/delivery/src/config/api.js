import { Platform } from 'react-native';

// const BASE_URL = 'http://192.168.1.38:8000';
const BASE_URL = "http://187.127.149.81"

export const GOOGLE_MAPS_API_KEY = 'AIzaSyB3W28JkvwAH-3J7kG35KrD3f63TsfANdU';

export const GOOGLE_MAPS_DARK_STYLE = '&style=feature:all%7Celement:geometry%7Ccolor:0x1a2238&style=feature:all%7Celement:labels.text.fill%7Ccolor:0x8e9bb0&style=feature:all%7Celement:labels.text.stroke%7Ccolor:0x1a2238&style=feature:road%7Celement:geometry%7Ccolor:0x2d3748&style=feature:road%7Celement:geometry.stroke%7Ccolor:0x1a2238&style=feature:water%7Celement:geometry%7Ccolor:0x0f172a';

export const API_URLS = {
    BASE_URL,
    GOOGLE_LOGIN: `${BASE_URL}/api/auth/google/`,
    REGISTER: `${BASE_URL}/api/auth/register/`,
    SEND_OTP: `${BASE_URL}/api/auth/send-otp/`,
    VERIFY_OTP: `${BASE_URL}/api/auth/verify-otp/`,

    // Delivery Boy endpoints
    DELIVERY_ASSIGNMENTS: `${BASE_URL}/delivery/assignments/`,
    DELIVERY_ASSIGNMENT_DETAIL: (id) => `${BASE_URL}/delivery/assignments/${id}/`,
    DELIVERY_ACCEPT: (id) => `${BASE_URL}/delivery/assignments/${id}/accept/`,
    DELIVERY_DECLINE: (id) => `${BASE_URL}/delivery/assignments/${id}/decline/`,
    DELIVERY_FCM_TOKEN: `${BASE_URL}/delivery/fcm-token/`,
    DELIVERY_PICKED_UP: (id) => `${BASE_URL}/delivery/assignments/${id}/picked-up/`,
    DELIVERY_DELIVERED: (id) => `${BASE_URL}/delivery/assignments/${id}/delivered/`,
    DELIVERY_RETURNED: (id) => `${BASE_URL}/delivery/assignments/${id}/returned/`,
    DELIVERY_HISTORY: `${BASE_URL}/delivery/history/`,
    DELIVERY_EARNINGS: `${BASE_URL}/delivery/earnings/`,
    DELIVERY_LOCATION_UPDATE: `${BASE_URL}/delivery/location/`,

    // User Profile
    USER_PROFILE: `${BASE_URL}/delivery/profile/`,
    USER_PROFILE_UPDATE: `${BASE_URL}/api/user/profile/update/`,
};

export default API_URLS;

