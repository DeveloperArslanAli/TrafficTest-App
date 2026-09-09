import React, { useState } from 'react';
import {
  AppstoreOutlined,
  DashboardOutlined,
  GlobalOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
  CopyOutlined,
  CloudUploadOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Layout, Menu, theme, Tooltip, Typography, Badge } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDuplicates } from '../services/duplicates';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { data: duplicates } = useDuplicates('PENDING');
  const pendingDuplicatesCount = duplicates?.length || 0;

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/admin/questions',
      icon: <AppstoreOutlined />,
      label: 'Question Bank',
    },
    {
      key: '/admin/signs',
      icon: <SafetyCertificateOutlined />,
      label: 'Canonical Signs',
    },
    {
      key: '/admin/media',
      icon: <PictureOutlined />,
      label: 'Traffic Media & Pexels',
    },
    {
      key: '/admin/countries',
      icon: <GlobalOutlined />,
      label: 'Countries & Jurisdictions',
    },
    {
      key: '/admin/sources',
      icon: <BookOutlined />,
      label: 'Content Sources',
    },
    {
      key: '/admin/duplicates',
      icon: (
        <Badge count={pendingDuplicatesCount} size="small" offset={[10, 0]}>
          <CopyOutlined />
        </Badge>
      ),
      label: 'Duplicate Review',
    },
    {
      key: '/admin/content',
      icon: <CloudUploadOutlined />,
      label: 'Content Ingestion',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Derive active root key
  const matchedItem = menuItems.find((item) => location.pathname.startsWith(item.key));
  const activeKey = matchedItem ? matchedItem.key : '/admin/dashboard';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        width={240}
        style={{ background: '#001529' }}
      >
        {/* Logo */}
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? 0 : '0 20px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/admin/dashboard')}
        >
          <span style={{ fontSize: 24 }}>🛡️</span>
          {!collapsed && (
            <div style={{ marginLeft: 10 }}>
              <Text strong style={{ color: '#fff', fontSize: 15, letterSpacing: 0.5, display: 'block' }}>
                TrafficTest
              </Text>
              <Text style={{ color: '#8c8c8c', fontSize: 10 }}>Global Knowledge CMS</Text>
            </div>
          )}
        </div>

        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeKey]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ marginTop: 8 }}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          {/* Collapse toggle */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 18, width: 48, height: 48 }}
          />

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1677ff' }} />
            {user && (
              <Text strong style={{ fontSize: 14 }}>
                {user.name || user.email}
              </Text>
            )}
            <Tooltip title="Logout">
              <Button
                type="text"
                danger
                icon={<LogoutOutlined />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Tooltip>
          </div>
        </Header>

        <Content
          style={{
            margin: 24,
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
