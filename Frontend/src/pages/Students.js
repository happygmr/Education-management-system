import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const initialForm = {
  firstName: '',
  lastName: '',
  admissionNumber: '',
  gender: '',
  class: '',
  email: '',
  phone: '',
};

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');

  // Fetch students
  const fetchStudents = async (searchVal = '') => {
    setLoading(true);
    try {
      const res = await axios.get('/api/students', {
        params: searchVal ? { name: searchVal } : {},
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStudents(res.data);
    } catch (err) {
      message.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  // Fetch classes for dropdown
  const fetchClasses = async () => {
    try {
      const res = await axios.get('/api/classes', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setClasses(res.data);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  // Open modal for create/edit
  const openModal = (student = null) => {
    setEditing(student);
    setModalOpen(true);
    if (student) {
      form.setFieldsValue({ ...student, class: student.class?._id });
    } else {
      form.resetFields();
    }
  };

  // Handle create/edit submit
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        // Edit
        await axios.put(`/api/students/${editing._id}`, values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        message.success('Student updated');
      } else {
        // Create
        await axios.post('/api/students', values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        message.success('Student created');
      }
      setModalOpen(false);
      fetchStudents(search);
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to save student');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/students/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('Student deleted');
      fetchStudents(search);
    } catch (err) {
      message.error('Failed to delete student');
    }
  };

  // Search handler
  const handleSearch = (val) => {
    setSearch(val);
    fetchStudents(val);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'name',
      render: (text, record) => `${record.firstName} ${record.lastName}`
    },
    {
      title: 'Admission #',
      dataIndex: 'admissionNumber',
      key: 'admissionNumber',
    },
    {
      title: 'Class',
      dataIndex: ['class', 'name'],
      key: 'class',
      render: (_, record) => record.class?.name || ''
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm title="Delete this student?" onConfirm={() => handleDelete(record._id)}>
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Input.Search
          placeholder="Search by name"
          onSearch={handleSearch}
          style={{ width: 240 }}
          allowClear
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          Add Student
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={students}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={editing ? 'Edit Student' : 'Add Student'}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        okText={editing ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical" initialValues={initialForm}>
          <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item name="admissionNumber" label="Admission Number" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item name="gender" label="Gender"> <Select allowClear> <Option value="male">Male</Option> <Option value="female">Female</Option> </Select> </Form.Item>
          <Form.Item name="class" label="Class"> <Select allowClear showSearch optionFilterProp="children"> {classes.map(cls => <Option key={cls._id} value={cls._id}>{cls.name}</Option>)} </Select> </Form.Item>
          <Form.Item name="email" label="Email"> <Input type="email" /> </Form.Item>
          <Form.Item name="phone" label="Phone"> <Input /> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Students; 