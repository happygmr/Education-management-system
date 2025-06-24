import React, { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';

const TeacherFormModal = ({ open, onOk, onCancel, editing }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) {
      form.resetFields();
    } else if (editing) {
      form.setFieldsValue(editing);
    } else {
      form.resetFields();
    }
  }, [open, editing, form]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onOk(values);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <Modal
      title={editing ? 'Edit Teacher' : 'Add Teacher'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText={editing ? 'Update' : 'Create'}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="employeeNumber" label="Employee Number" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email">
          <Input type="email" />
        </Form.Item>
        <Form.Item name="phone" label="Phone">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TeacherFormModal; 