import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configValidationSchema } from './config.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.stage.${process.env.STAGE || 'dev'}`,
      validationSchema: configValidationSchema,
    }),
    TasksModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const isProd = configService.get('NODE_ENV') === 'prod';

        return {
          type: 'postgres',
          url: configService.get<string>('DATABASE_URL'),
          autoLoadEntities: true,
          synchronize: true,
          ssl: isProd ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    AuthModule,
  ],
})
export class AppModule {}
