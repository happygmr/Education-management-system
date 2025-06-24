import React, { useEffect, useState } from 'react';
import { Table, Button, Input, message, Popconfirm, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import TeacherFormModal from '../components/TeacherFormModal';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

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

  useEffect(() => {
    fetchTeachers();
  }, []);

  const openModal = (teacher = null) => {
    setEditing(teacher);
    setModalOpen(true);
  };

  // Handle create/edit submit
  const handleFormSubmit = async (values) => {
    try {
      if (editing) {
        await axios.put(`/api/teachers/${editing._id}`, values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        message.success('Teacher updated');
      } else {
        await axios.post('/api/teachers', values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        message.success('Teacher created');
      }
      setModalOpen(false);
      setEditing(null);
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
      <TeacherFormModal
        open={modalOpen}
        onOk={handleFormSubmit}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        editing={editing}
      />
    </div>
  );
};

export default Teachers; 