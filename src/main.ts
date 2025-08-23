import { AppModule } from '@/app.module';
import { Environment } from '@/enums/environment';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import tracer from 'dd-trace';

tracer.init();

async function bootstrap() {
  const context = await NestFactory.createApplicationContext(ConfigModule);
  const config_service = context.get<ConfigService>(ConfigService);

  context.close();

  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: {
      host: config_service.get<string>(Environment.RedisHost),
      port: config_service.get<number>(Environment.RedisPort),
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);
}

bootstrap();
