import { useEffect, useState } from 'react'
import { Card, Form, Checkbox, TimePicker, InputNumber, Button, message } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import client from '../../api/client'

const DAY_OPTIONS = [
  { label: 'Mon', value: 'Mon' },
  { label: 'Tue', value: 'Tue' },
  { label: 'Wed', value: 'Wed' },
  { label: 'Thu', value: 'Thu' },
  { label: 'Fri', value: 'Fri' },
  { label: 'Sat', value: 'Sat' },
  { label: 'Sun', value: 'Sun' },
]

export default function Schedule() {
  const { doctorId } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!doctorId) return
    setLoading(true)
    client
      .get(`/admin/doctors/${doctorId}/schedule`)
      .then((r) => {
        const s = r.data
        form.setFieldsValue({
          workingDays: s.workingDays.split(',').map((d: string) => d.trim()),
          startTime1: dayjs(s.startTime1, 'HH:mm'),
          endTime1: dayjs(s.endTime1, 'HH:mm'),
          startTime2: s.startTime2 ? dayjs(s.startTime2, 'HH:mm') : null,
          endTime2: s.endTime2 ? dayjs(s.endTime2, 'HH:mm') : null,
          slotDurationMin: s.slotDurationMin,
          maxPatientsPerSlot: s.maxPatientsPerSlot,
        })
      })
      .catch(() => {
        // New schedule — leave form empty
      })
      .finally(() => setLoading(false))
  }, [doctorId, form])

  async function handleSave(values: {
    workingDays: string[]
    startTime1: dayjs.Dayjs
    endTime1: dayjs.Dayjs
    startTime2?: dayjs.Dayjs
    endTime2?: dayjs.Dayjs
    slotDurationMin: number
    maxPatientsPerSlot: number
  }) {
    setSaving(true)
    try {
      await client.put(`/admin/doctors/${doctorId}/schedule`, {
        workingDays: values.workingDays.join(','),
        startTime1: values.startTime1.format('HH:mm'),
        endTime1: values.endTime1.format('HH:mm'),
        startTime2: values.startTime2?.format('HH:mm') ?? null,
        endTime2: values.endTime2?.format('HH:mm') ?? null,
        slotDurationMin: values.slotDurationMin,
        maxPatientsPerSlot: values.maxPatientsPerSlot,
      })
      message.success('Schedule saved')
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card
      title={`Edit Schedule — Doctor #${doctorId}`}
      extra={<Button onClick={() => navigate('/admin/doctors')}>← Back to Doctors</Button>}
      loading={loading}
      style={{ maxWidth: 600 }}
    >
      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Form.Item name="workingDays" label="Working Days" rules={[{ required: true }]}>
          <Checkbox.Group options={DAY_OPTIONS} />
        </Form.Item>

        <Form.Item label="Session 1">
          <div className="flex gap-4">
            <Form.Item name="startTime1" noStyle rules={[{ required: true }]}>
              <TimePicker format="HH:mm" minuteStep={5} placeholder="Start" />
            </Form.Item>
            <Form.Item name="endTime1" noStyle rules={[{ required: true }]}>
              <TimePicker format="HH:mm" minuteStep={5} placeholder="End" />
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item label="Session 2 (optional)">
          <div className="flex gap-4">
            <Form.Item name="startTime2" noStyle>
              <TimePicker format="HH:mm" minuteStep={5} placeholder="Start" />
            </Form.Item>
            <Form.Item name="endTime2" noStyle>
              <TimePicker format="HH:mm" minuteStep={5} placeholder="End" />
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item name="slotDurationMin" label="Slot Duration (minutes)" rules={[{ required: true }]}>
          <InputNumber min={5} max={120} style={{ width: 120 }} />
        </Form.Item>

        <Form.Item name="maxPatientsPerSlot" label="Max Patients Per Slot" rules={[{ required: true }]}>
          <InputNumber min={1} max={20} style={{ width: 120 }} />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={saving}>
          Save Schedule
        </Button>
      </Form>
    </Card>
  )
}
