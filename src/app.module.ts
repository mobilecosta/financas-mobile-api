import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AuthModule } from './auth/auth.module';
import { ContasModule } from './modules/contas/contas.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
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
  ],
  providers: [MigrationService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorsMiddleware).forRoutes('*');
  }
}
