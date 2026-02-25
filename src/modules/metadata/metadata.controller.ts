import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MetadataService } from './metadata.service';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';

@ApiTags('Metadata')
@Controller('metadata')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @Get('menu')
  @ApiOperation({ summary: 'Obter menu do sistema' })
  async getMenu() {
    return this.metadataService.getMenu();
  }

  @Get('form/:entidade')
  @ApiOperation({ summary: 'Obter metadata de formulário' })
  async getFormMetadata(@Param('entidade') entidade: string) {
    return this.metadataService.getFormMetadata(entidade);
  }
}
