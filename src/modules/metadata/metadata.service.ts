import { Injectable } from '@nestjs/common';
import { createSupabaseAdminClient } from '@/config/supabase.config';

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  rota: string | null;
  ordem: number;
  ativo: boolean;
  parent_id: string | null;
}

@Injectable()
export class MetadataService {
  async getMenu(): Promise<MenuItem[]> {
    const supabase = createSupabaseAdminClient();
    
    const { data, error } = await supabase
      .from('menu_metadata')
      .select('*')
      .eq('ativo', true)
      .order('ordem');

    if (error) {
      throw new Error(`Erro ao carregar menu: ${error.message}`);
    }

    return data.map(item => ({
      id: item.id,
      label: item.label,
      icon: item.icon,
      rota: item.rota,
      ordem: item.ordem,
      ativo: item.ativo,
      parent_id: item.parent_id,
    }));
  }

  async getFormMetadata(entidade: string): Promise<any> {
    const supabase = createSupabaseAdminClient();
    
    const { data, error } = await supabase
      .from('form_metadata')
      .select('*')
      .eq('entidade', entidade)
      .single();

    if (error) {
      throw new Error(`Erro ao carregar metadata do formulário: ${error.message}`);
    }

    return data;
  }
}
