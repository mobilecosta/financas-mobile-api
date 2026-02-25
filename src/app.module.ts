import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { HttpLoggerMiddleware } from './common/middleware/http-logger.middleware';
import { ConfigModule } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AuthModule } from './auth/auth.module';
import { ContasModule } from './modules/contas/contas.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { MetadataModule } from './modules/metadata/metadata.module';
import { CorsMiddleware } from './common/middleware/cors.middleware';
import { MigrationService } from './database/migration.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    ContasModule,
    DashboardModule,
    MetadataModule,
  ],
  providers: [MigrationService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
        consumer.apply(CorsMiddleware).forRoutes('*');
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
