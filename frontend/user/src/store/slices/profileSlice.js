import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
    saveCredentials,
    clearCredentials as clearStoredCredentials,
    getCredentials,
    getToken
} from '../../utils/tokenStorage';
import { BASE_URL } from '../../api/api';




// ── Fetch Profile ─────────────────────────────────────────────────────────────
export const fetchProfile = createAsyncThunk(
    'profile/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const token = await getToken()
            const response = await fetch(`${BASE_URL}/api/user/profile/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            })
            console.log("response", response)
            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to fetch profile');
            }
            console.log("data", data)
            return data;
        } catch (err) {
            return rejectWithValue('Network error');
        }
    }
);

// ── Update Profile ────────────────────────────────────────────────────────────
export const updateProfile = createAsyncThunk(
    'profile/updateProfile',
    async (payload, { rejectWithValue }) => {
        try {
            const token = await getToken()
            console.log("payload", payload, token)
            const response = await fetch(`${BASE_URL}/api/user/profile/update/`, {
                method: 'PATCH',
                body: payload,
                headers: {
                    // "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            console.log("response", response)
            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to update profile');
            }
            return data;
        } catch (err) {
            return rejectWithValue('Network error');
        }
    }
);

const profileSlice = createSlice({
    name: 'profile',
    initialState: {
        data: null,
        profile: null,
        loading: false,
        error: null,
        updateSuccess: false,
    },
    reducers: {
        clearUpdateSuccess: (state) => {
            state.updateSuccess = false;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetch
            .addCase(fetchProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
            })
            .addCase(fetchProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // update
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.updateSuccess = false;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
                state.updateSuccess = true;
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearUpdateSuccess } = profileSlice.actions;
export default profileSlice.reducer;