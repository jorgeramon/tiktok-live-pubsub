import { LiveController } from '@/controllers/live';
import { Connector } from '@/core/connector';
import { Startup } from '@/core/startup';
import { Environment, Microservice } from '@/enums/environment';
import { AccountRepository } from '@/repositories/account';
import { Account, AccountSchema } from '@/schemas/account';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>(Environment.MONGO_ATLAS),
      }),
    }),
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    ClientsModule.registerAsync([
      {
        name: Microservice.MESSAGE_BROKER,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.REDIS,
          options: {
            host: configService.get<string>(Environment.REDIS_HOST),
            port: configService.get<number>(Environment.REDIS_PORT),
          },
        }),
      },
    ]),
    EventEmitterModule.forRoot(),
  ],
  controllers: [LiveController],
  providers: [Connector, Startup, AccountRepository],
})
export class AppModule {}
