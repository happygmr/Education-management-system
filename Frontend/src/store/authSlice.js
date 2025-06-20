import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));

const initialState = {
  user: user || null,
  token: token || null,
  roles: user?.roles || [],
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.roles = action.payload.user.roles;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    loginFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.roles = [];
      state.loading = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setUser(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.roles = action.payload.user.roles;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    }
  }
});

export const { loginStart, loginSuccess, loginFailure, logout, setUser } = authSlice.actions;
export default authSlice.reducer; 