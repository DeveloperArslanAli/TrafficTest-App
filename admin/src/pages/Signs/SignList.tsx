import React, { useState } from 'react';
import {
  Table,
  Tag,
  Button,
  Input,
  Select,
  Space,
  Modal,
  Typography,
  Tooltip,
  Popconfirm,
  Badge,
  Descriptions,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  DeleteOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useSigns, useSignImpact, useArchiveSign } from '../../services/signs';
import type { TrafficSign } from '../../types';

const { Title, Text } = Typography;
const { Option } = Select;

export default function SignList() {
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [selectedSignId, setSelectedSignId] = useState<string | null>(null);
  const [impactModalVisible, setImpactModalVisible] = useState(false);

  const { data, isLoading } = useSigns({ category, search });
  const archiveMutation = useArchiveSign();
  const { data: impactData, isLoading: isImpactLoading } = useSignImpact(selectedSignId || '');

  const handleSearch = () => setSearch(searchInput);
  const handleClear = () => {
    setSearchInput('');
    setSearch('');
  };

  const showImpactModal = (signId: string) => {
    setSelectedSignId(signId);
    setImpactModalVisible(true);
  };

  const columns = [
    {
      title: 'Canonical Code',
      dataIndex: 'canonicalCode',
      key: 'canonicalCode',
      width: 160,
      render: (code: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#1677ff' }}>
          🛡️ {code}
        </span>
      ),
    },
    {
      title: 'Name & Meaning',
      key: 'nameMeaning',
      render: (_: any, record: TrafficSign) => (
        <div>
          <Text strong>{record.canonicalName}</Text>
          <div style={{ fontSize: 12, color: '#64748b' }}>{record.meaning}</div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (cat: string) => {
        const colorMap: Record<string, string> = {
          TRAFFIC_REGULATORY: 'blue',
          WARNING_SIGNS: 'orange',
          TRAFFIC_SIGNALS: 'green',
          GENERAL_KNOWLEDGE: 'purple',
        };
        return <Tag color={colorMap[cat] || 'default'}>{cat.replace('_', ' ')}</Tag>;
      },
    },
    {
      title: 'Shape & Symbol',
      key: 'shapeSymbol',
      width: 140,
      render: (_: any, record: TrafficSign) => (
        <div>
          <Tag style={{ fontSize: 11 }}>{record.shape || 'N/A'}</Tag>
          <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>{record.primarySymbol || '—'}</div>
        </div>
      ),
    },
    {
      title: 'Country Variants',
      key: 'variants',
      render: (_: any, record: TrafficSign) => {
        const variants = record.variants || [];
        return (
          <Space wrap size={[4, 4]}>
            {variants.slice(0, 6).map((v) => (
              <Tooltip key={v.id} title={`${v.country?.name || 'Global'}: ${v.officialName}`}>
                <Tag style={{ fontSize: 11, cursor: 'help' }}>
                  {v.country?.flagEmoji || '🏳️'} {v.officialCode}
                </Tag>
              </Tooltip>
            ))}
            {variants.length > 6 && (
              <Tag style={{ fontSize: 11 }}>+{variants.length - 6} more</Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Questions',
      key: 'questionCount',
      width: 100,
      render: (_: any, record: TrafficSign) => (
        <Badge
          count={record._count?.questions || 0}
          showZero
          style={{ backgroundColor: (record._count?.questions || 0) > 0 ? '#10b981' : '#d9d9d9' }}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, record: TrafficSign) => (
        <Space>
          <Tooltip title="Impact Analysis">
            <Button
              type="text"
              icon={<InfoCircleOutlined />}
              onClick={() => showImpactModal(record.id)}
            />
          </Tooltip>
          <Popconfirm
            title="Archive this canonical sign?"
            description="All questions using this sign will retain canonical mapping."
            onConfirm={() => archiveMutation.mutate(record.id)}
          >
            <Tooltip title="Archive">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Canonical Traffic Signs
          </Title>
          <Text type="secondary">
            Unique canonical identity per concept with official country & jurisdiction visual variants
          </Text>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input
          placeholder="Search canonical code, name, or meaning…"
          prefix={<SearchOutlined />}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onPressEnter={handleSearch}
          allowClear
          onClear={handleClear}
          style={{ width: 340 }}
        />
        <Select
          placeholder="Filter by category"
          allowClear
          style={{ width: 220 }}
          value={category}
          onChange={(val) => setCategory(val)}
        >
          <Option value="TRAFFIC_REGULATORY">🔵 Regulatory Signs</Option>
          <Option value="WARNING_SIGNS">⚠️ Warning Signs</Option>
          <Option value="TRAFFIC_SIGNALS">🚦 Traffic Signals</Option>
        </Select>
        <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
          Search
        </Button>
      </div>

      <Table<TrafficSign>
        rowKey="id"
        columns={columns}
        dataSource={data?.items || []}
        loading={isLoading}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showTotal: (total) => `${total} canonical signs in platform`,
        }}
        size="middle"
      />

      {/* Impact Analysis Modal */}
      <Modal
        title="Sign Dependency & Impact Analysis"
        open={impactModalVisible}
        onOk={() => setImpactModalVisible(false)}
        onCancel={() => setImpactModalVisible(false)}
        width={600}
      >
        {isImpactLoading || !impactData ? (
          <Text>Loading impact data...</Text>
        ) : (
          <div>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Canonical Code">{impactData.canonicalCode}</Descriptions.Item>
              <Descriptions.Item label="Canonical Name">{impactData.canonicalName}</Descriptions.Item>
              <Descriptions.Item label="Referencing Questions">{impactData.questionCount}</Descriptions.Item>
              <Descriptions.Item label="Active Variants">{impactData.variantCount}</Descriptions.Item>
              <Descriptions.Item label="Applicable Countries">
                {impactData.affectedCountries.join(', ') || 'Global Core'}
              </Descriptions.Item>
            </Descriptions>

            <Text strong>Sample Questions Using This Sign:</Text>
            <ul style={{ paddingLeft: 20, marginTop: 8 }}>
              {impactData.sampleQuestions.map((q) => (
                <li key={q.id}>
                  <Text code>{q.questionCode || q.id.slice(0, 8)}</Text>: {q.text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </div>
  );
}
