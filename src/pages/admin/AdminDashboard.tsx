import { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table } from 'antd'
import client from '../../api/client'

interface DashboardStats {
  todayTotal: number
  todayCompleted: number
  todayNoShow: number
  todayCancelled: number
  byDepartment: { departmentName: string; count: number }[]
  busiestSlots: { hour: number; count: number }[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    client.get('/admin/dashboard/stats').then((r) => setStats(r.data)).catch(() => {})
  }, [])

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Admin Dashboard</h2>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}><Card><Statistic title="Today Total" value={stats?.todayTotal ?? '—'} /></Card></Col>
        <Col span={6}><Card><Statistic title="Completed" value={stats?.todayCompleted ?? '—'} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="No-Show" value={stats?.todayNoShow ?? '—'} valueStyle={{ color: '#fa8c16' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="Cancelled" value={stats?.todayCancelled ?? '—'} valueStyle={{ color: '#ff4d4f' }} /></Card></Col>
      </Row>

      <Row gutter={16}>
        <Col span={14}>
          <Card title="Appointments by Department (Last 30 Days)">
            <Table
              dataSource={stats?.byDepartment ?? []}
              rowKey="departmentName"
              size="small"
              pagination={false}
              columns={[
                { title: 'Department', dataIndex: 'departmentName', key: 'departmentName' },
                { title: 'Appointments', dataIndex: 'count', key: 'count', align: 'right' },
              ]}
            />
          </Card>
        </Col>
        <Col span={10}>
          <Card title="Busiest Hours (Top 5)">
            <Table
              dataSource={stats?.busiestSlots ?? []}
              rowKey="hour"
              size="small"
              pagination={false}
              columns={[
                {
                  title: 'Hour',
                  dataIndex: 'hour',
                  key: 'hour',
                  render: (h) => `${String(h).padStart(2, '0')}:00`,
                },
                { title: 'Count', dataIndex: 'count', key: 'count', align: 'right' },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
