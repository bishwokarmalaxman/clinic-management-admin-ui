import { Layout, Menu, Typography } from 'antd'
import {
  DashboardOutlined,
  CalendarOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  ScheduleOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const { Sider, Header, Content } = Layout
const { Text } = Typography

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const doctorItems = [
    { key: '/doctor/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/doctor/slots/block', icon: <CalendarOutlined />, label: 'Block Slots' },
  ]

  const adminItems = [
    { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/admin/appointments', icon: <ScheduleOutlined />, label: 'Appointments' },
    { key: '/admin/doctors', icon: <MedicineBoxOutlined />, label: 'Doctors' },
    { key: '/admin/departments', icon: <TeamOutlined />, label: 'Departments' },
  ]

  const menuItems = user?.role === 'Admin' ? adminItems : doctorItems

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} theme="dark">
        <div className="p-4 text-center">
          <Text strong style={{ color: '#fff', fontSize: 15 }}>
            HealthFirst
          </Text>
          <br />
          <Text style={{ color: '#aaa', fontSize: 12 }}>{user?.role} Panel</Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
        <div style={{ position: 'absolute', bottom: 16, width: '100%', paddingInline: 16 }}>
          <Menu
            theme="dark"
            mode="inline"
            selectable={false}
            items={[
              {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Logout',
                onClick: logout,
              },
            ]}
          />
        </div>
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', borderBottom: '1px solid #f0f0f0' }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Logged in as <strong>{user?.username}</strong>
          </Text>
        </Header>
        <Content style={{ padding: 24, background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
