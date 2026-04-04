import { useState } from 'react'
import { Form, Input, Button, Card, Typography, Alert } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const { Title } = Typography

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Already logged in — redirect
  if (user) {
    navigate(user.role === 'Admin' ? '/admin/dashboard' : '/doctor/dashboard', { replace: true })
  }

  async function onFinish(values: { username: string; password: string }) {
    setLoading(true)
    setError(null)
    try {
      await login(values.username, values.password)
      const raw = localStorage.getItem('hf_auth')
      const u = raw ? JSON.parse(raw) : null
      navigate(u?.role === 'Admin' ? '/admin/dashboard' : '/doctor/dashboard', { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
      <Card style={{ width: 380 }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 8 }}>
          HealthFirst
        </Title>
        <p style={{ textAlign: 'center', color: '#888', marginBottom: 24 }}>Admin &amp; Doctor Portal</p>
        {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input size="large" placeholder="admin or dr.lastname" autoFocus />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password size="large" placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block loading={loading}>
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}
