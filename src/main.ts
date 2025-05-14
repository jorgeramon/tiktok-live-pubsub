import { AppModule } from '@/app.module';
import { Environment } from '@/enums/environment';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const context = await NestFactory.createApplicationContext(ConfigModule);
  const config_service = context.get<ConfigService>(ConfigService);

  context.close();

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.REDIS,
      options: {
        host: config_service.get<string>(Environment.REDIS_HOST),
        port: config_service.get<number>(Environment.REDIS_PORT),
      },
    },
  );

  await app.listen();
}

bootstrap();
