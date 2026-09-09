import React, { useState } from 'react';
import {
  Table,
  Button,
  Tag,
  Typography,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  Tooltip,
} from 'antd';
import { BookOutlined, PlusOutlined, LinkOutlined, EditOutlined } from '@ant-design/icons';
import { useSources, useCreateSource, useUpdateSource } from '../../services/sources';
import type { Source } from '../../types';

const { Title, Text } = Typography;

export default function SourceList() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [form] = Form.useForm();

  const { data: sources, isLoading } = useSources();
  const createMutation = useCreateSource();
  const updateMutation = useUpdateSource();

  const handleOpenModal = (source?: Source) => {
    setEditingSource(source || null);
    if (source) {
      form.setFieldsValue({
        name: source.name,
        url: source.url,
        document: source.document,
        section: source.section,
        page: source.page,
        tier: source.tier,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleFormSubmit = async () => {
    const values = await form.validateFields();
    if (editingSource) {
      updateMutation.mutate(
        {
          id: editingSource.id,
          payload: values,
          markRequiresReview: values.markRequiresReview,
        },
        {
          onSuccess: () => setModalVisible(false),
        },
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => setModalVisible(false),
      });
    }
  };

  const columns = [
    {
      title: 'Tier',
      dataIndex: 'tier',
      key: 'tier',
      width: 100,
      render: (tier: number) => (
        <Tag color={tier === 1 ? 'green' : tier === 2 ? 'blue' : 'default'}>
          {tier === 1 ? '★ Tier 1 (Govt)' : tier === 2 ? 'Tier 2 (Official)' : 'Tier 3'}
        </Tag>
      ),
    },
    {
      title: 'Authority & Document',
      key: 'authorityDoc',
      render: (_: any, record: Source) => (
        <div>
          <Text strong>{record.name}</Text>
          <div style={{ fontSize: 12, color: '#64748b' }}>
            {record.document} — {record.section || 'General'}
          </div>
        </div>
      ),
    },
    {
      title: 'Jurisdiction / Country',
      key: 'jurisdiction',
      width: 180,
      render: (_: any, record: Source) => (
        <Space>
          <span>{record.country?.flagEmoji || '🌐'}</span>
          <Text>{record.country?.name || 'Global Standards'}</Text>
        </Space>
      ),
    },
    {
      title: 'Citations',
      key: 'citations',
      width: 120,
      render: (_: any, record: Source) => (
        <Tag color="cyan">{record._count?.questions || 0} Questions</Tag>
      ),
    },
    {
      title: 'Source URL',
      dataIndex: 'url',
      key: 'url',
      width: 120,
      render: (url: string) =>
        url ? (
          <a href={url} target="_blank" rel="noreferrer">
            <LinkOutlined /> Verify Link
          </a>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_: any, record: Source) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleOpenModal(record)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Authoritative Content Sources
          </Title>
          <Text type="secondary">
            Tier-1 government manuals and official standards guaranteeing 100% legal factuality
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
          Add Official Source
        </Button>
      </div>

      <Table<Source>
        rowKey="id"
        columns={columns}
        dataSource={sources || []}
        loading={isLoading}
        pagination={false}
      />

      <Modal
        title={editingSource ? 'Edit Official Source' : 'Add Official Source'}
        open={modalVisible}
        onOk={handleFormSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Source Name / Authority" rules={[{ required: true }]}>
            <Input placeholder="e.g. FHWA MUTCD 11th Edition" />
          </Form.Item>
          <Form.Item name="document" label="Official Document / Manual Title" rules={[{ required: true }]}>
            <Input placeholder="e.g. Manual on Uniform Traffic Control Devices" />
          </Form.Item>
          <Form.Item name="section" label="Section / Chapter">
            <Input placeholder="e.g. Chapter 2B: Regulatory Signs" />
          </Form.Item>
          <Form.Item name="url" label="Official Verification URL">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="tier" label="Authority Tier" initialValue={1}>
            <Select>
              <Select.Option value={1}>Tier 1: Government / Legislative Authority</Select.Option>
              <Select.Option value={2}>Tier 2: Authorized Licensing Manual</Select.Option>
              <Select.Option value={3}>Tier 3: Educational Reference</Select.Option>
            </Select>
          </Form.Item>
          {editingSource && (
            <Form.Item name="markRequiresReview" valuePropName="checked">
              <Checkbox>
                Regulation / law has changed (flag all citing questions for review)
              </Checkbox>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
