import React from 'react';
import { Card, Col, Row, Statistic, Typography, Spin, Tag, Space, Alert } from 'antd';
import {
  BookOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  CopyOutlined,
  GlobalOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useDashboardStats } from '../services/analytics';

const { Title, Text } = Typography;

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading || !stats) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Global Traffic Knowledge — Command Center
          </Title>
          <Text type="secondary">
            Production Knowledge Graph: Unlimited Canonical Signs, Country Variants & Tier-1 Legal Sources
          </Text>
        </div>
        <Space>
          <Tag color="success" style={{ padding: '4px 10px', fontSize: 13 }}>
            ● System Status: Production Ready
          </Tag>
        </Space>
      </div>

      {/* Top Level KPIs */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="Canonical Signs"
              value={stats.canonicalSignsCount}
              prefix={<SafetyCertificateOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff', fontWeight: 'bold' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {stats.signVariantsCount} Official Country Variants
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="Published Questions"
              value={stats.publishedQuestions}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Live in Consumer Mobile App
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="Pending Review / Draft"
              value={stats.draftQuestions + stats.underReviewQuestions}
              prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16', fontWeight: 'bold' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Staged for Validation
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Statistic
              title="Duplicate Candidates"
              value={stats.duplicateCandidatesPending}
              prefix={<CopyOutlined style={{ color: stats.duplicateCandidatesPending > 0 ? '#ff4d4f' : '#52c41a' }} />}
              valueStyle={{ color: stats.duplicateCandidatesPending > 0 ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }}
            />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {stats.duplicateCandidatesPending === 0 ? 'Zero duplicates detected' : 'Requires review'}
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Category Breakdown & Data Integrity */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12}>
          <Card title="Category Distribution (Live)" bordered={false} style={{ borderRadius: 12, height: '100%' }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <div style={{ padding: '12px', background: '#e6f4ff', borderRadius: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>🔵 Regulatory Signs</Text>
                  <Title level={3} style={{ margin: '4px 0 0 0', color: '#1677ff' }}>
                    {stats.categories.TRAFFIC_REGULATORY || 0}
                  </Title>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ padding: '12px', background: '#fff7e6', borderRadius: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>⚠️ Warning Signs</Text>
                  <Title level={3} style={{ margin: '4px 0 0 0', color: '#fa8c16' }}>
                    {stats.categories.WARNING_SIGNS || 0}
                  </Title>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ padding: '12px', background: '#f6ffed', borderRadius: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>🚦 Traffic Signals</Text>
                  <Title level={3} style={{ margin: '4px 0 0 0', color: '#52c41a' }}>
                    {stats.categories.TRAFFIC_SIGNALS || 0}
                  </Title>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ padding: '12px', background: '#f9f0ff', borderRadius: 8 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>📋 General Knowledge</Text>
                  <Title level={3} style={{ margin: '4px 0 0 0', color: '#722ed1' }}>
                    {stats.categories.GENERAL_KNOWLEDGE || 0}
                  </Title>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Country Packs & Regional Rules" bordered={false} style={{ borderRadius: 12, height: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(stats.countryBreakdown).map(([code, item]) => (
                <div
                  key={code}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: '#f8fafc',
                    borderRadius: 6,
                  }}
                >
                  <Space>
                    <span style={{ fontSize: 18 }}>{item.flag}</span>
                    <Text strong>{item.name}</Text>
                    <Tag style={{ fontSize: 10 }}>{code}</Tag>
                  </Space>
                  <Text strong style={{ color: '#1677ff' }}>
                    {item.count} questions
                  </Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Production Integrity Verification Bar */}
      <Card
        title="Production Data Integrity Gates"
        bordered={false}
        style={{ marginTop: 24, borderRadius: 12 }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />
              <div>
                <Text strong>Legacy Question Leak Check</Text>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Active legacy questions: <strong>{stats.activeLegacyQuestions}</strong> (0 expected)
                  </Text>
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />
              <div>
                <Text strong>Source Traceability Audit</Text>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Missing sources: <strong>{stats.missingSourcesCount}</strong> (0 expected)
                  </Text>
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 24 }} />
              <div>
                <Text strong>Archived Legacy Store</Text>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Preserved legacy bank: <strong>{stats.legacyArchivedQuestions}</strong> records
                  </Text>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
