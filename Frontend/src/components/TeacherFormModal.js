import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, DatePicker, Select } from 'antd';
import axios from 'axios';
import API_BASE_URL from '../config';

const { Option } = Select;

const TeacherFormModal = ({ open, onOk, onCancel, editing }) => {
  const [form] = Form.useForm();
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);

  // Fetch subjects and classes for dropdowns
  const fetchData = async () => {
    try {
      const [subjectsRes, classesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/subjects`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        axios.get(`${API_BASE_URL}/api/classes`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]);
      setSubjects(subjectsRes.data);
      setClasses(classesRes.data);
    } catch (error) {
      console.error('Error fetching subjects or classes:', error);
    }
  };

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
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        {!editing && (
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
        )}
        <Form.Item name="employeeNumber" label="Employee Number" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="hireDate" label="Hire Date">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="subjects" label="Subjects">
          <Select mode="multiple" allowClear>
            {subjects.map(s => <Option key={s._id} value={s._id}>{s.name}</Option>)}
          </Select>
        </Form.Item>
        <Form.Item name="classes" label="Classes">
          <Select mode="multiple" allowClear>
            {classes.map(c => <Option key={c._id} value={c._id}>{c.name}</Option>)}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TeacherFormModal; 