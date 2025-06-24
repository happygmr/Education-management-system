import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { Layout, Menu, Button } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  FileDoneOutlined,
  LoginOutlined,
  LogoutOutlined,
  BookOutlined,
  BankOutlined
} from '@ant-design/icons';
import 'antd/dist/reset.css';
import './App.css';
import Login from './pages/Login';
import { useAppSelector, useAppDispatch } from './store';
import { logout } from './store/authSlice';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Attendance from './pages/Attendance';
import Results from './pages/Results';
import Classes from './pages/Classes';
import Subjects from './pages/Subjects';

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

const AppContent = () => {
  const { token } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const selectedKey = location.pathname.substring(1) || 'dashboard';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div className="logo" style={{ color: '#fff', textAlign: 'center', padding: 16, fontWeight: 'bold' }}>
          Edu Admin
        </div>
        <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]}>
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            <Link to="/">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="students" icon={<UserOutlined />}>
            <Link to="/students">Students</Link>
          </Menu.Item>
          <Menu.Item key="teachers" icon={<TeamOutlined />}>
            <Link to="/teachers">Teachers</Link>
          </Menu.Item>
          <Menu.Item key="classes" icon={<BankOutlined />}>
            <Link to="/classes">Classes</Link>
          </Menu.Item>
          <Menu.Item key="subjects" icon={<BookOutlined />}>
            <Link to="/subjects">Subjects</Link>
          </Menu.Item>
          <Menu.Item key="fees" icon={<DollarOutlined />}>
            <Link to="/fees">Fees</Link>
          </Menu.Item>
          <Menu.Item key="results" icon={<FileDoneOutlined />}>
            <Link to="/results">Results</Link>
          </Menu.Item>
          <Menu.Item key="attendance" icon={<UserOutlined />}>
            <Link to="/attendance">Attendance</Link>
          </Menu.Item>
          {!token && (
            <Menu.Item key="login" icon={<LoginOutlined />}>
              <Link to="/login">Login</Link>
            </Menu.Item>
          )}
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0, textAlign: 'right', paddingRight: 24 }}>
          {token && (
            <Button type="primary" icon={<LogoutOutlined />} onClick={handleLogout}>
              Sign Out
            </Button>
          )}
        </Header>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/students" element={<PrivateRoute><Students /></PrivateRoute>} />
              <Route path="/teachers" element={<PrivateRoute><Teachers /></PrivateRoute>} />
              <Route path="/classes" element={<PrivateRoute><Classes /></PrivateRoute>} />
              <Route path="/subjects" element={<PrivateRoute><Subjects /></PrivateRoute>} />
              <Route path="/fees" element={<PrivateRoute><Fees /></PrivateRoute>} />
              <Route path="/results" element={<PrivateRoute><Results /></PrivateRoute>} />
              <Route path="/attendance" element={<PrivateRoute><Attendance /></PrivateRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
