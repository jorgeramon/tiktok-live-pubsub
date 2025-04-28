// NestJS
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Local
import { AppModule } from './app.module';

// Enums
import { Environment } from '@enums/environment';

async function bootstrap() {

  const context = await NestFactory.createApplicationContext(ConfigModule);
  const config_service = context.get<ConfigService>(ConfigService);

  context.close();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.REDIS,
    options: {
      host: config_service.get<string>(Environment.REDIS_HOST),
      port: config_service.get<number>(Environment.REDIS_PORT)
    }
  });

  await app.listen();
}

bootstrap();
