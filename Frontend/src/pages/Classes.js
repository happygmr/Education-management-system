import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import API_BASE_URL from '../config';

const { Option } = Select;

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  const fetchClasses = async () => {
    setLoading(true);
    try {
      console.log('Fetching classes from frontend...');
      const res = await axios.get(`${API_BASE_URL}/api/classes`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Classes response:', res.data);
      setClasses(res.data);
    } catch (err) {
      console.error('Error fetching classes from frontend:', err.response?.data);
      message.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/teachers`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Fetched teachers:', res.data);
      setTeachers(res.data);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      // ignore
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const openModal = (cls = null) => {
    setEditing(cls);
    setModalOpen(true);
    if (cls) {
      form.setFieldsValue({ ...cls, classTeacher: cls.classTeacher?._id });
    } else {
      form.resetFields();
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      // Generate classId if creating new class
      if (!editing) {
        const timestamp = Date.now();
        values.classId = `CLASS_${timestamp}`;
      }
      
      console.log('Sending class data:', values);
      
      if (editing) {
        await axios.put(`${API_BASE_URL}/api/classes/${editing._id}`, values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        message.success('Class updated');
      } else {
        await axios.post(`${API_BASE_URL}/api/classes`, values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        message.success('Class created');
      }
      setModalOpen(false);
      fetchClasses();
    } catch (err) {
      console.error('Class creation error:', err.response?.data);
      message.error(err.response?.data?.error || 'Failed to save class');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/classes/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('Class deleted');
      fetchClasses();
    } catch (err) {
      message.error('Failed to delete class');
    }
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Section', dataIndex: 'section', key: 'section' },
    {
      title: 'Class Teacher',
      dataIndex: ['classTeacher', 'firstName'],
      key: 'classTeacher',
      render: (_, record) => record.classTeacher ? `${record.classTeacher.firstName} ${record.classTeacher.lastName}` : ''
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => openModal(record)} />
          <Popconfirm title="Delete this class?" onConfirm={() => handleDelete(record._id)}>
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
          Add Class
        </Button>
      </div>
      <Table columns={columns} dataSource={classes} rowKey="_id" loading={loading} />
      <Modal
        title={editing ? 'Edit Class' : 'Add Class'}
        open={modalOpen}
        onOk={handleOk}
        onCancel={() => setModalOpen(false)}
        okText={editing ? 'Update' : 'Create'}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Class Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="section" label="Section">
            <Input />
          </Form.Item>
          <Form.Item name="classTeacher" label="Class Teacher">
            <Select allowClear showSearch optionFilterProp="children">
              {teachers.map(t => {
                const teacherName = t.user ? `${t.user.firstName} ${t.user.lastName}` : 'Unknown Teacher';
                const teacherId = t.user ? t.user._id : t._id;
                return (
                  <Option key={teacherId} value={teacherId}>{teacherName}</Option>
                );
              })}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Classes; 