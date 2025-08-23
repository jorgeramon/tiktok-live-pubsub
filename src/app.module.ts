import { LiveConnectionConsumer } from '@/consumers/live-connection';
import { LiveController } from '@/controllers/live';
import { Connector } from '@/core/connector';
import { Startup } from '@/core/startup';
import { Environment, Microservice, QueueName } from '@/enums/environment';
import { AccountRepository } from '@/repositories/account';
import { Account, AccountSchema } from '@/schemas/account';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>(Environment.MongoAtlas),
      }),
    }),
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    ClientsModule.registerAsync([
      {
        name: Microservice.MessageBroker,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: configService.get<string>(Environment.RedisHost),
            port: configService.get<number>(Environment.RedisPort),
          },
        }),
      },
    ]),
    BullModule.registerQueueAsync({
      name: QueueName.LiveConnection,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>(Environment.RedisHost),
          port: configService.get<number>(Environment.RedisPort),
        },
      }),
    }),
    BullBoardModule.forRoot({
      route: '/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature({
      name: QueueName.LiveConnection,
      adapter: BullMQAdapter,
    }),
  ],
  controllers: [],
  providers: [
    LiveController,
    Connector,
    Startup,
    AccountRepository,
    LiveConnectionConsumer,
  ],
})
export class AppModule {}
