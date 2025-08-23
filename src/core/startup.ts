import { JobName, QueueName } from '@/enums/environment';
import { IAccount } from '@/interfaces/account';
import { AccountRepository } from '@/repositories/account';
import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class Startup implements OnApplicationBootstrap {
  private readonly logger: Logger = new Logger(Startup.name);

  constructor(
    private readonly account_repository: AccountRepository,
    @InjectQueue(QueueName.LiveConnection)
    private readonly queue: Queue,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.logger.debug('Starting application...');

    const accounts: IAccount[] = await this.account_repository.findAll();

    this.logger.debug(`Found ${accounts.length} accounts`);

    for (const account of accounts) {
      await this.queue.add(JobName.StartConnection, account.username);
    }
  }
}
