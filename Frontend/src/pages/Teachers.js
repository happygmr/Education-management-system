import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const initialForm = {
  firstName: '',
  lastName: '',
  employeeNumber: '',
  email: '',
  phone: '',
  user: '',
  subjects: [],
  classes: [],
};

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // Fetch teachers
  const fetchTeachers = async (searchVal = '') => {
    setLoading(true);
    try {
      const res = await axios.get('/api/teachers', {
        params: searchVal ? { name: searchVal } : {},
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTeachers(res.data);
    } catch (err) {
      message.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  // Fetch subjects and classes for dropdowns
  const fetchSubjectsAndClasses = async () => {
    try {
      const [subjRes, classRes] = await Promise.all([
        axios.get('/api/subjects', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }),
        axios.get('/api/classes', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      ]);
      setSubjects(subjRes.data);
      setClasses(classRes.data);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchSubjectsAndClasses();
  }, []);

  // Open modal for create/edit
  const openModal = (teacher = null) => {
    setEditing(teacher);
    setModalOpen(true);
    if (teacher) {
      form.setFieldsValue({ ...teacher, subjects: teacher.subjects?.map(s => s._id), classes: teacher.classes?.map(c => c._id) });
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
        await axios.put(`/api/teachers/${editing._id}`, values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        message.success('Teacher updated');
      } else {
        // Create
        await axios.post('/api/teachers', values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        message.success('Teacher created');
      }
      setModalOpen(false);
      fetchTeachers(search);
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to save teacher');
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/teachers/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('Teacher deleted');
      fetchTeachers(search);
    } catch (err) {
      message.error('Failed to delete teacher');
    }
  };

  // Search handler
  const handleSearch = (val) => {
    setSearch(val);
    fetchTeachers(val);
  };

  // Open assign modal
  const openAssignModal = (teacher) => {
    setSelectedTeacher(teacher);
    setAssignModalOpen(true);
    assignForm.setFieldsValue({
      subjects: teacher.subjects?.map(s => s._id),
      classes: teacher.classes?.map(c => c._id)
    });
  };

  // Handle assign submit
  const handleAssignOk = async () => {
    try {
      const values = await assignForm.validateFields();
      await axios.put(`/api/teachers/${selectedTeacher._id}`, values, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('Assignments updated');
      setAssignModalOpen(false);
      fetchTeachers(search);
    } catch (err) {
      message.error('Failed to update assignments');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'name',
      render: (text, record) => `${record.firstName} ${record.lastName}`
    },
    {
      title: 'Employee #',
      dataIndex: 'employeeNumber',
      key: 'employeeNumber',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Subjects',
      dataIndex: 'subjects',
      key: 'subjects',
      render: (subjects) => subjects?.map(s => <Tag key={s._id}>{s.name}</Tag>)
    },
    {
      title: 'Classes',
      dataIndex: 'classes',
      key: 'classes',
      render: (classes) => classes?.map(c => <Tag key={c._id}>{c.name}</Tag>)
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Button icon={<LinkOutlined />} onClick={() => openAssignModal(record)} title="Assign to Class/Subject" />
          <Popconfirm title="Delete this teacher?" onConfirm={() => handleDelete(record._id)}>
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
          Add Teacher
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={teachers}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={editing ? 'Edit Teacher' : 'Add Teacher'}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        okText={editing ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical" initialValues={initialForm}>
          <Form.Item name="firstName" label="First Name" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item name="employeeNumber" label="Employee Number" rules={[{ required: true }]}> <Input /> </Form.Item>
          <Form.Item name="email" label="Email"> <Input type="email" /> </Form.Item>
          <Form.Item name="phone" label="Phone"> <Input /> </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Assign to Class/Subject"
        open={assignModalOpen}
        onOk={handleAssignOk}
        onCancel={() => setAssignModalOpen(false)}
        okText="Assign"
      >
        <Form form={assignForm} layout="vertical">
          <Form.Item name="subjects" label="Subjects">
            <Select mode="multiple" allowClear showSearch optionFilterProp="children">
              {subjects.map(subj => <Option key={subj._id} value={subj._id}>{subj.name}</Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="classes" label="Classes">
            <Select mode="multiple" allowClear showSearch optionFilterProp="children">
              {classes.map(cls => <Option key={cls._id} value={cls._id}>{cls.name}</Option>)}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Teachers; 