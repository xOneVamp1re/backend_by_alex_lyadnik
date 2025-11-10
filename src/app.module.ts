import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import configuration from './config/configuration';
import { getMongoConfig } from './config/mongo.config';
import { getJWTConfig } from './config/jwt.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // Загрузка конфигурации
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      cache: true,
    }),

    // MongoDB с асинхронной конфигурацией
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getMongoConfig,
      inject: [ConfigService],
    }),

    // JWT модуль с асинхронной конфигурацией
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: getJWTConfig,
      inject: [ConfigService],
      global: true,
    }),

    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
