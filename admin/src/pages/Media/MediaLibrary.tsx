import React, { useState } from 'react';
import {
  Card,
  Input,
  Button,
  Select,
  Row,
  Col,
  Tag,
  Typography,
  Spin,
  Space,
  Empty,
  Pagination,
  Modal,
  Drawer,
  Form,
  message,
  Divider,
} from 'antd';
import {
  SearchOutlined,
  CloudUploadOutlined,
  ExportOutlined,
  PictureOutlined,
  CheckCircleOutlined,
  LinkOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import {
  usePexelsSearch,
  useMediaThemes,
  useSyncCloudinary,
  useAttachToQuestion,
  useAttachToSign,
} from '../../services/media';
import type { PexelsPhoto } from '../../types';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

export default function MediaLibrary() {
  const [queryInput, setQueryInput] = useState('traffic road sign');
  const [activeQuery, setActiveQuery] = useState('traffic road sign');
  const [page, setPage] = useState(1);
  const [orientation, setOrientation] = useState<string | undefined>(undefined);
  const [previewPhoto, setPreviewPhoto] = useState<PexelsPhoto | null>(null);

  // Quick Attach Drawer
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedForAttach, setSelectedForAttach] = useState<PexelsPhoto | null>(null);
  const [attachType, setAttachType] = useState<'QUESTION' | 'SIGN'>('QUESTION');
  const [attachTargetId, setAttachTargetId] = useState('');

  const { data: themes } = useMediaThemes();
  const { data: searchResult, isLoading } = usePexelsSearch({
    query: activeQuery,
    page,
    perPage: 16,
    orientation,
  });

  const syncMutation = useSyncCloudinary();
  const attachQuestionMutation = useAttachToQuestion();
  const attachSignMutation = useAttachToSign();

  const handleSearch = () => {
    if (queryInput.trim()) {
      setActiveQuery(queryInput.trim());
      setPage(1);
    }
  };

  const handleThemeClick = (q: string) => {
    setQueryInput(q);
    setActiveQuery(q);
    setPage(1);
  };

  const openAttachDrawer = (photo: PexelsPhoto) => {
    setSelectedForAttach(photo);
    setDrawerVisible(true);
  };

  const handleExecuteAttach = async () => {
    if (!selectedForAttach || !attachTargetId.trim()) {
      message.error('Please enter the target Question ID or Sign Variant ID');
      return;
    }

    const finalUrl =
      selectedForAttach.urls.large ||
      selectedForAttach.urls.medium ||
      selectedForAttach.urls.original;

    try {
      if (attachType === 'QUESTION') {
        await attachQuestionMutation.mutateAsync({
          questionId: attachTargetId.trim(),
          imageUrl: finalUrl,
          photographer: selectedForAttach.photographer,
        });
        message.success(`Attached photo to question '${attachTargetId}'!`);
      } else {
        await attachSignMutation.mutateAsync({
          variantId: attachTargetId.trim(),
          imageUrl: finalUrl,
        });
        message.success(`Attached photo to sign variant '${attachTargetId}'!`);
      }
      setDrawerVisible(false);
      setAttachTargetId('');
    } catch (err: any) {
      message.error(`Failed to attach: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div>
      {/* Header Banner */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <PictureOutlined style={{ color: '#1677ff' }} />
            Traffic Media Studio & Pexels Integration
          </Title>
          <Text type="secondary">
            Curate high-resolution road signs, traffic signals, and driving scenarios across global jurisdictions
          </Text>
        </div>
        <Space>
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Pexels API Connected
          </Tag>
          <Tag color="blue" icon={<CloudUploadOutlined />}>
            Cloudinary CDN Ready
          </Tag>
        </Space>
      </div>

      {/* Control Card */}
      <Card bordered={false} style={{ borderRadius: 12, marginBottom: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <Space.Compact style={{ width: '100%', marginBottom: 12 }}>
          <Input
            placeholder="Search keywords: 'stop sign', 'roundabout', 'traffic light', 'pedestrian crosswalk', 'fog driving'..."
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            size="large"
            allowClear
          />
          <Select
            placeholder="Aspect Ratio"
            value={orientation}
            onChange={(val) => {
              setOrientation(val);
              setPage(1);
            }}
            size="large"
            style={{ width: 160 }}
            allowClear
          >
            <Option value="landscape">Landscape</Option>
            <Option value="portrait">Portrait</Option>
            <Option value="square">Square</Option>
          </Select>
          <Button type="primary" size="large" onClick={handleSearch} icon={<SearchOutlined />}>
            Search Library
          </Button>
        </Space.Compact>

        {/* Preset Badges */}
        {themes && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <Text type="secondary" style={{ fontSize: 13, marginRight: 4 }}>
              Curated Collections:
            </Text>
            {themes.map((t) => (
              <Tag.CheckableTag
                key={t.id}
                checked={activeQuery === t.query}
                onChange={() => handleThemeClick(t.query)}
                style={{
                  cursor: 'pointer',
                  padding: '4px 12px',
                  borderRadius: 16,
                  fontSize: 13,
                }}
              >
                {t.badge}
              </Tag.CheckableTag>
            ))}
          </div>
        )}
      </Card>

      {/* Main Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#64748b' }}>
            Fetching high-resolution traffic imagery from Pexels API...
          </div>
        </div>
      ) : !searchResult?.photos || searchResult.photos.length === 0 ? (
        <Card style={{ borderRadius: 12, textAlign: 'center', padding: 40 }}>
          <Empty description="No photos found. Try modifying your search query." />
        </Card>
      ) : (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text strong style={{ fontSize: 14 }}>
              Showing {searchResult.photos.length} of {searchResult.totalResults.toLocaleString()} traffic photographs
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Verified royalty-free under the Pexels Public License
            </Text>
          </div>

          <Row gutter={[16, 16]}>
            {searchResult.photos.map((photo) => (
              <Col xs={24} sm={12} md={8} lg={6} key={photo.id}>
                <Card
                  hoverable
                  bodyStyle={{ padding: 12 }}
                  style={{ borderRadius: 10, overflow: 'hidden' }}
                  cover={
                    <div
                      style={{
                        height: 180,
                        overflow: 'hidden',
                        background: '#e2e8f0',
                        position: 'relative',
                        cursor: 'pointer',
                      }}
                      onClick={() => setPreviewPhoto(photo)}
                    >
                      <img
                        alt={photo.alt}
                        src={photo.urls.medium || photo.urls.small}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 6,
                          right: 6,
                          background: 'rgba(0,0,0,0.65)',
                          color: '#fff',
                          fontSize: 11,
                          padding: '2px 6px',
                          borderRadius: 4,
                        }}
                      >
                        {photo.dimensions.width} × {photo.dimensions.height}
                      </div>
                    </div>
                  }
                >
                  <Paragraph
                    ellipsis={{ rows: 1 }}
                    style={{ fontWeight: 600, margin: '0 0 4px 0', fontSize: 13 }}
                    title={photo.alt}
                  >
                    {photo.alt || 'Traffic Scenario'}
                  </Paragraph>

                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>
                    Photo by{' '}
                    <a
                      href={photo.photographerUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#1677ff' }}
                    >
                      {photo.photographer} <ExportOutlined style={{ fontSize: 10 }} />
                    </a>
                  </div>

                  <Space style={{ width: '100%' }} direction="vertical" size={6}>
                    <Button
                      type="primary"
                      size="small"
                      block
                      icon={<LinkOutlined />}
                      onClick={() => openAttachDrawer(photo)}
                    >
                      Attach to Question / Sign
                    </Button>
                    <Button
                      size="small"
                      block
                      onClick={() => setPreviewPhoto(photo)}
                    >
                      Inspect Details
                    </Button>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Pagination
              current={page}
              pageSize={16}
              total={Math.min(searchResult.totalResults, 320)}
              onChange={(newPage) => setPage(newPage)}
              showSizeChanger={false}
            />
          </div>
        </>
      )}

      {/* Full Photo Preview Modal */}
      {previewPhoto && (
        <Modal
          open={!!previewPhoto}
          onCancel={() => setPreviewPhoto(null)}
          footer={null}
          width={800}
          title={previewPhoto.alt || 'Traffic Photo Preview'}
        >
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <img
              src={previewPhoto.urls.large || previewPhoto.urls.medium}
              alt={previewPhoto.alt}
              style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: 8 }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong>Photographer: </Text>
              <a href={previewPhoto.photographerUrl} target="_blank" rel="noreferrer">
                {previewPhoto.photographer} <ExportOutlined />
              </a>
              <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                Resolution: {previewPhoto.dimensions.width} × {previewPhoto.dimensions.height}
              </div>
            </div>
            <Space>
              <Button
                type="primary"
                icon={<LinkOutlined />}
                onClick={() => {
                  setPreviewPhoto(null);
                  openAttachDrawer(previewPhoto);
                }}
              >
                Attach Media
              </Button>
              <Button
                href={previewPhoto.urls.original}
                target="_blank"
                icon={<ExportOutlined />}
              >
                Open Original
              </Button>
            </Space>
          </div>
        </Modal>
      )}

      {/* Quick Attach Drawer */}
      <Drawer
        title="Attach Media to Platform Entity"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={420}
      >
        {selectedForAttach && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <img
                src={selectedForAttach.urls.medium}
                alt={selectedForAttach.alt}
                style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8 }}
              />
              <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
                Photo by {selectedForAttach.photographer}
              </div>
            </div>

            <Divider />

            <Form layout="vertical">
              <Form.Item label="Target Entity Type">
                <Select
                  value={attachType}
                  onChange={(v) => setAttachType(v)}
                  style={{ width: '100%' }}
                >
                  <Option value="QUESTION">Question (Quiz & Practice)</Option>
                  <Option value="SIGN">Traffic Sign Variant</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label={attachType === 'QUESTION' ? 'Question ID (or Code)' : 'Sign Variant ID'}
                required
                help={
                  attachType === 'QUESTION'
                    ? "Enter UUID from Question table or code (e.g. 'Q-REG-001')"
                    : 'Enter UUID of the TrafficSignVariant record'
                }
              >
                <Input
                  placeholder={attachType === 'QUESTION' ? 'e.g. 550e8400-e29b...' : 'e.g. a7b2c3d4...'}
                  value={attachTargetId}
                  onChange={(e) => setAttachTargetId(e.target.value)}
                />
              </Form.Item>

              <Button
                type="primary"
                block
                size="large"
                icon={<CheckCircleOutlined />}
                loading={attachQuestionMutation.isPending || attachSignMutation.isPending}
                onClick={handleExecuteAttach}
                style={{ marginTop: 12 }}
              >
                Confirm & Attach Image
              </Button>
            </Form>
          </div>
        )}
      </Drawer>
    </div>
  );
}
