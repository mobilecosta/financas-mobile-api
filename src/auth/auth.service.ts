import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createSupabaseClient } from '@/config/supabase.config';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private jwtService: JwtService) {}

  async login(loginDto: LoginDto) {
    const supabase = createSupabaseClient();

    try {
      this.logger.log(
        `Tentativa de login: ${loginDto.email} (tenant: ${loginDto.tenant_id})`,
      );

      // Buscar usuário
      const { data: usuario, error } = await supabase
        .from('tenant_usuarios')
        .select('*')
        .eq('tenant_id', loginDto.tenant_id)
        .eq('email', loginDto.email)
        .single();

      if (error) {
        this.logger.warn(
          `Erro ao buscar usuário ${loginDto.email}: ${error.message}`,
        );
      }

      if (error || !usuario) {
        this.logger.warn(`Usuário não encontrado: ${loginDto.email}`);
        throw new UnauthorizedException('Email ou senha inválidos');
      }

      // Verificar senha
      const senhaValida = await bcrypt.compare(
        loginDto.senha,
        usuario.senha_hash,
      );

      if (!senhaValida) {
        this.logger.warn(`Senha inválida para: ${loginDto.email}`);
        throw new UnauthorizedException('Email ou senha inválidos');
      }

      // Gerar JWT
      const payload: JwtPayload = {
        sub: usuario.id,
        email: usuario.email,
        tenant_id: usuario.tenant_id,
        perfil: usuario.perfil,
      };

      const token = this.jwtService.sign(payload);
      this.logger.log(`Login bem-sucedido: ${loginDto.email}`);

      return {
        access_token: token,
        usuario: {
          id: usuario.id,
          email: usuario.email,
          nome: usuario.nome,
          perfil: usuario.perfil,
        },
      };
    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(
        `Erro ao fazer login: ${error.message}`,
        error.stack,
      );
      throw new UnauthorizedException(error.message || 'Email ou senha inválidos');
    }
  }

  async register(registerDto: RegisterDto) {
    const supabase = createSupabaseClient();

    try {
      this.logger.log(
        `Tentativa de registro: ${registerDto.email} (tenant: ${registerDto.tenant_id})`,
      );

      // Verificar se usuário já existe
      const { data: usuarioExistente, error: erroVerificacao } = await supabase
        .from('tenant_usuarios')
        .select('id')
        .eq('email', registerDto.email)
        .single();

      if (usuarioExistente) {
        this.logger.warn(`Email já cadastrado: ${registerDto.email}`);
        throw new BadRequestException('Email já cadastrado neste tenant');
      }

      // Hash da senha
      const senhaHash = await bcrypt.hash(registerDto.senha, 10);

      // Criar usuário
      const { data: novoUsuario, error } = await supabase
        .from('tenant_usuarios')
        .insert({
          tenant_id: registerDto.tenant_id,
          id: uuidv4(),
          email: registerDto.email,
          senha_hash: senhaHash,
          nome: registerDto.nome,
          perfil: 'usuario',
          ativo: true,
        })
        .select()
        .single();

      if (error) {
        this.logger.error(`Erro ao criar usuário: ${error.message}`, error);
        throw new BadRequestException(`Erro ao criar usuário: ${error.message}`);
      }

      // Gerar JWT
      const payload: JwtPayload = {
        sub: novoUsuario.id,
        email: novoUsuario.email,
        tenant_id: novoUsuario.tenant_id,
        perfil: novoUsuario.perfil,
      };

      const token = this.jwtService.sign(payload);
      this.logger.log(`Registro bem-sucedido: ${registerDto.email}`);

      return {
        access_token: token,
        usuario: {
          id: novoUsuario.id,
          email: novoUsuario.email,
          nome: novoUsuario.nome,
          perfil: novoUsuario.perfil,
        },
      };
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        `Erro no registro: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(error.message || 'Erro ao registrar usuário');
    }
  }

  async refresh(payload: JwtPayload) {
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
