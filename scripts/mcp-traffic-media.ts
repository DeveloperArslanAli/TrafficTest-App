#!/usr/bin/env ts-node
/**
 * ============================================================================
 * TRAFFICTEST — MODEL CONTEXT PROTOCOL (MCP) TRAFFIC MEDIA SERVER
 * ============================================================================
 * Standard JSON-RPC 2.0 Stdio MCP Server for Pexels API & Cloudinary Media
 * Integration for the TrafficTest Global Knowledge Platform.
 * ============================================================================
 */

import * as https from 'https';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';

// Initialize Prisma lazily
let prismaClient: PrismaClient | null = null;
function getPrisma(): PrismaClient {
  if (!prismaClient) {
    prismaClient = new PrismaClient();
  }
  return prismaClient;
}

const PEXELS_API_KEY =
  process.env.PEXELS_API_KEY || 'u7sdsvstjoD41Bw2Lc4mOJltq8ecJ9eaLrlcQL26zcpUljMKVGXl9sl8';
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'dmwnyhqji';
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '123456789';
const CLOUDINARY_API_SECRET =
  process.env.CLOUDINARY_API_SECRET || 'elkn25zVduw0pOwEs6-s2syK_zE';

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

function log(message: string, ...args: any[]) {
  process.stderr.write(`[MCP:TrafficMedia] ${message} ${args.length ? JSON.stringify(args) : ''}\n`);
}

