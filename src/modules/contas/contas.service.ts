import { Injectable, NotFoundException } from '@nestjs/common';
import { createSupabaseClient } from '@/config/supabase.config';
import { CreateContaDto } from './dto/create-conta.dto';
import { UpdateContaDto } from './dto/update-conta.dto';
import { PaginationDto, PaginatedResponse } from '@/common/dto/pagination.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ContasService {
  async create(
    tenantId: string,
    createContaDto: CreateContaDto,
  ): Promise<any> {
    const supabase = createSupabaseClient();
    const id = uuidv4();

    const { data, error } = await supabase
      .from('contas')
      .insert({
        tenant_id: tenantId,
        id,
        ...createContaDto,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar conta: ${error.message}`);
    }

    return data;
  }

  async findAll(
    tenantId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponse<any>> {
    const supabase = createSupabaseClient();

    // Contar total de registros
    const { count } = await supabase
      .from('contas')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('ativo', true);

    const totalRecords = count || 0;
    const totalPages = Math.ceil(totalRecords / paginationDto.pageSize);

    // Buscar registros com paginação
    const offset = (paginationDto.page - 1) * paginationDto.pageSize;

    const { data, error } = await supabase
      .from('contas')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('ativo', true)
      .order('criado_em', { ascending: false })
      .range(offset, offset + paginationDto.pageSize - 1);

    if (error) {
      throw new Error(`Erro ao buscar contas: ${error.message}`);
    }

    return {
      items: data || [],
      page: paginationDto.page,
      pageSize: paginationDto.pageSize,
      totalRecords,
      totalPages,
    };
  }

  async findOne(tenantId: string, id: string): Promise<any> {
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
      .from('contas')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Conta não encontrada');
    }

    return data;
  }

  async update(
    tenantId: string,
    id: string,
    updateContaDto: UpdateContaDto,
  ): Promise<any> {
    const supabase = createSupabaseClient();

    // Verificar se conta existe
    await this.findOne(tenantId, id);

    const { data, error } = await supabase
      .from('contas')
      .update({
        ...updateContaDto,
        atualizado_em: new Date(),
      })
      .eq('tenant_id', tenantId)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar conta: ${error.message}`);
    }

    return data;
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const supabase = createSupabaseClient();

    // Verificar se conta existe
    await this.findOne(tenantId, id);

    const { error } = await supabase
      .from('contas')
      .update({ ativo: false, atualizado_em: new Date() })
      .eq('tenant_id', tenantId)
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao deletar conta: ${error.message}`);
    }
  }
}
