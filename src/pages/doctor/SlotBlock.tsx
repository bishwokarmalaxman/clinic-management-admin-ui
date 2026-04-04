import { Card, Form, DatePicker, TimePicker, Button, message, Divider } from 'antd'
import dayjs from 'dayjs'
import client from '../../api/client'

export default function SlotBlock() {
  const [blockForm] = Form.useForm()
  const [unblockForm] = Form.useForm()

  async function handleBlock(values: { date: dayjs.Dayjs; startTime: dayjs.Dayjs; endTime: dayjs.Dayjs }) {
    try {
      await client.post('/doctor/slots/block', {
        slotDate: values.date.format('YYYY-MM-DD'),
        startTime: values.startTime.format('HH:mm'),
        endTime: values.endTime.format('HH:mm'),
      })
      message.success('Slot blocked. Affected appointments have been cancelled.')
      blockForm.resetFields()
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Failed to block slot')
    }
  }

  async function handleUnblock(values: { date: dayjs.Dayjs; startTime: dayjs.Dayjs }) {
    try {
      await client.delete('/doctor/slots/unblock', {
        data: {
          slotDate: values.date.format('YYYY-MM-DD'),
          startTime: values.startTime.format('HH:mm'),
        },
      })
      message.success('Slot unblocked.')
      unblockForm.resetFields()
    } catch (err: unknown) {
      message.error(err instanceof Error ? err.message : 'Failed to unblock slot')
    }
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <Card title="Block a Time Slot" style={{ marginBottom: 24 }}>
        <Form form={blockForm} layout="vertical" onFinish={handleBlock}>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} disabledDate={(d) => d.isBefore(dayjs(), 'day')} />
          </Form.Item>
          <Form.Item name="startTime" label="Start Time" rules={[{ required: true }]}>
            <TimePicker format="HH:mm" minuteStep={5} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="endTime" label="End Time" rules={[{ required: true }]}>
            <TimePicker format="HH:mm" minuteStep={5} style={{ width: '100%' }} />
          </Form.Item>
          <Button type="primary" danger htmlType="submit" block>
            Block Slot
          </Button>
        </Form>
      </Card>

      <Divider />

      <Card title="Unblock a Time Slot">
        <Form form={unblockForm} layout="vertical" onFinish={handleUnblock}>
          <Form.Item name="date" label="Date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="startTime" label="Start Time" rules={[{ required: true }]}>
            <TimePicker format="HH:mm" minuteStep={5} style={{ width: '100%' }} />
          </Form.Item>
          <Button htmlType="submit" block>
            Unblock Slot
          </Button>
        </Form>
      </Card>
    </div>
  )
}
