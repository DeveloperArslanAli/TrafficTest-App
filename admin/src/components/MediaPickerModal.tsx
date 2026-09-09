import React, { useState, useEffect } from 'react';
import {
  Modal,
  Input,
  Button,
  Select,
  Row,
  Col,
  Card,
  Tag,
  Typography,
  Spin,
  Space,
  Empty,
  Pagination,
  Tooltip,
  message,
} from 'antd';
import {
  SearchOutlined,
  CloudUploadOutlined,
  CheckOutlined,
  ExportOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { usePexelsSearch, useMediaThemes, useSyncCloudinary } from '../services/media';
import type { PexelsPhoto } from '../types';

const { Text } = Typography;
const { Option } = Select;

interface MediaPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPhoto: (photo: PexelsPhoto, chosenUrl: string) => void;
  initialQuery?: string;
  title?: string;
}

export default function MediaPickerModal({
  visible,
  onClose,
  onSelectPhoto,
  initialQuery = 'traffic road sign',
  title = 'Pexels Real Traffic Photo Library',
}: MediaPickerModalProps) {
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const [orientation, setOrientation] = useState<string | undefined>(undefined);
  const [syncingPhotoId, setSyncingPhotoId] = useState<number | null>(null);

  const { data: themes } = useMediaThemes();
  const { data: searchResult, isLoading } = usePexelsSearch(
    { query: activeQuery, page, perPage: 12, orientation },
    visible,
  );
  const syncCloudinaryMutation = useSyncCloudinary();

  useEffect(() => {
    if (initialQuery && initialQuery !== activeQuery) {
      setQueryInput(initialQuery);
      setActiveQuery(initialQuery);
      setPage(1);
    }
  }, [initialQuery]);

  const handleSearch = () => {
    if (queryInput.trim()) {
      setActiveQuery(queryInput.trim());
      setPage(1);
    }
  };

  const handleThemeClick = (themeQuery: string) => {
    setQueryInput(themeQuery);
    setActiveQuery(themeQuery);
    setPage(1);
  };

  const handleSelectDirect = (photo: PexelsPhoto) => {
    const chosenUrl = photo.urls.large || photo.urls.medium || photo.urls.original;
    onSelectPhoto(photo, chosenUrl);
    message.success(`Attached photo by ${photo.photographer}`);
    onClose();
  };

  const handleSyncAndSelect = async (photo: PexelsPhoto) => {
    setSyncingPhotoId(photo.id);
    try {
      const sourceUrl = photo.urls.large || photo.urls.original;
      const res = await syncCloudinaryMutation.mutateAsync({
        photoUrl: sourceUrl,
        folder: 'roadwise/traffic',
        publicId: `pexels_${photo.id}`,
      });

      const finalUrl = res.secureUrl || sourceUrl;
      onSelectPhoto(photo, finalUrl);
      message.success(
        res.success
          ? `Synced to Cloudinary CDN & attached!`
          : `Direct Pexels CDN attached (${photo.photographer})`,
      );
      onClose();
    } catch (err: any) {
      // Fallback
      handleSelectDirect(photo);
    } finally {
      setSyncingPhotoId(null);
    }
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PictureOutlined style={{ color: '#1677ff' }} />
          <span>{title}</span>
          <Tag color="cyan">8,000+ Curated Traffic Images</Tag>
        </div>
      }
      open={visible}
      onCancel={onClose}
      width={1050}
      footer={null}
      destroyOnClose
      style={{ top: 30 }}
    >
      {/* Search Bar & Filters */}
      <div style={{ marginBottom: 16 }}>
        <Space.Compact style={{ width: '100%', marginBottom: 12 }}>
          <Input
            placeholder="Search road signs, traffic lights, highway scenarios, adverse weather..."
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            allowClear
          />
          <Select
            placeholder="Orientation"
            value={orientation}
            onChange={(val) => {
              setOrientation(val);
              setPage(1);
            }}
            style={{ width: 140 }}
            allowClear
          >
            <Option value="landscape">Landscape</Option>
            <Option value="portrait">Portrait</Option>
            <Option value="square">Square</Option>
          </Select>
          <Button type="primary" onClick={handleSearch} icon={<SearchOutlined />}>
            Search
          </Button>
        </Space.Compact>

        {/* Quick Theme Badges */}
        {themes && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12, marginRight: 4 }}>
              Presets:
            </Text>
            {themes.map((t) => (
              <Tag.CheckableTag
                key={t.id}
                checked={activeQuery === t.query}
                onChange={() => handleThemeClick(t.query)}
                style={{ cursor: 'pointer', padding: '2px 8px', fontSize: 12 }}
              >
                {t.badge}
              </Tag.CheckableTag>
            ))}
          </div>
        )}
      </div>

      {/* Results Body */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
          <div style={{ marginTop: 12, color: '#8c8c8c' }}>
            Querying Pexels Traffic Repository...
          </div>
        </div>
      ) : !searchResult?.photos || searchResult.photos.length === 0 ? (
        <Empty
          description="No traffic photos found for this query. Try broader keywords like 'traffic', 'highway', or 'road sign'."
          style={{ margin: '40px 0' }}
        />
      ) : (
        <>
          <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary" style={{ fontSize: 13 }}>
              Found <strong>{searchResult.totalResults.toLocaleString()}</strong> photos on Pexels (Page {page})
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              Free to use under Pexels License • High resolution
            </Text>
          </div>

          <Row gutter={[12, 12]} style={{ maxHeight: '540px', overflowY: 'auto', padding: '4px' }}>
            {searchResult.photos.map((photo) => (
              <Col xs={24} sm={12} md={8} lg={6} key={photo.id}>
                <Card
                  hoverable
                  bodyStyle={{ padding: 10 }}
                  cover={
                    <div style={{ height: 160, overflow: 'hidden', background: '#f1f5f9', position: 'relative' }}>
                      <img
                        alt={photo.alt}
                        src={photo.urls.medium || photo.urls.small}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="lazy"
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 4,
                          right: 4,
                          background: 'rgba(0,0,0,0.6)',
                          color: '#fff',
                          fontSize: 10,
                          padding: '2px 6px',
                          borderRadius: 4,
                        }}
                      >
                        {photo.dimensions.width}×{photo.dimensions.height}
                      </div>
                    </div>
                  }
                >
                  <div style={{ marginBottom: 8 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#1e293b',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={photo.alt}
                    >
                      {photo.alt || 'Traffic Scene'}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
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
                  </div>

                  <Space direction="vertical" style={{ width: '100%' }} size={4}>
                    <Button
                      type="primary"
                      size="small"
                      block
                      icon={<CheckOutlined />}
                      onClick={() => handleSelectDirect(photo)}
                    >
                      Select Photo
                    </Button>
                    <Button
                      size="small"
                      block
                      icon={<CloudUploadOutlined />}
                      loading={syncingPhotoId === photo.id}
                      onClick={() => handleSyncAndSelect(photo)}
                    >
                      Sync & Attach
                    </Button>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>

          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
            <Pagination
              current={page}
              pageSize={12}
              total={Math.min(searchResult.totalResults, 240)} // Cap pagination for snappy navigation
              onChange={(newPage) => setPage(newPage)}
              showSizeChanger={false}
            />
          </div>
        </>
      )}
    </Modal>
  );
}
