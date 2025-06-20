import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import { useDispatch, useSelector } from 'react-redux';

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

export default store;
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector; 