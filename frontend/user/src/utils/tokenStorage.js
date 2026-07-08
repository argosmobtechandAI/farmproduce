import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
    ACCESS_TOKEN: 'access_token',
    USER: 'user',
};

// ── Save ──────────────────────────────────────────────────────────────────────
export const saveToken = async (token) => {
    await AsyncStorage.setItem(KEYS.ACCESS_TOKEN, token);
};

export const saveUser = async (user) => {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
};

export const saveCredentials = async (token, user) => {
    await AsyncStorage.multiSet([
        [KEYS.ACCESS_TOKEN, token],
        [KEYS.USER, JSON.stringify(user)],
    ]);
};

// ── Get ───────────────────────────────────────────────────────────────────────
export const getToken = async () => {
    return await AsyncStorage.getItem(KEYS.ACCESS_TOKEN);
};

export const getUser = async () => {
    const user = await AsyncStorage.getItem(KEYS.USER);
    return user ? JSON.parse(user) : null;
};

export const getCredentials = async () => {
    const token = await AsyncStorage.getItem(KEYS.ACCESS_TOKEN);
    const user = await AsyncStorage.getItem(KEYS.USER);
    return {
        token: token || null,
        user: user ? JSON.parse(user) : null,
    };
};

// ── Clear ─────────────────────────────────────────────────────────────────────
export const clearToken = async () => {
    await AsyncStorage.removeItem(KEYS.ACCESS_TOKEN);
};

export const clearCredentials = async () => {
    await AsyncStorage.multiRemove([KEYS.ACCESS_TOKEN, KEYS.USER]);
};