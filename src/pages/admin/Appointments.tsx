import { useEffect, useState, useCallback } from 'react'
import { Card, Table, Select, DatePicker, Button, Space, Tag, message } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import client from '../../api/client'

interface Appointment {
  appointmentId: string
  patientName: string
  patientPhone: string
  doctorName: string
  departmentName: string
  slotDate: string
  slotStart: string
  status: string
}

interface Department { id: number; name: string }
interface Doctor { id: number; name: string }

const STATUS_COLORS: Record<string, string> = {
  Pending: 'blue',
  Confirmed: 'cyan',
  Completed: 'green',
  NoShow: 'orange',
  CancelledByPatient: 'red',
  CancelledByDoctor: 'red',
}

const STATUS_OPTIONS = ['Pending', 'Confirmed', 'Completed', 'NoShow', 'CancelledByPatient', 'CancelledByDoctor']

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  const [departments, setDepartments] = useState<Department[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])

  const [filters, setFilters] = useState<{
    doctorId?: number
    departmentId?: number
    from?: string
    to?: string
    status?: string
  }>({})

  useEffect(() => {
    client.get('/admin/departments').then((r) => setDepartments(r.data)).catch(() => {})
    client.get('/admin/doctors').then((r) => setDoctors(r.data)).catch(() => {})
  }, [])

  const load = useCallback(() => {
    setLoading(true)
    client
      .get('/admin/appointments', { params: { ...filters, page, pageSize: 20 } })
      .then((r) => { setAppointments(r.data.items); setTotal(r.data.total) })
      .catch(() => message.error('Failed to load appointments'))
      .finally(() => setLoading(false))
  }, [filters, page])

  useEffect(() => { load() }, [load])

  async function handleExport() {
    try {
      const res = await client.get('/admin/appointments/export', {
        params: filters,
        responseType: 'blob',
      })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `appointments-${filters.from ?? 'all'}-${filters.to ?? 'all'}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      message.error('Export failed')
    }
  }

  const columns: ColumnsType<Appointment> = [
    { title: 'ID', dataIndex: 'appointmentId', key: 'appointmentId', render: (v) => <span className="font-mono text-xs">{v}</span> },
    { title: 'Patient', dataIndex: 'patientName', key: 'patientName' },
    { title: 'Phone', dataIndex: 'patientPhone', key: 'patientPhone', width: 120 },
    { title: 'Doctor', dataIndex: 'doctorName', key: 'doctorName' },
    { title: 'Department', dataIndex: 'departmentName', key: 'departmentName' },
    { title: 'Date', dataIndex: 'slotDate', key: 'slotDate', width: 110 },
    { title: 'Time', dataIndex: 'slotStart', key: 'slotStart', width: 90 },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s) => <Tag color={STATUS_COLORS[s] || 'default'}>{s}</Tag>,
    },
  ]

  return (
    <Card
      title="Appointments"
      extra={
        <Button icon={<DownloadOutlined />} onClick={handleExport}>
          Export CSV
        </Button>
      }
    >
      {/* Filters */}
      <Space wrap style={{ marginBottom: 16 }}>
        <Select
          placeholder="Department"
          allowClear
          style={{ width: 160 }}
          options={departments.map((d) => ({ label: d.name, value: d.id }))}
          onChange={(v) => { setFilters((f) => ({ ...f, departmentId: v })); setPage(1) }}
        />
        <Select
          placeholder="Doctor"
          allowClear
          style={{ width: 160 }}
          options={doctors.map((d) => ({ label: d.name, value: d.id }))}
          onChange={(v) => { setFilters((f) => ({ ...f, doctorId: v })); setPage(1) }}
        />
        <DatePicker.RangePicker
          onChange={(dates) => {
            setFilters((f) => ({
              ...f,
              from: dates?.[0]?.format('YYYY-MM-DD'),
              to: dates?.[1]?.format('YYYY-MM-DD'),
            }))
            setPage(1)
          }}
        />
        <Select
          placeholder="Status"
          allowClear
          style={{ width: 180 }}
          options={STATUS_OPTIONS.map((s) => ({ label: s, value: s }))}
          onChange={(v) => { setFilters((f) => ({ ...f, status: v })); setPage(1) }}
        />
      </Space>

      <Table
        columns={columns}
        dataSource={appointments}
        rowKey="appointmentId"
        loading={loading}
        size="small"
        pagination={{
          current: page,
          pageSize: 20,
          total,
          onChange: setPage,
          showTotal: (t) => `${t} total`,
        }}
      />
    </Card>
  )
}
