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
      const { data: executedMigrations, error: fetchError } = await supabase
        .from('schema_migrations')
        .select('version')
        .eq('status', 'success');

      if (fetchError) {
        // Erro PGRST116 ou erro de cache do esquema indica que a tabela é nova ou ainda não foi reconhecida
        if (fetchError.code === 'PGRST116' || fetchError.message.includes('schema cache')) {
          this.logger.warn('Aviso: Tabela schema_migrations não encontrada ou ainda não cacheada. Assumindo que nenhuma migration foi executada.');
        } else {
          this.logger.error('Erro ao buscar migrations executadas:', fetchError.message);
          throw fetchError;
        }
      }

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
    this.logger.log('Verificando infraestrutura de migrations no Supabase...');
    
    // Tentativa de criar a tabela via RPC diretamente (mais confiável se a função exec_sql existir)
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        version VARCHAR(50) PRIMARY KEY,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status VARCHAR(20) DEFAULT 'success'
      );
      CREATE INDEX IF NOT EXISTS idx_schema_migrations_status ON public.schema_migrations(status);
    `;

    try {
      const { error: rpcError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
      
      if (rpcError) {
        // Se o erro for que a função não existe, informamos o usuário
        if (rpcError.message.includes('function public.exec_sql(sql) does not exist') || 
            rpcError.code === 'PGRST202') {
          this.logger.error('ERRO CRÍTICO: A função RPC "exec_sql" não foi encontrada no seu banco de dados Supabase.');
          this.logger.warn('AÇÃO NECESSÁRIA: Você DEVE executar manualmente o conteúdo de "migrations/000_setup_exec_sql.sql" no SQL Editor do Supabase para habilitar as migrations via API.');
          throw new Error('Infraestrutura de RPC ausente no Supabase.');
        }
        
        // Se for erro de cache do esquema (PGRST116/PGRST200), podemos ignorar se a tabela já existir
        if (rpcError.message.includes('schema cache')) {
          this.logger.warn('Aviso: O cache do esquema do Supabase ainda não reconheceu as novas tabelas. Tentando prosseguir...');
          return;
        }

        throw rpcError;
      }
      
      this.logger.log('Tabela de controle de migrations verificada/criada com sucesso.');
    } catch (error: any) {
      if (error.message.includes('Infraestrutura de RPC ausente')) {
        throw error;
      }
      this.logger.warn(`Aviso ao verificar tabela de migrations: ${error.message}`);
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
