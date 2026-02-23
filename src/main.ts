import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter, AllExceptionsFilter } from './common/filters/http-exception.filter';
import { MigrationService } from './database/migration.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware de segurança
  app.use(helmet());

  // Validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Filtros de exceção
  app.useGlobalFilters(new HttpExceptionFilter(), new AllExceptionsFilter());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Financas Mobile API')
    .setDescription('API para Controle Financeiro Multi-Tenant')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Verificar se deve executar migrations
  const args = process.argv.slice(2);
  if (args.includes('-migration') || args.includes('--migration')) {
    console.log('Executando migrations...');
    const migrationService = app.get(MigrationService);
    await migrationService.runMigrations();
    console.log('Migrations concluídas');
    process.exit(0);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Aplicação rodando em http://localhost:${port}`);
  console.log(`Swagger disponível em http://localhost:${port}/api/docs`);
}

bootstrap();
