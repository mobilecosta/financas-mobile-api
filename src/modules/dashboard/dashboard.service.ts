import { Injectable } from '@nestjs/common';
import { createSupabaseClient } from '@/config/supabase.config';

@Injectable()
export class DashboardService {
  async getDashboard(tenantId: string): Promise<any> {
    const supabase = createSupabaseClient();

    // Buscar tenant
    const { data: tenant } = await supabase
      .from('tenant')
      .select('*')
      .eq('id', tenantId)
      .single();

    // Buscar saldo total
    const { data: contas } = await supabase
      .from('contas')
      .select('saldo')
      .eq('tenant_id', tenantId)
      .eq('ativo', true);

    const saldoTotal = contas?.reduce((sum, conta) => sum + (conta.saldo || 0), 0) || 0;

    // Buscar transações do mês
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);

    const { data: transacoes } = await supabase
      .from('transacoes')
      .select('tipo, valor')
      .eq('tenant_id', tenantId)
      .gte('data_transacao', inicioMes.toISOString().split('T')[0]);

    const receitas = transacoes
      ?.filter((t) => t.tipo === 'Receita')
      .reduce((sum, t) => sum + (t.valor || 0), 0) || 0;

    const despesas = transacoes
      ?.filter((t) => t.tipo === 'Despesa')
      .reduce((sum, t) => sum + (t.valor || 0), 0) || 0;

    // Buscar categorias com maior gasto
    const { data: categoriasDespesas } = await supabase
      .from('transacoes')
      .select('categoria_id, valor')
      .eq('tenant_id', tenantId)
      .eq('tipo', 'Despesa')
      .gte('data_transacao', inicioMes.toISOString().split('T')[0]);

    const despesasPorCategoria: Record<string, number> = {};
    categoriasDespesas?.forEach((t) => {
      despesasPorCategoria[t.categoria_id] = (despesasPorCategoria[t.categoria_id] || 0) + t.valor;
    });

    return {
      tenant,
      indicadores: {
        saldoTotal,
        receitas,
        despesas,
        saldo: receitas - despesas,
      },
      despesasPorCategoria,
      transacoes: transacoes || [],
    };
  }
}
