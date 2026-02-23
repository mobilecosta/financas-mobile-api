import { IsString, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateContaDto {
  @IsString()
  nome!: string;

  @IsString()
  tipo!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  saldo?: number;

  @IsOptional()
  @IsString()
  descricao?: string;
}
