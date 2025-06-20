import React, { useEffect, useState } from 'react';
import { Select, Table, Button, InputNumber, message, Space, Card, Typography, Divider, Input, Spin } from 'antd';
import axios from 'axios';
import { useAppSelector } from '../store';

const { Option } = Select;
const { Title } = Typography;

const Results = () => {
  const [classes, setClasses] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [studentsForReport, setStudentsForReport] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [term, setTerm] = useState('');
  const [session, setSession] = useState('');
  const [reportCard, setReportCard] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const roles = useAppSelector(state => state.auth.roles);
  const isTeacherOrAdmin = roles.includes('admin') || roles.includes('teacher');
  const [remarksInput, setRemarksInput] = useState('');
  const [savingRemarks, setSavingRemarks] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingAssessments, setLoadingAssessments] = useState(false);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      setLoadingClasses(true);
      try {
        const res = await axios.get('/api/classes', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setClasses(res.data);
      } catch (err) {
        message.error('Failed to load classes');
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, []);

  // Fetch assessments for selected class
  useEffect(() => {
    if (!selectedClass) return;
    const fetchAssessments = async () => {
      setLoadingAssessments(true);
      try {
        const res = await axios.get('/api/assessments', {
          params: { class: selectedClass },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setAssessments(res.data);
      } catch (err) {
        message.error('Failed to load assessments');
      } finally {
        setLoadingAssessments(false);
      }
    };
    fetchAssessments();
  }, [selectedClass]);

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
        setScores(res.data.students.map(s => ({ student: s._id, score: null })));
      } catch (err) {
        message.error('Failed to load students');
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [selectedClass]);

  // Fetch all students for report card dropdown (on mount)
  useEffect(() => {
    const fetchAllStudents = async () => {
      try {
        const res = await axios.get('/api/students', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setStudentsForReport(res.data);
      } catch (err) {
        // ignore
      }
    };
    fetchAllStudents();
  }, []);

  // Handle score change
  const handleScoreChange = (studentId, value) => {
    setScores(prev => prev.map(s => s.student === studentId ? { ...s, score: value } : s));
  };

  // Submit results
  const handleSubmit = async () => {
    if (!selectedAssessment) {
      message.error('Please select an assessment');
      return;
    }
    try {
      await axios.post(`/api/assessments/${selectedAssessment}/scores`, {
        studentScores: scores
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('Results submitted');
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to submit results');
    }
  };

  const handleFetchReportCard = async () => {
    if (!selectedStudent || !term || !session) {
      message.error('Select student, term, and session');
      return;
    }
    setLoadingReport(true);
    try {
      const res = await axios.get(`/api/report-cards/${selectedStudent}`, {
        params: { term, session },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setReportCard(res.data);
    } catch (err) {
      message.error('Failed to fetch report card');
      setReportCard(null);
    } finally {
      setLoadingReport(false);
    }
  };

  const handlePrint = () => {
    const printContents = document.getElementById('report-card-print')?.innerHTML;
    if (!printContents) return;
    const win = window.open('', '', 'height=700,width=900');
    win.document.write('<html><head><title>Report Card</title></head><body>');
    win.document.write(printContents);
    win.document.write('</body></html>');
    win.document.close();
    win.print();
  };

  // When reportCard changes, update remarksInput
  useEffect(() => {
    setRemarksInput(reportCard?.remarks || '');
  }, [reportCard]);

  const handleSaveRemarks = async () => {
    if (!selectedStudent || !term || !session) return;
    setSavingRemarks(true);
    try {
      await axios.put(`/api/report-cards/${selectedStudent}/remarks`, {
        term,
        session,
        remarks: remarksInput
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('Remarks saved');
      setReportCard(rc => rc ? { ...rc, remarks: remarksInput } : rc);
    } catch (err) {
      message.error(err.response?.data?.error || 'Failed to save remarks');
    } finally {
      setSavingRemarks(false);
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
      title: 'Score',
      key: 'score',
      render: (_, record) => (
        <InputNumber
          min={0}
          max={100}
          value={scores.find(s => s.student === record._id)?.score}
          onChange={val => handleScoreChange(record._id, val)}
        />
      )
    }
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Spin spinning={loadingClasses} size="small">
          <Select
            placeholder="Select Class"
            style={{ width: 200 }}
            onChange={setSelectedClass}
            value={selectedClass}
            allowClear
          >
            {classes.map(cls => <Option key={cls._id} value={cls._id}>{cls.name}</Option>)}
          </Select>
        </Spin>
        <Spin spinning={loadingAssessments} size="small">
          <Select
            placeholder="Select Assessment"
            style={{ width: 240 }}
            onChange={setSelectedAssessment}
            value={selectedAssessment}
            allowClear
            disabled={!selectedClass}
          >
            {assessments.map(a => <Option key={a._id} value={a._id}>{a.term} {a.session} - {a.subject?.name || ''} ({a.maxScore})</Option>)}
          </Select>
        </Spin>
        <Button type="primary" onClick={handleSubmit} disabled={!selectedAssessment || students.length === 0}>
          Save Results
        </Button>
      </Space>
      <Spin spinning={loading} tip="Loading students...">
        <Table
          columns={columns}
          dataSource={students}
          rowKey="_id"
          loading={loading}
          pagination={false}
        />
      </Spin>
      <Divider orientation="left" style={{ marginTop: 40 }}>View/Download Report Card</Divider>
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="Select Student"
          style={{ width: 200 }}
          onChange={setSelectedStudent}
          value={selectedStudent}
          allowClear
          showSearch
          optionFilterProp="children"
        >
          {studentsForReport.map(s => <Option key={s._id} value={s._id}>{s.firstName} {s.lastName} ({s.admissionNumber})</Option>)}
        </Select>
        <Select placeholder="Term" style={{ width: 120 }} onChange={setTerm} value={term} allowClear>
          <Option value="1st">1st</Option>
          <Option value="2nd">2nd</Option>
          <Option value="3rd">3rd</Option>
        </Select>
        <InputNumber
          placeholder="Session (e.g. 2023)"
          style={{ width: 140 }}
          min={2000}
          max={2100}
          value={session}
          onChange={setSession}
        />
        <Button onClick={handleFetchReportCard} loading={loadingReport} type="primary">Fetch Report Card</Button>
        {reportCard && <Button onClick={handlePrint}>Print/Download</Button>}
      </Space>
      <Spin spinning={loadingReport} tip="Loading report card...">
        {reportCard && (
          <div id="report-card-print" style={{ background: '#fff', padding: 24, marginTop: 16, maxWidth: 700 }}>
            <Title level={4} style={{ textAlign: 'center' }}>Report Card</Title>
            <div><b>Name:</b> {reportCard.student?.firstName} {reportCard.student?.lastName}</div>
            <div><b>Admission #:</b> {reportCard.student?.admissionNumber}</div>
            <div><b>Class:</b> {reportCard.class?.name}</div>
            <div><b>Term:</b> {reportCard.term} <b>Session:</b> {reportCard.session}</div>
            <Divider />
            <Table
              columns={[
                { title: 'Subject', dataIndex: ['subject', 'name'], key: 'subject', render: (_, r) => r.subject?.name },
                { title: 'Score', dataIndex: 'score', key: 'score' },
                { title: 'Grade', dataIndex: 'grade', key: 'grade' },
                { title: 'Remark', dataIndex: 'remark', key: 'remark' },
              ]}
              dataSource={reportCard.scores}
              rowKey={(_, idx) => idx}
              pagination={false}
              size="small"
            />
            <Divider />
            <div><b>Total:</b> {reportCard.total}</div>
            <div><b>Average:</b> {reportCard.average}</div>
            <div><b>Position:</b> {reportCard.position}</div>
            <div style={{ marginTop: 12 }}>
              <b>Remarks:</b>
              {isTeacherOrAdmin ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <Input.TextArea
                    value={remarksInput}
                    onChange={e => setRemarksInput(e.target.value)}
                    rows={2}
                    style={{ width: 300, marginLeft: 8 }}
                  />
                  <Button type="primary" size="small" loading={savingRemarks} onClick={handleSaveRemarks}>
                    Save
                  </Button>
                </span>
              ) : (
                <span style={{ marginLeft: 8 }}>{reportCard.remarks}</span>
              )}
            </div>
          </div>
        )}
      </Spin>
    </div>
  );
};

export default Results; 