// Helper: HTTP Request to Pexels API
function pexelsRequest(path: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const options: https.RequestOptions = {
      hostname: 'api.pexels.com',
      path,
      method: 'GET',
      headers: {
        Authorization: PEXELS_API_KEY,
        'User-Agent': 'TrafficTest-MCP/1.0',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse Pexels response: ${data}`));
          }
        } else {
          reject(new Error(`Pexels API error (${res.statusCode}): ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Tool Implementations
// ---------------------------------------------------------------------------

async function searchTrafficPhotos(args: {
  query: string;
  perPage?: number;
  page?: number;
  orientation?: string;
}) {
  const { query, perPage = 10, page = 1, orientation } = args;
  const encodedQuery = encodeURIComponent(query);
  let path = `/v1/search?query=${encodedQuery}&per_page=${perPage}&page=${page}`;
  if (orientation) {
    path += `&orientation=${orientation}`;
  }

  const result = await pexelsRequest(path);
  const photos = (result.photos || []).map((p: any) => ({
    id: p.id,
    alt: p.alt || 'Traffic Photo',
    photographer: p.photographer,
    photographerUrl: p.photographer_url,
    url: p.url,
    dimensions: { width: p.width, height: p.height },
    urls: {
      original: p.src.original,
      large2x: p.src.large2x,
      large: p.src.large,
      medium: p.src.medium,
      small: p.src.small,
      thumbnail: p.src.tiny,
    },
  }));

  return {
    totalResults: result.total_results,
    page: result.page,
    perPage: result.per_page,
    photosCount: photos.length,
    photos,
  };
}

async function getPhotoDetails(args: { photoId: number }) {
  const result = await pexelsRequest(`/v1/photos/${args.photoId}`);
  return {
    id: result.id,
    alt: result.alt,
    photographer: result.photographer,
    photographerUrl: result.photographer_url,
    width: result.width,
    height: result.height,
    avgColor: result.avg_color,
    urls: result.src,
  };
}

async function syncPhotoToCloudinary(args: {
  photoUrl: string;
  folder?: string;
  publicId?: string;
}) {
  const { photoUrl, folder = 'roadwise/questions', publicId } = args;

  try {
    const uploadOptions: any = {
      folder,
      resource_type: 'image',
    };
    if (publicId) uploadOptions.public_id = publicId;

    const result = await cloudinary.uploader.upload(photoUrl, uploadOptions);
    return {
      success: true,
      secureUrl: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (err: any) {
    log('Cloudinary upload warning:', err.message);
    // Graceful fallback to Pexels high-speed CDN
    return {
      success: false,
      fallbackUrl: photoUrl,
      note: `Direct Pexels CDN utilized: ${err.message}`,
    };
  }
}

async function attachMediaToQuestion(args: {
  questionIdOrCode: string;
  imageUrl: string;
  photographer?: string;
}) {
  const prisma = getPrisma();
  const q = await prisma.question.findFirst({
    where: {
      OR: [{ id: args.questionIdOrCode }, { questionCode: args.questionIdOrCode }],
    },
  });

  if (!q) {
    throw new Error(`Question '${args.questionIdOrCode}' not found`);
  }

  const updated = await prisma.question.update({
    where: { id: q.id },
    data: { imageUrl: args.imageUrl },
  });

  return {
    success: true,
    questionId: updated.id,
    questionCode: updated.questionCode,
    imageUrl: updated.imageUrl,
    photographer: args.photographer,
  };
}

async function attachMediaToSign(args: {
  signCanonicalCode: string;
  countryCode?: string;
  imageUrl: string;
}) {
  const prisma = getPrisma();
  const sign = await prisma.trafficSign.findUnique({
    where: { canonicalCode: args.signCanonicalCode.toUpperCase() },
    include: { variants: true },
  });

  if (!sign) {
    throw new Error(`Canonical sign '${args.signCanonicalCode}' not found`);
  }

  if (args.countryCode && sign.variants.length > 0) {
    const country = await prisma.country.findUnique({
      where: { code: args.countryCode.toUpperCase() },
    });
    if (country) {
      const variant = sign.variants.find((v) => v.countryId === country.id);
      if (variant) {
        const updatedVariant = await prisma.trafficSignVariant.update({
          where: { id: variant.id },
          data: { imageUrl: args.imageUrl },
        });
        return {
          success: true,
          type: 'VARIANT',
          canonicalCode: sign.canonicalCode,
          variantId: updatedVariant.id,
          countryCode: country.code,
          imageUrl: updatedVariant.imageUrl,
        };
      }
    }
  }

  // Update all variants of this canonical sign with this representative artwork
  const count = await prisma.trafficSignVariant.updateMany({
    where: { trafficSignId: sign.id },
    data: { imageUrl: args.imageUrl },
  });

  return {
    success: true,
    type: 'CANONICAL_ALL_VARIANTS',
    canonicalCode: sign.canonicalCode,
    updatedVariantsCount: count.count,
    imageUrl: args.imageUrl,
  };
}

async function batchSuggestImages(args: { category: string; limit?: number }) {
  const categoryKeywords: Record<string, string> = {
    TRAFFIC_REGULATORY: 'regulatory traffic road sign red circle stop speed limit',
    WARNING_SIGNS: 'warning road sign yellow diamond caution highway hazard',
    TRAFFIC_SIGNALS: 'traffic light red amber green intersection signals',
    GENERAL_KNOWLEDGE: 'driving highway road safety car steering commute lane',
  };

  const query = categoryKeywords[args.category] || 'traffic road sign';
  return searchTrafficPhotos({ query, perPage: args.limit || 5 });
}

// ---------------------------------------------------------------------------
// Tool Registry Definitions
// ---------------------------------------------------------------------------

const TOOLS = [
  {
    name: 'search_traffic_photos',
    description:
      'Search Pexels library for high-resolution traffic, road sign, highway, and driving scenario photos.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            "Keywords for traffic search (e.g., 'stop sign', 'yield sign', 'traffic light', 'pedestrian crosswalk')",
        },
        perPage: {
          type: 'number',
          description: 'Number of photos to return (default 10, max 30)',
        },
        page: { type: 'number', description: 'Page number (default 1)' },
        orientation: {
          type: 'string',
          enum: ['landscape', 'portrait', 'square'],
          description: 'Desired photo aspect orientation',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_photo_details',
    description:
      'Get full metadata, resolutions, and photographer licensing details for a Pexels photo ID.',
    inputSchema: {
      type: 'object',
      properties: {
        photoId: { type: 'number', description: 'Pexels photo ID' },
      },
      required: ['photoId'],
    },
  },
  {
    name: 'sync_photo_to_cloudinary',
    description:
      'Upload a Pexels photo directly to Cloudinary CDN under roadwise/ with optimization.',
    inputSchema: {
      type: 'object',
      properties: {
        photoUrl: {
          type: 'string',
          description: 'Direct high-res photo URL from Pexels',
        },
        folder: {
          type: 'string',
          description: "Target Cloudinary folder (default: 'roadwise/questions')",
        },
        publicId: {
          type: 'string',
          description: 'Optional custom public ID for the asset',
        },
      },
      required: ['photoUrl'],
    },
  },
  {
    name: 'attach_media_to_question',
    description:
      'Attach an image URL to a question in the PostgreSQL database by question ID or question code.',
    inputSchema: {
      type: 'object',
      properties: {
        questionIdOrCode: {
          type: 'string',
          description: "ID or Question Code (e.g., 'Q-REG-001')",
        },
        imageUrl: {
          type: 'string',
          description: 'Pexels or Cloudinary image URL to store',
        },
        photographer: {
          type: 'string',
          description: 'Optional photographer attribution',
        },
      },
      required: ['questionIdOrCode', 'imageUrl'],
    },
  },
  {
    name: 'attach_media_to_sign',
    description:
      'Attach an official image/artwork URL to canonical traffic sign variants in PostgreSQL.',
    inputSchema: {
      type: 'object',
      properties: {
        signCanonicalCode: {
          type: 'string',
          description: "Canonical sign code (e.g., 'REG-STOP')",
        },
        countryCode: {
          type: 'string',
          description: "Optional ISO country code (e.g., 'PK', 'US')",
        },
        imageUrl: {
          type: 'string',
          description: 'Image URL to attach to the sign variant',
        },
      },
      required: ['signCanonicalCode', 'imageUrl'],
    },
  },
  {
    name: 'batch_suggest_images',
    description:
      'Generate ranked photo suggestions from Pexels for a specific traffic question category.',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          enum: [
            'TRAFFIC_REGULATORY',
            'WARNING_SIGNS',
            'TRAFFIC_SIGNALS',
            'GENERAL_KNOWLEDGE',
          ],
          description: 'Category to get photo suggestions for',
        },
        limit: {
          type: 'number',
          description: 'Number of suggestions (default: 5)',
        },
      },
      required: ['category'],
    },
  },
];

// ---------------------------------------------------------------------------
// JSON-RPC 2.0 MCP Request Dispatcher
// ---------------------------------------------------------------------------

async function handleRpc(msg: any): Promise<any> {
  const { id, method, params } = msg;

  if (method === 'initialize') {
    return {
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: {
          name: 'traffic-media-mcp',
          version: '1.0.0',
        },
      },
    };
  }

  if (method === 'notifications/initialized') {
    // Notification: no response required
    return null;
  }

  if (method === 'tools/list') {
    return {
      jsonrpc: '2.0',
      id,
      result: { tools: TOOLS },
    };
  }

  if (method === 'tools/call') {
    const { name, arguments: args } = params;
    try {
      let resultData: any;
      switch (name) {
        case 'search_traffic_photos':
          resultData = await searchTrafficPhotos(args);
          break;
        case 'get_photo_details':
          resultData = await getPhotoDetails(args);
          break;
        case 'sync_photo_to_cloudinary':
          resultData = await syncPhotoToCloudinary(args);
          break;
        case 'attach_media_to_question':
          resultData = await attachMediaToQuestion(args);
          break;
        case 'attach_media_to_sign':
          resultData = await attachMediaToSign(args);
          break;
        case 'batch_suggest_images':
          resultData = await batchSuggestImages(args);
          break;
        default:
          throw new Error(`Unknown tool '${name}'`);
      }

      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [{ type: 'text', text: JSON.stringify(resultData, null, 2) }],
        },
      };
    } catch (err: any) {
      log(`Error in tool ${name}:`, err.message);
      return {
        jsonrpc: '2.0',
        id,
        error: {
          code: -32000,
          message: err.message || 'Internal tool execution error',
        },
      };
    }
  }

  return {
    jsonrpc: '2.0',
    id,
    error: {
      code: -32601,
      message: `Method '${method}' not found`,
    },
  };
}

// ---------------------------------------------------------------------------
// Stdio Stream Listener
// ---------------------------------------------------------------------------

let buffer = '';

process.stdin.setEncoding('utf8');

process.stdin.on('data', async (chunk: string) => {
  buffer += chunk;

  // Process newline-delimited JSON or Content-Length framed packets
  const lines = buffer.split(/\r?\n/);
  buffer = lines.pop() || '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Ignore Content-Length headers if present
    if (trimmed.startsWith('Content-Length:')) continue;

    try {
      const msg = JSON.parse(trimmed);
      const response = await handleRpc(msg);
      if (response) {
        process.stdout.write(JSON.stringify(response) + '\n');
      }
    } catch (e: any) {
      log('JSON parse error on line:', trimmed);
    }
  }
});

process.stdin.on('end', async () => {
  if (prismaClient) {
    await prismaClient.$disconnect();
  }
  process.exit(0);
});

log('Traffic Media MCP Server ready on stdio');
