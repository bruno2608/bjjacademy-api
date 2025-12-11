// src/database/database.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      // Aqui sim vamos reclamar de .env, se faltar
      throw new Error('DATABASE_URL environment variable is not set');
    }

    const isLocal =
      connectionString.includes('localhost') ||
      connectionString.includes('127.0.0.1');

    // Se for banco local (localhost/127.0.0.1), nao usa SSL.
    // Se for Supabase ou outro host remoto, usa SSL com rejectUnauthorized: false
    // para aceitar o certificado da cadeia do provedor e evitar self-signed.
    this.pool = new Pool({
      connectionString,
      ssl: isLocal
        ? false
        : {
            rejectUnauthorized: false,
          },
    });
  }

  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const result = await this.pool.query(text, params);
    return result.rows as T[];
  }

  async queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
    const result = await this.pool.query(text, params);
    return (result.rows[0] as T) ?? null;
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
