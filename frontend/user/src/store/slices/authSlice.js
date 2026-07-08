import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    saveCredentials,
    clearCredentials as clearStoredCredentials,
    getCredentials,
    getToken
} from '../../utils/tokenStorage';
import { BASE_URL } from '../../api/api';

// ── Load stored auth on boot ──────────────────────────────────────────────────
export const loadAuthFromStorage = createAsyncThunk(
    'auth/loadFromStorage',
    async (_, { rejectWithValue }) => {
        try {
            const { token, user } = await getCredentials();
            return { token, user };
        } catch (err) {
            return rejectWithValue('Failed to load session');
        }
    }
);


// ── Register ──────────────────────────────────────────────────────────────────
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async ({ userName, email, phone, country_code = '+91' }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BASE_URL}/api/auth/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: userName,
                    email: email,
                    phone: phone,
                    role: 'user',
                    country_code: country_code,
                }),
            });
            const data = await response.json();

            if (!response.ok) {
                if (typeof data === 'object' && !data.message) {
                    const firstError = Object.values(data).flat()[0];
                    return rejectWithValue(firstError || 'Registration failed');
                }
                return rejectWithValue(data.message || data.error || 'Registration failed');
            }
            return data;

        } catch (err) {
            return rejectWithValue('Network error. Please try again.');
        }
    }
);

// ── Send OTP ──────────────────────────────────────────────────────────────────
export const sendOtp = createAsyncThunk(
    'auth/sendOtp',
    async ({ phone, country_code = '+91' }, { rejectWithValue }) => {
        try {
            console.log("-------------")
            const response = await fetch(`${BASE_URL}/api/auth/send-otp/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, country_code }),
            });
            console.log("response", response)

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || data.error || 'Failed to send OTP');
            }

            return data;
        } catch (err) {
            console.log("ppp", err)
            return rejectWithValue('Network error. Please try again.');
        }
    }
);

// ── Verify OTP ────────────────────────────────────────────────────────────────
export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async ({ phone, otp, country_code = '+91' }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BASE_URL}/api/auth/verify-otp/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp, country_code }),
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || data.error || 'Invalid OTP');
            }

            // Save token + user after successful OTP verification
            const token = data.token || data.access || data.access_token;
            const userData = data.user;
            if (token) {
                await saveCredentials(token, userData);
            }

            return { token, user: userData };
        } catch (err) {
            return rejectWithValue('Network error. Please try again.');
        }
    }
);

export const googleLogin = createAsyncThunk(
    'auth/googleLogin',
    async ({ idToken }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BASE_URL}/api/auth/google/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: idToken, role: 'user' }),
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || data.error || 'Google Login failed');
            }

            const token = data.token || data.access || data.access_token;
            const userData = data.user;
            if (token) {
                await saveCredentials(token, userData);
            }

            return { token, user: userData };
        } catch (err) {
            return rejectWithValue('Network error. Please try again.');
        }
    }
);

export const getCartItems = createAsyncThunk(
    'auth/getCartItems',
    async (_, { rejectWithValue }) => {
        try {
            const token = await getToken()
            console.log("ooooo", token)
            const response = await fetch(`${BASE_URL}/api/user/cart/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            console.log("ooooo", response)

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || data.error || 'Failed to get cart items');
            }

            return data.items;
        } catch (err) {
            return rejectWithValue('Network error. Please try again.');
        }
    }
);

// ── Logout ────────────────────────────────────────────────────────────────────
export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            await clearStoredCredentials();
            return true;
        } catch (err) {
            return rejectWithValue('Logout failed');
        }
    }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        cartItems: [],
        token: null,
        isAppReady: false,
        loading: false,
        error: null,
    },
    reducers: {
        setCredentials: (state, action) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
        },
        clearCredentials: (state) => {
            state.token = null;
            state.user = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        addproduct: (state, action) => {
            state.cartItems.push(action.payload);
        }
    },
    extraReducers: (builder) => {
        builder

            // ── loadAuthFromStorage ───────────────────────────────────────────────
            .addCase(loadAuthFromStorage.pending, (state) => {
                state.isAppReady = false;
            })
            .addCase(loadAuthFromStorage.fulfilled, (state, action) => {
                state.token = action.payload.token;
                state.user = action.payload.user;
                state.isAppReady = true;
            })
            .addCase(loadAuthFromStorage.rejected, (state) => {
                state.isAppReady = true;
            })

            // ── registerUser ──────────────────────────────────────────────────────
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = action.payload.user;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ── sendOtp ───────────────────────────────────────────────────────────
            .addCase(sendOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendOtp.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(sendOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ── verifyOtp ─────────────────────────────────────────────────────────
            .addCase(verifyOtp.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = action.payload.user;
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ── googleLogin ───────────────────────────────────────────────────────
            .addCase(googleLogin.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(googleLogin.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = action.payload.user;
            })
            .addCase(googleLogin.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // ── logoutUser ────────────────────────────────────────────────────────
            .addCase(logoutUser.fulfilled, (state) => {
                state.token = null;
                state.user = null;
                state.error = null;
            })
            .addCase(getCartItems.fulfilled, (state, action) => {
                state.loading = false;
                state.cartItems = action.payload;
            })
            .addCase(getCartItems.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    },
});

export const { setCredentials, clearCredentials, clearError, addproduct } = authSlice.actions;
export default authSlice.reducer;