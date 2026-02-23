import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContasService } from './contas.service';
import { CreateContaDto } from './dto/create-conta.dto';
import { UpdateContaDto } from './dto/update-conta.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('Contas')
@Controller('api/contas')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContasController {
  constructor(private readonly contasService: ContasService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova conta' })
  async create(@Request() req: any, @Body() createContaDto: CreateContaDto) {
    return this.contasService.create(req.user.tenantId, createContaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar contas com paginação' })
  async findAll(@Request() req: any, @Query() paginationDto: PaginationDto) {
    return this.contasService.findAll(req.user.tenantId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter conta por ID' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.contasService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar conta' })
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateContaDto: UpdateContaDto,
  ) {
    return this.contasService.update(req.user.tenantId, id, updateContaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar conta' })
  async remove(@Request() req: any, @Param('id') id: string) {
    await this.contasService.remove(req.user.tenantId, id);
    return { message: 'Conta deletada com sucesso' };
  }
}
