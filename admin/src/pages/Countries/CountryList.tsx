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
} from 'antd';
import { GlobalOutlined, PlusOutlined } from '@ant-design/icons';
import { useCountries, useCreateCountry, useCreateJurisdiction } from '../../services/countries';
import type { Country } from '../../types';

const { Title, Text } = Typography;

export default function CountryList() {
  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [jurisdictionModalVisible, setJurisdictionModalVisible] = useState(false);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);

  const [countryForm] = Form.useForm();
  const [jurisdictionForm] = Form.useForm();

  const { data: countries, isLoading } = useCountries();
  const createCountryMutation = useCreateCountry();
  const createJurisdictionMutation = useCreateJurisdiction();

  const handleOpenJurisdictionModal = (countryId: string) => {
    setSelectedCountryId(countryId);
    jurisdictionForm.resetFields();
    setJurisdictionModalVisible(true);
  };

  const handleCountrySubmit = async () => {
    const values = await countryForm.validateFields();
    createCountryMutation.mutate(values, {
      onSuccess: () => {
        setCountryModalVisible(false);
        countryForm.resetFields();
      },
    });
  };

  const handleJurisdictionSubmit = async () => {
    if (!selectedCountryId) return;
    const values = await jurisdictionForm.validateFields();
    createJurisdictionMutation.mutate(
      { countryId: selectedCountryId, payload: values },
      {
        onSuccess: () => {
          setJurisdictionModalVisible(false);
          jurisdictionForm.resetFields();
        },
      },
    );
  };

  const columns = [
    {
      title: 'Country',
      key: 'country',
      render: (_: any, record: Country) => (
        <Space>
          <span style={{ fontSize: 20 }}>{record.flagEmoji || '🏳️'}</span>
          <Text strong>{record.name}</Text>
          <Tag color="blue">{record.code}</Tag>
        </Space>
      ),
    },
    {
      title: 'Jurisdictions / States / Provinces',
      key: 'jurisdictions',
      render: (_: any, record: Country) => {
        const juris = record.jurisdictions || [];
        if (juris.length === 0) return <Text type="secondary">National Single Rule System</Text>;
        return (
          <Space wrap size={[4, 4]}>
            {juris.map((j) => (
              <Tag key={j.id} color="geekblue">
                {j.name} ({j.code})
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'Active Questions',
      key: 'questions',
      width: 150,
      render: (_: any, record: Country) => (
        <Tag color="green">{record._count?.questions || 0} Questions</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_: any, record: Country) => (
        <Button size="small" onClick={() => handleOpenJurisdictionModal(record.id)}>
          + Add Jurisdiction
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>
            Countries & Jurisdictions Architecture
          </Title>
          <Text type="secondary">
            Multi-tier legal hierarchy: Global Core → Country Law → State / Provincial Authority
          </Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCountryModalVisible(true)}>
          Add Country
        </Button>
      </div>

      <Table<Country>
        rowKey="id"
        columns={columns}
        dataSource={countries || []}
        loading={isLoading}
        pagination={false}
      />

      {/* Add Country Modal */}
      <Modal
        title="Add New Country Pack"
        open={countryModalVisible}
        onOk={handleCountrySubmit}
        onCancel={() => setCountryModalVisible(false)}
        confirmLoading={createCountryMutation.isPending}
      >
        <Form form={countryForm} layout="vertical">
          <Form.Item name="name" label="Country Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Germany" />
          </Form.Item>
          <Form.Item name="code" label="ISO Alpha-2 Code" rules={[{ required: true }]}>
            <Input placeholder="e.g. DE" maxLength={10} />
          </Form.Item>
          <Form.Item name="flagEmoji" label="Flag Emoji">
            <Input placeholder="e.g. 🇩🇪" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Jurisdiction Modal */}
      <Modal
        title="Add State / Province / Jurisdiction"
        open={jurisdictionModalVisible}
        onOk={handleJurisdictionSubmit}
        onCancel={() => setJurisdictionModalVisible(false)}
        confirmLoading={createJurisdictionMutation.isPending}
      >
        <Form form={jurisdictionForm} layout="vertical">
          <Form.Item name="name" label="Jurisdiction Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Bavaria" />
          </Form.Item>
          <Form.Item name="code" label="Jurisdiction Code" rules={[{ required: true }]}>
            <Input placeholder="e.g. BY" />
          </Form.Item>
          <Form.Item name="type" label="Jurisdiction Type" initialValue="STATE">
            <Select>
              <Select.Option value="STATE">State</Select.Option>
              <Select.Option value="PROVINCE">Province</Select.Option>
              <Select.Option value="EMIRATE">Emirate</Select.Option>
              <Select.Option value="TERRITORY">Territory</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
