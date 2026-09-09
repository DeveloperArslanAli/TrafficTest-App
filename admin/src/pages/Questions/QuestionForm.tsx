import React, { useEffect, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Radio,
  Select,
  Space,
  Switch,
  Typography,
  Upload,
  message,
  Spin,
  Image,
  Tag,
} from 'antd';
import { InboxOutlined, ArrowLeftOutlined, PictureOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useCreateQuestion,
  useQuestion,
  useUpdateQuestion,
} from '../../services/questions';
import MediaPickerModal from '../../components/MediaPickerModal';

const { Title } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

type AnswerLabel = 'A' | 'B' | 'C' | 'D';
const ANSWER_LABELS: AnswerLabel[] = ['A', 'B', 'C', 'D'];
const ANSWER_INDEX: Record<AnswerLabel, number> = { A: 0, B: 1, C: 2, D: 3 };
const INDEX_ANSWER: Record<number, AnswerLabel> = { 0: 'A', 1: 'B', 2: 'C', 3: 'D' };

interface FormValues {
  category: string;
  text: string;
  signCode?: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: AnswerLabel;
  explanation?: string;
  isPublished: boolean;
}

export default function QuestionForm() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [selectedPexelsUrl, setSelectedPexelsUrl] = useState<string | null>(null);

  const { data: question, isLoading } = useQuestion(id ?? '');
  const createMutation = useCreateQuestion();
  const updateMutation = useUpdateQuestion();

  // Prefill form when editing
  useEffect(() => {
    if (isEdit && question) {
      const optionsArray: string[] = Array.isArray(question.options)
        ? (question.options as string[])
        : typeof question.options === 'string'
        ? JSON.parse(question.options)
        : [];

      form.setFieldsValue({
        category: question.category,
        text: question.text,
        signCode: question.signCode ?? undefined,
        optionA: optionsArray[0] ?? '',
        optionB: optionsArray[1] ?? '',
        optionC: optionsArray[2] ?? '',
        optionD: optionsArray[3] ?? '',
        correctAnswer: INDEX_ANSWER[question.correctIndex] ?? 'A',
        explanation: question.explanation ?? '',
        isPublished: question.isPublished,
      });
      if (question.imageUrl) {
        setPreviewUrl(question.imageUrl);
      }
    } else if (!isEdit) {
      form.setFieldsValue({ isPublished: true });
    }
  }, [isEdit, question, form]);

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    maxCount: 1,
    fileList,
    accept: 'image/*',
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('Only image files are allowed');
        return Upload.LIST_IGNORE;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Image must be smaller than 5 MB');
        return Upload.LIST_IGNORE;
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFileList([
        {
          uid: '-1',
          name: file.name,
          status: 'done',
          originFileObj: file,
        } as UploadFile,
      ]);
      return false; // prevent auto-upload
    },
    onRemove: () => {
      setFileList([]);
      setPreviewUrl(null);
    },
  };

  const handleSubmit = async (values: FormValues) => {
    const formData = new FormData();
    formData.append('category', values.category);
    formData.append('text', values.text);
    formData.append(
      'options',
      JSON.stringify([
        values.optionA,
        values.optionB,
        values.optionC,
        values.optionD,
      ]),
    );
    formData.append('correctIndex', String(ANSWER_INDEX[values.correctAnswer]));
    if (values.explanation) formData.append('explanation', values.explanation);
    if (values.signCode) formData.append('signCode', values.signCode);
    formData.append('isPublished', String(values.isPublished));

    const rawFile = fileList[0]?.originFileObj;
    if (rawFile) {
      formData.append('image', rawFile as Blob);
    } else if (selectedPexelsUrl) {
      formData.append('imageUrl', selectedPexelsUrl);
    }

    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      navigate('/admin/questions');
    } catch {
      // errors are handled inside mutations
    }
  };

  if (isEdit && isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* Page header */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/questions')}
        >
          Back
        </Button>
        <Title level={4} style={{ margin: 0 }}>
          {isEdit ? 'Edit Question' : 'New Question'}
        </Title>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ isPublished: true }}
        size="large"
      >
        {/* Category */}
        <Form.Item
          label="Category"
          name="category"
          rules={[{ required: true, message: 'Please select a category' }]}
        >
          <Select placeholder="Select a category">
            <Select.Option value="WARNING">⚠️ WARNING</Select.Option>
            <Select.Option value="REGULATORY">🔵 REGULATORY</Select.Option>
            <Select.Option value="SIGNAL">🟢 SIGNAL</Select.Option>
            <Select.Option value="GENERAL">⬜ GENERAL</Select.Option>
          </Select>
        </Form.Item>

        {/* Vector Road Sign Code */}
        <Form.Item
          label="Vector Road Sign (Optional)"
          name="signCode"
          tooltip="Standard vector SVG identifier rendered offline (e.g. STOP_SIGN, CURVE_RIGHT, TRAFFIC_LIGHT_RED, SPEED_LIMIT_50). Leave blank for scenario or general knowledge questions."
        >
          <Input placeholder="e.g. STOP_SIGN, YIELD_SIGN, CURVE_RIGHT, TRAFFIC_LIGHT_RED" allowClear />
        </Form.Item>

        {/* Question Text */}
        <Form.Item
          label="Question Text"
          name="text"
          rules={[
            { required: true, message: 'Please enter the question text' },
            { min: 5, message: 'Question must be at least 5 characters' },
          ]}
        >
          <TextArea
            rows={3}
            placeholder="Enter the quiz question…"
            showCount
            maxLength={500}
          />
        </Form.Item>

        {/* Answer Options */}
        <Form.Item label="Answer Options (A – D)">
          <Space direction="vertical" style={{ width: '100%' }} size={10}>
            {ANSWER_LABELS.map((label) => (
              <Form.Item
                key={label}
                name={`option${label}` as keyof FormValues}
                noStyle
                rules={[
                  { required: true, message: `Option ${label} is required` },
                ]}
              >
                <Input
                  addonBefore={<strong>{label}</strong>}
                  placeholder={`Option ${label}`}
                />
              </Form.Item>
            ))}
          </Space>
        </Form.Item>

        {/* Correct Answer */}
        <Form.Item
          label="Correct Answer"
          name="correctAnswer"
          rules={[{ required: true, message: 'Please select the correct answer' }]}
        >
          <Radio.Group buttonStyle="solid">
            {ANSWER_LABELS.map((label) => (
              <Radio.Button key={label} value={label}>
                {label}
              </Radio.Button>
            ))}
          </Radio.Group>
        </Form.Item>

        {/* Explanation */}
        <Form.Item label="Explanation (optional)" name="explanation">
          <TextArea
            rows={2}
            placeholder="Explain why this answer is correct…"
            showCount
            maxLength={1000}
          />
        </Form.Item>

        {/* Image Upload */}
        <Form.Item label="Question Image (optional)">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
            <Button
              icon={<PictureOutlined style={{ color: '#1677ff' }} />}
              onClick={() => setMediaPickerOpen(true)}
              style={{ borderRadius: 6 }}
            >
              🔍 Browse Pexels Real Traffic Photo Library
            </Button>
            {selectedPexelsUrl && (
              <Tag
                color="cyan"
                closable
                onClose={() => {
                  setSelectedPexelsUrl(null);
                  setPreviewUrl(null);
                }}
              >
                Stock Photo Attached
              </Tag>
            )}
          </div>
          <Dragger {...uploadProps} style={{ borderRadius: 8 }}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Or click/drag an image from your computer</p>
            <p className="ant-upload-hint">PNG, JPG, WEBP · Max 5 MB</p>
          </Dragger>
          {previewUrl && (
            <div style={{ marginTop: 12 }}>
              <Image
                src={previewUrl}
                alt="Preview"
                style={{
                  maxHeight: 200,
                  borderRadius: 8,
                  objectFit: 'contain',
                }}
              />
            </div>
          )}
          <MediaPickerModal
            visible={mediaPickerOpen}
            onClose={() => setMediaPickerOpen(false)}
            onSelectPhoto={(_photo, chosenUrl) => {
              setPreviewUrl(chosenUrl);
              setSelectedPexelsUrl(chosenUrl);
              setFileList([]);
            }}
            initialQuery={
              form.getFieldValue('category')?.replace('_', ' ') || 'traffic road sign'
            }
          />
        </Form.Item>

        {/* Published toggle */}
        <Form.Item label="Published" name="isPublished" valuePropName="checked">
          <Switch checkedChildren="Published" unCheckedChildren="Draft" />
        </Form.Item>

        {/* Actions */}
        <Form.Item style={{ marginTop: 8 }}>
          <Space>
            <Button type="primary" htmlType="submit" loading={isPending}>
              {isEdit ? 'Save Changes' : 'Create Question'}
            </Button>
            <Button onClick={() => navigate('/admin/questions')}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}
