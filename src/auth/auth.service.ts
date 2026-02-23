import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createSupabaseClient } from '@/config/supabase.config';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(loginDto: LoginDto) {
    const supabase = createSupabaseClient();

    // Buscar usuário
    const { data: usuario, error } = await supabase
      .from('tenant_usuarios')
      .select('*')
      .eq('tenant_id', loginDto.tenant_id)
      .eq('email', loginDto.email)
      .single();

    if (error || !usuario) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(
      loginDto.senha,
      usuario.senha_hash,
    );

    if (!senhaValida) {
      throw new UnauthorizedException('Email ou senha inválidos');
    }

    // Gerar JWT
    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      tenant_id: usuario.tenant_id,
      perfil: usuario.perfil,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        perfil: usuario.perfil,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const supabase = createSupabaseClient();

    // Verificar se usuário já existe
    const { data: usuarioExistente } = await supabase
      .from('tenant_usuarios')
      .select('id')
      .eq('tenant_id', registerDto.tenant_id)
      .eq('email', registerDto.email)
      .single();

    if (usuarioExistente) {
      throw new BadRequestException('Email já cadastrado neste tenant');
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(registerDto.senha, 10);

    // Criar usuário
    const { data: novoUsuario, error } = await supabase
      .from('tenant_usuarios')
      .insert({
        tenant_id: registerDto.tenant_id,
        email: registerDto.email,
        senha_hash: senhaHash,
        nome: registerDto.nome,
        perfil: 'usuario',
        ativo: true,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException('Erro ao criar usuário');
    }

    // Gerar JWT
    const payload: JwtPayload = {
      sub: novoUsuario.id,
      email: novoUsuario.email,
      tenant_id: novoUsuario.tenant_id,
      perfil: novoUsuario.perfil,
    };

    return {
      access_token: this.jwtService.sign(payload),
      usuario: {
        id: novoUsuario.id,
        email: novoUsuario.email,
        nome: novoUsuario.nome,
        perfil: novoUsuario.perfil,
      },
    };
  }

  async refresh(payload: JwtPayload) {
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
