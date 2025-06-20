import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, Alert } from 'antd';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('/api/dashboard/stats', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '60px auto' }} />;
  if (error) return <Alert type="error" message={error} style={{ margin: 24 }} />;
  if (!stats) return null;

  return (
    <div>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card><Statistic title="Students" value={stats.students.total} /></Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card><Statistic title="Teachers" value={stats.teachers.total} /></Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card><Statistic title="Classes" value={stats.classes.total} /></Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card><Statistic title="Subjects" value={stats.subjects.total} /></Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card><Statistic title="Invoices" value={stats.invoices.total} /></Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card><Statistic title="Payments" value={stats.payments.total} /></Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card><Statistic title="Recent Students (7d)" value={stats.students.recent7days} /></Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card><Statistic title="Recent Payments (7d)" value={stats.payments.recent7days} /></Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 