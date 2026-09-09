import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);

    try {
      this.client = new Redis({
        host,
        port,
        lazyConnect: true,
        enableOfflineQueue: false,
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        retryStrategy: () => null,
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        this.logger.log(`✅ Redis connected at ${host}:${port}`);
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        // Suppress repetitive noisy logs
        if (err.message.includes('ECONNREFUSED')) {
          // Log only once as debug/warning
          return;
        }
        this.logger.warn(`Redis notice: ${err.message}`);
      });

      // Best effort connection
      this.client.connect().catch(() => {
        this.logger.warn(`Redis host ${host}:${port} unavailable. Using PostgreSQL fallback.`);
      });
    } catch (e: any) {
      this.logger.warn(`Could not initialize Redis client: ${e.message}`);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {}
    }
  }

  /**
   * Retrieve a value by key. Returns null if key not found or Redis is offline.
   */
  async get(key: string): Promise<string | null> {
    if (!this.client || !this.isConnected) return null;
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  /**
   * Set a string value. Safely fails if Redis is offline.
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.client || !this.isConnected) return;
    try {
      if (ttlSeconds) {
        await this.client.set(key, value, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, value);
      }
    } catch {
      // safe fallback
    }
  }

  /**
   * Atomically increment key. Returns new value if successful, or null on failure.
   */
  async incr(key: string): Promise<number | null> {
    if (!this.client || !this.isConnected) return null;
    try {
      return await this.client.incr(key);
    } catch {
      return null;
    }
  }

  /**
   * Delete key or pattern.
   */
  async del(key: string): Promise<void> {
    if (!this.client || !this.isConnected) return;
    try {
      await this.client.del(key);
    } catch {}
  }
}
