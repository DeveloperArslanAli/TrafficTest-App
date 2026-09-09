import React, { useState } from 'react';
import {
  Table,
  Button,
  Tag,
  Typography,
  Card,
  Row,
  Col,
  Space,
  Modal,
  Descriptions,
  Progress,
  message,
  Popconfirm,
  Empty,
} from 'antd';
import {
  CopyOutlined,
  CheckOutlined,
  CloseOutlined,
  SwapOutlined,
  RadarChartOutlined,
} from '@ant-design/icons';
import {
  useDuplicates,
  useDuplicateDetails,
  useMergeDuplicate,
  useResolveDuplicate,
  useScanDuplicates,
} from '../../services/duplicates';
import type { DuplicateCandidate } from '../../types';

const { Title, Text } = Typography;

export default function DuplicateReview() {
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  const { data: candidates, isLoading } = useDuplicates('PENDING');
  const { data: details, isLoading: isDetailsLoading } = useDuplicateDetails(selectedCandidateId || '');

  const mergeMutation = useMergeDuplicate();
  const resolveMutation = useResolveDuplicate();
  const scanMutation = useScanDuplicates();

  const handleOpenReview = (id: string) => {
    setSelectedCandidateId(id);
    setReviewModalVisible(true);
  };

  const handleMerge = (targetId: string) => {
    if (!selectedCandidateId) return;
    mergeMutation.mutate(
      {
        id: selectedCandidateId,
        targetId,
        reason: 'Confirmed duplicate by Administrator in Duplicate Review screen',
      },
      {
        onSuccess: () => setReviewModalVisible(false),
      },
    );
  };

  const handleResolve = (status: 'KEPT_SEPARATE' | 'MARKED_AS_VARIANT' | 'REJECTED') => {
    if (!selectedCandidateId) return;
    resolveMutation.mutate(
      {
        id: selectedCandidateId,
        status,
        reason: `Marked as ${status} by Administrator`,
      },
      {
        onSuccess: () => setReviewModalVisible(false),
      },
    );
  };

  const columns = [
    {
      title: 'Candidate Type',
      dataIndex: 'candidateType',
      key: 'candidateType',
      width: 140,
      render: (type: string) => (
        <Tag color={type === 'SIGN' ? 'blue' : 'purple'}>{type}</Tag>
      ),
    },
    {
      title: 'Similarity Score',
      dataIndex: 'similarityScore',
      key: 'similarityScore',
      width: 180,
      render: (score: number) => (
        <Space>
          <Progress
            percent={Math.round(score * 100)}
            size="small"
            status={score >= 0.85 ? 'exception' : 'active'}
            style={{ width: 100 }}
          />
        </Space>
      ),
    },
    {
      title: 'Recommendation',
      dataIndex: 'recommendation',
      key: 'recommendation',
      width: 180,
      render: (rec: string) => {
        const color =
          rec === 'LIKELY_DUPLICATE' ? 'error' : rec === 'POSSIBLE_VARIANT' ? 'warning' : 'default';
        return <Tag color={color}>{rec.replace('_', ' ')}</Tag>;
      },
    },
    {
      title: 'Candidate IDs',
      key: 'entities',
      render: (_: any, record: DuplicateCandidate) => (
        <Text style={{ fontFamily: 'monospace', fontSize: 12 }}>
          {record.entityAId.slice(0, 8)}… vs {record.entityBId.slice(0, 8)}…
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_: any, record: DuplicateCandidate) => (
        <Button type="primary" size="small" onClick={() => handleOpenReview(record.id)}>
          Review Candidate
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Duplicate Review Center
          </Title>
          <Text type="secondary">
            Semantic and perceptual duplicate detection engine preventing redundant signs and questions
          </Text>
        </div>
        <Button
          type="default"
          icon={<RadarChartOutlined />}
          loading={scanMutation.isPending}
          onClick={() => scanMutation.mutate()}
        >
          Scan Knowledge Graph for Duplicates
        </Button>
      </div>

      <Table<DuplicateCandidate>
        rowKey="id"
        columns={columns}
        dataSource={candidates || []}
        loading={isLoading}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Zero duplicate candidates pending review. Knowledge graph is 100% deduplicated."
            />
          ),
        }}
      />

      {/* Side-by-Side Review Modal */}
      <Modal
        title="Candidate Comparison & Resolution"
        open={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        footer={null}
        width={850}
      >
        {isDetailsLoading || !details ? (
          <Text>Loading candidate details...</Text>
        ) : (
          <div>
            <div style={{ marginBottom: 16, background: '#fafafa', padding: 12, borderRadius: 8 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Text type="secondary">Overall Similarity</Text>
                  <Title level={4} style={{ margin: 0, color: '#f5222d' }}>
                    {Math.round(details.candidate.similarityScore * 100)}%
                  </Title>
                </Col>
                <Col span={6}>
                  <Text type="secondary">Name Similarity</Text>
                  <Title level={4} style={{ margin: 0 }}>
                    {Math.round((details.candidate.nameScore || 0) * 100)}%
                  </Title>
                </Col>
                <Col span={6}>
                  <Text type="secondary">Meaning Similarity</Text>
                  <Title level={4} style={{ margin: 0 }}>
                    {Math.round((details.candidate.meaningScore || 0) * 100)}%
                  </Title>
                </Col>
                <Col span={6}>
                  <Text type="secondary">Recommendation</Text>
                  <div>
                    <Tag color="error">{details.candidate.recommendation}</Tag>
                  </div>
                </Col>
              </Row>
            </div>

            {/* Side-by-side cards */}
            <Row gutter={16}>
              <Col span={12}>
                <Card title="Candidate A" size="small" style={{ height: '100%' }}>
                  {details.candidate.candidateType === 'SIGN' ? (
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Code">
                        <Text strong>{details.entityA?.canonicalCode}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Name">{details.entityA?.canonicalName}</Descriptions.Item>
                      <Descriptions.Item label="Meaning">{details.entityA?.meaning}</Descriptions.Item>
                      <Descriptions.Item label="Action">{details.entityA?.driverAction || '—'}</Descriptions.Item>
                    </Descriptions>
                  ) : (
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Code">{details.entityA?.questionCode}</Descriptions.Item>
                      <Descriptions.Item label="Text">{details.entityA?.text}</Descriptions.Item>
                    </Descriptions>
                  )}
                </Card>
              </Col>

              <Col span={12}>
                <Card title="Candidate B" size="small" style={{ height: '100%' }}>
                  {details.candidate.candidateType === 'SIGN' ? (
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Code">
                        <Text strong>{details.entityB?.canonicalCode}</Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="Name">{details.entityB?.canonicalName}</Descriptions.Item>
                      <Descriptions.Item label="Meaning">{details.entityB?.meaning}</Descriptions.Item>
                      <Descriptions.Item label="Action">{details.entityB?.driverAction || '—'}</Descriptions.Item>
                    </Descriptions>
                  ) : (
                    <Descriptions column={1} size="small">
                      <Descriptions.Item label="Code">{details.entityB?.questionCode}</Descriptions.Item>
                      <Descriptions.Item label="Text">{details.entityB?.text}</Descriptions.Item>
                    </Descriptions>
                  )}
                </Card>
              </Col>
            </Row>

            {/* Admin Resolution Action Bar */}
            <div
              style={{
                marginTop: 24,
                padding: '16px',
                background: '#f0f2f5',
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Space>
                <Button onClick={() => handleResolve('KEPT_SEPARATE')}>Keep Separate</Button>
                <Button onClick={() => handleResolve('MARKED_AS_VARIANT')}>Mark as Variant</Button>
                <Button danger onClick={() => handleResolve('REJECTED')}>
                  Reject
                </Button>
              </Space>

              <Space>
                <Popconfirm
                  title="Merge Candidate B into Canonical A?"
                  description="Questions referencing B will be migrated to A."
                  onConfirm={() => handleMerge(details.entityA?.id)}
                >
                  <Button type="primary">Merge into A</Button>
                </Popconfirm>
                <Popconfirm
                  title="Merge Candidate A into Canonical B?"
                  description="Questions referencing A will be migrated to B."
                  onConfirm={() => handleMerge(details.entityB?.id)}
                >
                  <Button type="primary">Merge into B</Button>
                </Popconfirm>
              </Space>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
