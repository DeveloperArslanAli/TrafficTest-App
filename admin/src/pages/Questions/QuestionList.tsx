import React, { useState } from 'react';
import {
  Button,
  Input,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  Image,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import {
  useDeleteQuestion,
  useQuestions,
  useTogglePublish,
} from '../../services/questions';
import type { Question } from '../../types';

const { Title, Text } = Typography;
const { Option } = Select;

const CATEGORY_COLORS: Record<string, string> = {
  TRAFFIC_REGULATORY: 'blue',
  WARNING_SIGNS: 'orange',
  TRAFFIC_SIGNALS: 'green',
  GENERAL_KNOWLEDGE: 'purple',
  REGULATORY: 'blue',
  WARNING: 'orange',
  SIGNAL: 'green',
  GENERAL: 'purple',
};

export default function QuestionList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data, isLoading } = useQuestions({
    category,
    search,
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const deleteMutation = useDeleteQuestion();
  const togglePublish = useTogglePublish();

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput);
  };

  const handleSearchClear = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const columns: ColumnsType<Question> = [
    {
      title: 'Code / ID',
      dataIndex: 'questionCode',
      key: 'questionCode',
      width: 140,
      render: (code: string, record: Question) => (
        <Tooltip title={`ID: ${record.id}`}>
          <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: 12, color: '#1677ff' }}>
            {code || `${record.id.slice(0, 8)}…`}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (cat: string) => (
        <Tag color={CATEGORY_COLORS[cat] || 'default'}>{cat.replace('_', ' ')}</Tag>
      ),
    },
    {
      title: 'Question Text',
      dataIndex: 'text',
      key: 'text',
      render: (text: string) => (
        <Tooltip title={text}>
          <span style={{ fontWeight: 500 }}>
            {text && text.length > 70 ? `${text.slice(0, 70)}…` : text}
          </span>
        </Tooltip>
      ),
    },
    {
      title: 'Country / Scope',
      key: 'country',
      width: 130,
      render: (_: unknown, record: Question) => (
        <Space size={4}>
          <span>{record.country?.flagEmoji || '🌐'}</span>
          <Text style={{ fontSize: 12 }}>{record.country?.code || 'Global'}</Text>
        </Space>
      ),
    },
    {
      title: 'Sign / Visual',
      key: 'visual',
      width: 130,
      render: (_: unknown, record: Question) => (
        <Space direction="vertical" size={2}>
          {record.imageUrl ? (
            <Image
              src={record.imageUrl}
              width={36}
              height={36}
              style={{ objectFit: 'cover', borderRadius: 4 }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
            />
          ) : null}
          {record.sign?.canonicalCode || record.signCode ? (
            <Tag color="cyan" style={{ fontSize: 10, margin: 0 }}>
              🛡️ {record.sign?.canonicalCode || record.signCode}
            </Tag>
          ) : !record.imageUrl ? (
            <span style={{ color: '#bbb' }}>—</span>
          ) : null}
        </Space>
      ),
    },
    {
      title: 'Source Authority',
      key: 'source',
      width: 160,
      render: (_: unknown, record: Question) => (
        <span style={{ fontSize: 11, color: '#64748b' }}>
          {record.source?.name ? `🏛️ ${record.source.name}` : '—'}
        </span>
      ),
    },
    {
      title: 'Published',
      dataIndex: 'isPublished',
      key: 'isPublished',
      width: 100,
      render: (isPublished: boolean, record: Question) => (
        <Switch
          checked={isPublished}
          loading={togglePublish.isPending}
          onChange={(checked) =>
            togglePublish.mutate({ id: record.id, isPublished: checked })
          }
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 110,
      render: (_: unknown, record: Question) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/admin/questions/${record.id}/edit`)}
            />
          </Tooltip>
          <Popconfirm
            title="Archive this question?"
            description="Preserves user attempt history while removing from active quiz."
            okText="Archive"
            okType="danger"
            cancelText="Cancel"
            onConfirm={() => deleteMutation.mutate(record.id)}
          >
            <Tooltip title="Archive">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                loading={deleteMutation.isPending}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Question Bank
          </Title>
          <Text type="secondary">
            Global and country-specific questions bound to canonical signs and authoritative sources
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin/questions/new')}
        >
          Add Question
        </Button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <Input
          placeholder="Search question code, text, or sign…"
          prefix={<SearchOutlined />}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onPressEnter={handleSearch}
          allowClear
          onClear={handleSearchClear}
          style={{ width: 320 }}
        />
        <Select
          placeholder="Filter by category"
          allowClear
          style={{ width: 220 }}
          value={category}
          onChange={(val) => {
            setCategory(val);
            setPage(1);
          }}
          onClear={() => {
            setCategory(undefined);
            setPage(1);
          }}
        >
          <Option value="TRAFFIC_REGULATORY">🔵 Regulatory Signs</Option>
          <Option value="WARNING_SIGNS">⚠️ Warning Signs</Option>
          <Option value="TRAFFIC_SIGNALS">🟢 Traffic Signals</Option>
          <Option value="GENERAL_KNOWLEDGE">📋 General Knowledge</Option>
        </Select>
        <Button onClick={handleSearch} type="primary" icon={<SearchOutlined />}>
          Search
        </Button>
      </div>

      <Table<Question>
        rowKey="id"
        columns={columns}
        dataSource={data?.items || []}
        loading={isLoading}
        pagination={{
          current: page,
          pageSize,
          total: data?.total || 0,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
          showTotal: (total) => `${total} active questions total`,
        }}
        size="middle"
      />
    </div>
  );
}
