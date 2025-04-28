// NestJS
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';

// Core
import { ConnectionPool } from '@core/connection-pool';

// Schemas
import { Account, AccountSchema } from '@schemas/account';

// Repositories
import { AccountRepository } from '@repositories/account';

// Services
import { ManagementService } from '@services/management';
import { Startup } from '@services/startup';

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
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot()
  ],
  controllers: [],
  providers: [ConnectionPool, Startup, AccountRepository, ManagementService],
})
export class AppModule { }
