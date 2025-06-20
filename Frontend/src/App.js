import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  FileDoneOutlined,
  LoginOutlined
} from '@ant-design/icons';
import 'antd/dist/reset.css';
import './App.css';
import Login from './pages/Login';
import { useAppSelector } from './store';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Attendance from './pages/Attendance';
import Results from './pages/Results';

const { Header, Sider, Content } = Layout;

// Placeholder pages
const Fees = () => <div>Fee Creation & Management</div>;

function PrivateRoute({ children }) {
  const { token } = useAppSelector(state => state.auth);
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider breakpoint="lg" collapsedWidth="0">
          <div className="logo" style={{ color: '#fff', textAlign: 'center', padding: 16, fontWeight: 'bold' }}>
            Edu Admin
          </div>
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['dashboard']}>
            <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
              <a href="/">Dashboard</a>
            </Menu.Item>
            <Menu.Item key="students" icon={<UserOutlined />}>
              <a href="/students">Students</a>
            </Menu.Item>
            <Menu.Item key="teachers" icon={<TeamOutlined />}>
              <a href="/teachers">Teachers</a>
            </Menu.Item>
            <Menu.Item key="fees" icon={<DollarOutlined />}>
              <a href="/fees">Fees</a>
            </Menu.Item>
            <Menu.Item key="results" icon={<FileDoneOutlined />}>
              <a href="/results">Results</a>
            </Menu.Item>
            <Menu.Item key="login" icon={<LoginOutlined />}>
              <a href="/login">Login</a>
            </Menu.Item>
            <Menu.Item key="attendance" icon={<UserOutlined />}>
              <a href="/attendance">Attendance</a>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: 0, textAlign: 'right', paddingRight: 24 }}>
            {/* User info, logout, etc. */}
            Admin Panel
          </Header>
          <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
            <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/students" element={<PrivateRoute><Students /></PrivateRoute>} />
                <Route path="/teachers" element={<PrivateRoute><Teachers /></PrivateRoute>} />
                <Route path="/fees" element={<PrivateRoute><Fees /></PrivateRoute>} />
                <Route path="/results" element={<PrivateRoute><Results /></PrivateRoute>} />
                <Route path="/attendance" element={<PrivateRoute><Attendance /></PrivateRoute>} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </Content>
        </Layout>
      </Layout>
    </Router>
  );
}

export default App;
