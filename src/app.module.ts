// NestJS
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CacheModule } from '@nestjs/cache-manager';

// Core
import { ConnectionPool } from '@core/connection-pool';
import { Startup } from '@core/startup';

// Schemas
import { Account, AccountSchema } from '@schemas/account';

// Repositories
import { AccountRepository } from '@repositories/account';

// Services
import { ManagementService } from '@services/management';
import { CacheService } from '@services/cache';

// Other
import { Environment } from '@enums/environment';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>(Environment.MONGO_ATLAS)
      }),
    }),
    MongooseModule.forFeature([
      { name: Account.name, schema: AccountSchema }
    ]),
    ClientsModule.registerAsync([{
      name: 'MESSAGE_BROKER',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: Transport.REDIS,
        options: {
          host: configService.get<string>(Environment.REDIS_HOST),
          port: configService.get<number>(Environment.REDIS_PORT),
        }
      }),
    }]),
    CacheModule.register(),
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [ConnectionPool, Startup, AccountRepository, ManagementService, CacheService],
})
export class AppModule { }
