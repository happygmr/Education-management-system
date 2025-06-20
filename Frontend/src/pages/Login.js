import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
import axios from 'axios';

const { Title } = Typography;

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error } = useAppSelector(state => state.auth);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    dispatch(loginStart());
    try {
      const res = await axios.post('/api/auth/login', values);
      dispatch(loginSuccess(res.data));
      navigate('/');
    } catch (err) {
      dispatch(loginFailure(err.response?.data?.error || 'Login failed'));
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: 24, background: '#fff', borderRadius: 8 }}>
      <Title level={3} style={{ textAlign: 'center' }}>Admin Login</Title>
      {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Please enter your username' }]}>
          <Input autoFocus autoComplete="username" />
        </Form.Item>
        <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Please enter your password' }]}>
          <Input.Password autoComplete="current-password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login; 