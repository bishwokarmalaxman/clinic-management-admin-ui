import { useEffect, useState } from 'react'
import { Card, Table, Button, Modal, Form, Input, Switch, message } from 'antd'
import { PlusOutlined, EditOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import client from '../../api/client'

interface Department {
  id: number
  name: string
  description: string | null
  isActive: boolean
}

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Department | null>(null)
  const [form] = Form.useForm()

  function load() {
    setLoading(true)
    client.get('/admin/departments').then((r) => setDepartments(r.data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing(null)
    form.resetFields()
    setModalOpen(true)
  }

  function openEdit(dept: Department) {
    setEditing(dept)
    form.setFieldsValue({ name: dept.name, description: dept.description })
    setModalOpen(true)
  }

  async function handleSave() {
    const values = await form.validateFields()
    try {
      if (editing) {
        await client.put(`/admin/departments/${editing.id}`, values)
        message.success('Department updated')
      } else {
        await client.post('/admin/departments', values)
        message.success('Department created')
      }
      setModalOpen(false)
      load()
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Save failed')
    }
  }

  async function toggleActive(dept: Department) {
    try {
      await client.patch(`/admin/departments/${dept.id}/toggle-active`)
      load()
    } catch {
      message.error('Failed to toggle')
    }
  }

  const columns: ColumnsType<Department> = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description', render: (v) => v || '—' },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (_, record) => (
        <Switch checked={record.isActive} onChange={() => toggleActive(record)} />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>Edit</Button>
      ),
    },
  ]

  return (
    <Card
      title="Departments"
      extra={<Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Add Department</Button>}
    >
      <Table columns={columns} dataSource={departments} rowKey="id" loading={loading} size="small" pagination={false} />

      <Modal
        title={editing ? 'Edit Department' : 'Add Department'}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => setModalOpen(false)}
        okText="Save"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}
