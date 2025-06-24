import React, { useEffect } from 'react';
import { Modal, Form, Input, Select } from 'antd';

const { Option } = Select;

const StudentFormModal = ({ open, onOk, onCancel, editing, classes }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) {
      form.resetFields();
    } else if (editing) {
      form.setFieldsValue({ ...editing, class: editing.class?._id });
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
      title={editing ? 'Edit Student' : 'Add Student'}
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
        <Form.Item name="admissionNumber" label="Admission Number" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="gender" label="Gender">
          <Select allowClear>
            <Option value="male">Male</Option>
            <Option value="female">Female</Option>
          </Select>
        </Form.Item>
        <Form.Item name="class" label="Class">
          <Select allowClear showSearch optionFilterProp="children">
            {classes.map((cls) => (
              <Option key={cls._id} value={cls._id}>
                {cls.name}
              </Option>
            ))}
          </Select>
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

export default StudentFormModal; 