import React, { useEffect, useState } from 'react';
import { Select, Table, Button, Radio, message, DatePicker, Space } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';

const { Option } = Select;

const statusOptions = [
  { label: 'Present', value: 'Present' },
  { label: 'Absent', value: 'Absent' },
  { label: 'Late', value: 'Late' },
  { label: 'Excused', value: 'Excused' },
];

const Attendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [date, setDate] = useState(dayjs());
  const [loading, setLoading] = useState(false);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get('/api/classes', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setClasses(res.data);
      } catch (err) {
        message.error('Failed to load classes');
      }
    };
    fetchClasses();
  }, []);

  // Fetch students for selected class
  useEffect(() => {
    if (!selectedClass) return;
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/classes/${selectedClass}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setStudents(res.data.students || []);
        setAttendance(res.data.students.map(s => ({ student: s._id, status: 'Present' })));
      } catch (err) {
        message.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [selectedClass]);

  // Handle status change
  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => prev.map(a => a.student === studentId ? { ...a, status } : a));
  };

  // Mark all present
  const markAllPresent = () => {
    setAttendance(prev => prev.map(a => ({ ...a, status: 'Present' })));
  };

  // Submit attendance
  const handleSubmit = async () => {
    try {
      await axios.post('/api/attendance', {
        class: selectedClass,
        date: date.format('YYYY-MM-DD'),
        records: attendance
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('Attendance submitted');
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to submit attendance');
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
      title: 'Admission #',
      dataIndex: 'admissionNumber',
      key: 'admissionNumber',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => (
        <Radio.Group
          options={statusOptions}
          value={attendance.find(a => a.student === record._id)?.status}
          onChange={e => handleStatusChange(record._id, e.target.value)}
          optionType="button"
          buttonStyle="solid"
        />
      )
    }
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="Select Class"
          style={{ width: 200 }}
          onChange={setSelectedClass}
          value={selectedClass}
          allowClear
        >
          {classes.map(cls => <Option key={cls._id} value={cls._id}>{cls.name}</Option>)}
        </Select>
        <DatePicker value={date} onChange={setDate} />
        <Button onClick={markAllPresent}>Mark All Present</Button>
        <Button type="primary" onClick={handleSubmit} disabled={!selectedClass || students.length === 0}>
          Submit Attendance
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={students}
        rowKey="_id"
        loading={loading}
        pagination={false}
      />
    </div>
  );
};

export default Attendance; 