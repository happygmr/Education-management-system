import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker } from 'antd';
import moment from 'moment';

const { Option } = Select;

const StudentFormModal = ({ open, onOk, onCancel, editing, classes }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (!open) {
      form.resetFields();
    } else if (editing) {
      form.setFieldsValue({
        ...editing,
        class: editing.class?._id,
        dateOfBirth: editing.dateOfBirth ? moment(editing.dateOfBirth) : null,
      });
    } else {
      form.resetFields();
    }
  }, [open, editing, form]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        console.log('Form validation successful. Values:', values);
        onOk(values);
        form.resetFields();
      })
      .catch((info) => {
        console.error('Form validation failed:', info);
        if (info.errorFields) {
          info.errorFields.forEach(field => {
            console.error(`Validation error in field '${field.name}':`, field.errors.join(', '));
          });
        }
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
        <Form.Item name="firstName" label="First Name" rules={[{ required: true, message: 'Please enter first name' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="lastName" label="Last Name" rules={[{ required: true, message: 'Please enter last name' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="dateOfBirth" label="Date of Birth" rules={[{ required: true, message: 'Please enter date of birth' }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="admissionNumber" label="Admission Number" rules={[{ required: true, message: 'Please enter admission number' }]}>
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
            {classes && classes.length > 0 ? classes.map((cls) => (
              <Option key={cls._id} value={cls._id}>
                {cls.name}
              </Option>
            )) : <Option disabled>No classes available</Option>}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default StudentFormModal; 