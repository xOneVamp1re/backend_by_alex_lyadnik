/* import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getMongoConfig = (
  configService: ConfigService,
): MongooseModuleOptions => ({
  uri: configService.get('database.uri'),
  retryAttempts: 5,
  retryDelay: 1000,
}); */
import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getMongoConfig = (
  configService: ConfigService,
): MongooseModuleOptions => {
  const uri = configService.get<string>('database.uri');

  if (!uri) {
    throw new Error('MongoDB URI not found in configuration');
  }

  // Логируем безопасную версию URI
  const safeUri = uri.replace(
    /mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/,
    'mongodb$1://$2:****@',
  );
  console.log('MongoDB URI:', safeUri);

  return {
    uri,
    retryAttempts: 5,
    retryDelay: 1000,
    // Добавляем дополнительные опции для лучшей стабильности
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };
};
