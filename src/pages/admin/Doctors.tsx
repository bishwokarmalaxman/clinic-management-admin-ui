import { useEffect, useState } from 'react'
import { Card, Table, Button, Modal, Form, Input, InputNumber, Select, Switch, message } from 'antd'
import { PlusOutlined, EditOutlined, ScheduleOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import client from '../../api/client'

interface Doctor {
  id: number
  name: string
  specialization: string
  qualification: string
  experienceYears: number
  photoUrl: string | null
  isActive: boolean
  departmentName: string
  hasActiveSchedule: boolean
}

interface Department { id: number; name: string }

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Doctor | null>(null)
  const [form] = Form.useForm()
  const navigate = useNavigate()

  function load() {
    setLoading(true)
    Promise.all([
      client.get('/admin/doctors'),
      client.get('/admin/departments'),
    ])
      .then(([dr, dp]) => { setDoctors(dr.data); setDepartments(dp.data) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing(null)
    form.resetFields()
    setModalOpen(true)
  }

  function openEdit(doc: Doctor) {
    setEditing(doc)
    const dept = departments.find((d) => d.name === doc.departmentName)
    form.setFieldsValue({
      name: doc.name,
      specialization: doc.specialization,
      qualification: doc.qualification,
      experienceYears: doc.experienceYears,
      photoUrl: doc.photoUrl,
      departmentId: dept?.id,
    })
    setModalOpen(true)
  }

  async function handleSave() {
    const values = await form.validateFields()
    try {
      if (editing) {
        await client.put(`/admin/doctors/${editing.id}`, values)
        message.success('Doctor updated')
      } else {
        await client.post('/admin/doctors', values)
        message.success('Doctor created')
      }
      setModalOpen(false)
      load()
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Save failed')
    }
  }

  async function toggleActive(doc: Doctor) {
    try {
      await client.patch(`/admin/doctors/${doc.id}/toggle-active`)
      load()
    } catch {
      message.error('Failed to toggle')
    }
  }

  const columns: ColumnsType<Doctor> = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Specialization', dataIndex: 'specialization', key: 'specialization' },
    { title: 'Department', dataIndex: 'departmentName', key: 'departmentName' },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (_, record) => <Switch checked={record.isActive} onChange={() => toggleActive(record)} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <span className="flex gap-2">
          <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>Edit</Button>
          <Button size="small" icon={<ScheduleOutlined />} onClick={() => navigate(`/admin/doctors/${record.id}/schedule`)}>
            Schedule
          </Button>
        </span>
      ),
    },
  ]

  return (
    <Card
      title="Doctors"
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Doctor</Button>}
    >
      <Table columns={columns} dataSource={doctors} rowKey="id" loading={loading} size="small" />

      <Modal
        title={editing ? 'Edit Doctor' : 'Add Doctor'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="Save"
        width={520}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="departmentId" label="Department" rules={[{ required: true }]}>
            <Select options={departments.map((d) => ({ label: d.name, value: d.id }))} />
          </Form.Item>
          <Form.Item name="specialization" label="Specialization">
            <Input />
          </Form.Item>
          <Form.Item name="qualification" label="Qualification">
            <Input />
          </Form.Item>
          <Form.Item name="experienceYears" label="Experience (years)">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="photoUrl" label="Photo URL (optional)">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
