import { Injectable, Logger } from '@nestjs/common';
import { createSupabaseAdminClient } from '@/config/supabase.config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);
  private readonly migrationsPath = path.join(process.cwd(), 'migrations');

  async runMigrations(): Promise<void> {
    try {
      const supabase = createSupabaseAdminClient();

      // Criar tabela de controle se não existir
      await this.ensureMigrationsTable(supabase);

      // Obter migrations já executadas
      const { data: executedMigrations } = await supabase
        .from('schema_migrations')
        .select('version')
        .eq('status', 'success');

      const executedVersions = new Set(
        executedMigrations?.map((m) => m.version) || [],
      );

      // Obter todas as migrations disponíveis
      const migrationFiles = this.getMigrationFiles();

      for (const file of migrationFiles) {
        const version = file.replace('.sql', '');

        if (executedVersions.has(version)) {
          this.logger.log(`Migration ${version} já foi executada, pulando...`);
          continue;
        }

        try {
          const sql = fs.readFileSync(
            path.join(this.migrationsPath, file),
            'utf-8',
          );

          this.logger.log(`Executando migration: ${version}`);

          // Executar SQL
          const { error } = await supabase.rpc('exec_sql', { sql });

          if (error) {
            throw error;
          }

          // Registrar execução
          await supabase.from('schema_migrations').insert({
            version,
            status: 'success',
          });

          this.logger.log(`Migration ${version} executada com sucesso`);
        } catch (error: any) {
          this.logger.error(
            `Erro ao executar migration ${version}:`,
            error?.message || String(error),
          );

          // Registrar falha
          await supabase.from('schema_migrations').insert({
            version,
            status: 'failed',
          });

          throw error;
        }
      }

      this.logger.log('Todas as migrations foram executadas com sucesso');
    } catch (error: any) {
      this.logger.error('Erro ao executar migrations:', error?.message || String(error));
      throw error;
    }
  }

  private async ensureMigrationsTable(supabase: any): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(50) PRIMARY KEY,
        executed_at TIMESTAMP DEFAULT NOW(),
        status VARCHAR(20) DEFAULT 'success'
      );
    `;

    try {
      await supabase.rpc('exec_sql', { sql: createTableSQL });
    } catch (error) {
      this.logger.warn('Tabela schema_migrations pode já existir');
    }
  }

  private getMigrationFiles(): string[] {
    if (!fs.existsSync(this.migrationsPath)) {
      return [];
    }

    return fs
      .readdirSync(this.migrationsPath)
      .filter((file) => file.endsWith('.sql'))
      .sort();
  }
}
