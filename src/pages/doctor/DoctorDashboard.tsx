import { useState, useEffect, useCallback } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Select, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import client from '../../api/client'
import { useAuth } from '../../auth/AuthContext'

interface DoctorStats {
  todayCount: number
  weekCount: number
  todayCompleted: number
  todayNoShow: number
}

interface DoctorAppointment {
  appointmentId: string
  patientName: string
  patientPhone: string
  reasonForVisit: string | null
  slotDate: string
  slotStart: string
  slotEnd: string
  status: string
}

const STATUS_COLORS: Record<string, string> = {
  Pending: 'blue',
  Confirmed: 'cyan',
  Completed: 'green',
  NoShow: 'orange',
  CancelledByPatient: 'red',
  CancelledByDoctor: 'red',
}

const UPDATABLE_STATUSES = ['Completed', 'NoShow', 'CancelledByDoctor']

export default function DoctorDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DoctorStats | null>(null)
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([])
  const [range, setRange] = useState<'today' | 'upcoming'>('today')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    client.get('/doctor/stats').then((r) => setStats(r.data)).catch(() => {})
  }, [])

  const loadAppointments = useCallback(() => {
    setLoading(true)
    client
      .get('/doctor/appointments', { params: { range } })
      .then((r) => setAppointments(r.data))
      .catch(() => message.error('Failed to load appointments'))
      .finally(() => setLoading(false))
  }, [range])

  useEffect(() => { loadAppointments() }, [loadAppointments])

  async function updateStatus(appointmentId: string, status: string) {
    try {
      await client.patch(`/doctor/appointments/${appointmentId}/status`, { status })
      setAppointments((prev) =>
        prev.map((a) => (a.appointmentId === appointmentId ? { ...a, status } : a))
      )
      message.success('Status updated')
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Update failed')
    }
  }

  const columns: ColumnsType<DoctorAppointment> = [
    { title: 'Time', dataIndex: 'slotStart', key: 'slotStart', width: 90 },
    { title: 'Patient', dataIndex: 'patientName', key: 'patientName' },
    { title: 'Phone', dataIndex: 'patientPhone', key: 'patientPhone', width: 120 },
    {
      title: 'Reason',
      dataIndex: 'reasonForVisit',
      key: 'reasonForVisit',
      render: (v) => v || <span className="text-gray-400">—</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s) => <Tag color={STATUS_COLORS[s] || 'default'}>{s}</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Select
          size="small"
          placeholder="Update status"
          style={{ width: 160 }}
          value={undefined}
          onChange={(val) => val && updateStatus(record.appointmentId, val)}
          options={UPDATABLE_STATUSES.map((s) => ({ label: s, value: s }))}
        />
      ),
    },
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Welcome, {user?.username}</h2>

      {/* Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}><Card><Statistic title="Today's Appointments" value={stats?.todayCount ?? '—'} /></Card></Col>
        <Col span={6}><Card><Statistic title="Completed Today" value={stats?.todayCompleted ?? '—'} valueStyle={{ color: '#52c41a' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="No-Shows Today" value={stats?.todayNoShow ?? '—'} valueStyle={{ color: '#fa8c16' }} /></Card></Col>
        <Col span={6}><Card><Statistic title="This Week" value={stats?.weekCount ?? '—'} /></Card></Col>
      </Row>

      {/* Appointments Table */}
      <Card
        title="Appointments"
        extra={
          <Select
            value={range}
            onChange={setRange}
            options={[
              { label: 'Today', value: 'today' },
              { label: 'Upcoming', value: 'upcoming' },
            ]}
            style={{ width: 130 }}
          />
        }
      >
        <Table
          columns={columns}
          dataSource={appointments}
          rowKey="appointmentId"
          loading={loading}
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  )
}
