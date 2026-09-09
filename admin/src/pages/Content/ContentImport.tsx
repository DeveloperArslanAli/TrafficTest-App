import React, { useState } from 'react';
import {
  Card,
  Button,
  Input,
  Typography,
  Space,
  Alert,
  Table,
  Tag,
  message,
} from 'antd';
import { CloudUploadOutlined, CheckCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useValidateBatch, useImportBatch } from '../../services/content';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function ContentImport() {
  const [jsonInput, setJsonInput] = useState('');
  const [parsedItems, setParsedItems] = useState<any[]>([]);
  const [validationResult, setValidationResult] = useState<any | null>(null);

  const validateMutation = useValidateBatch();
  const importMutation = useImportBatch();

  const handleValidate = () => {
    try {
      const items = JSON.parse(jsonInput);
      if (!Array.isArray(items)) {
        message.error('Input must be a JSON array of question objects');
        return;
      }
      setParsedItems(items);
      validateMutation.mutate(items, {
        onSuccess: (data) => {
          setValidationResult(data);
          message.success(`Validated ${data.total} items: ${data.validCount} valid, ${data.errorCount} errors`);
        },
      });
    } catch (e: any) {
      message.error(`Invalid JSON syntax: ${e.message}`);
    }
  };

  const handleImport = () => {
    if (!parsedItems.length) return;
    importMutation.mutate(parsedItems, {
      onSuccess: () => {
        setJsonInput('');
        setParsedItems([]);
        setValidationResult(null);
      },
    });
  };

  const columns = [
    {
      title: 'Index',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (i: number) => `#${i + 1}`,
    },
    {
      title: 'Status',
      dataIndex: 'valid',
      key: 'valid',
      width: 120,
      render: (valid: boolean, record: any) => (
        <Tag color={valid ? 'green' : 'red'}>
          {valid ? 'READY' : 'INVALID'}
        </Tag>
      ),
    },
    {
      title: 'Validation Errors',
      dataIndex: 'errors',
      key: 'errors',
      render: (errors: string[]) =>
        errors.length > 0 ? (
          <Space direction="vertical" size={2}>
            {errors.map((err, idx) => (
              <Tag key={idx} color="error">{err}</Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Duplicate Warning',
      dataIndex: 'duplicateWarning',
      key: 'duplicateWarning',
      render: (w?: string) => (w ? <Tag color="warning">{w}</Tag> : <Text type="secondary">—</Text>),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <Title level={4} style={{ margin: 0 }}>
          Content Ingestion & Pre-Validation Pipeline
        </Title>
        <Text type="secondary">
          Quality Gate Enforcement: Strict schema, 4-option validation, duplicate pre-check before database insertion
        </Text>
      </div>

      <Card title="JSON Batch Input" bordered={false} style={{ borderRadius: 12, marginBottom: 20 }}>
        <TextArea
          rows={10}
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder={`[
  {
    "category": "TRAFFIC_REGULATORY",
    "questionType": "SIGN_IDENTIFICATION",
    "difficulty": "EASY",
    "text": "What does a Stop sign mean?",
    "options": ["Complete stop required", "Yield to traffic", "Drive faster", "No parking"],
    "correctIndex": 0,
    "explanation": "Stop sign requires full stop."
  }
]`}
          style={{ fontFamily: 'monospace', fontSize: 13 }}
        />
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            type="primary"
            icon={<SafetyCertificateOutlined />}
            loading={validateMutation.isPending}
            onClick={handleValidate}
            disabled={!jsonInput.trim()}
          >
            Pre-Validate Batch
          </Button>

          {validationResult && validationResult.errorCount === 0 && (
            <Button
              type="primary"
              style={{ backgroundColor: '#10b981' }}
              icon={<CloudUploadOutlined />}
              loading={importMutation.isPending}
              onClick={handleImport}
            >
              Import {validationResult.validCount} Questions as DRAFT
            </Button>
          )}
        </div>
      </Card>

      {validationResult && (
        <Card title="Batch Pre-Validation Report" bordered={false} style={{ borderRadius: 12 }}>
          <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
            <Tag color="blue" style={{ fontSize: 13, padding: '4px 8px' }}>Total Items: {validationResult.total}</Tag>
            <Tag color="green" style={{ fontSize: 13, padding: '4px 8px' }}>Valid: {validationResult.validCount}</Tag>
            <Tag color={validationResult.errorCount > 0 ? 'red' : 'default'} style={{ fontSize: 13, padding: '4px 8px' }}>
              Errors: {validationResult.errorCount}
            </Tag>
          </div>

          <Table
            rowKey="index"
            columns={columns}
            dataSource={validationResult.items}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )}
    </div>
  );
}
