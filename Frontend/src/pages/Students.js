import React, { useEffect, useState } from 'react';
import { Table, Button, Input, message, Popconfirm, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import StudentFormModal from '../components/StudentFormModal';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
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

  const openModal = (student = null) => {
    setEditing(student);
    setModalOpen(true);
  };

  // Handle create/edit submit
  const handleFormSubmit = async (values) => {
    try {
      if (editing) {
        await axios.put(`/api/students/${editing._id}`, values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        message.success('Student updated');
      } else {
        await axios.post('/api/students', values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        message.success('Student created');
      }
      setModalOpen(false);
      setEditing(null);
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
      <StudentFormModal
        open={modalOpen}
        onOk={handleFormSubmit}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        editing={editing}
        classes={classes}
      />
    </div>
  );
};

export default Students; 