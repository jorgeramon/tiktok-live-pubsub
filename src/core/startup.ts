import { Connector } from '@/core/connector';
import { WorkerEvent } from '@/enums/event';
import { IAccount } from '@/interfaces/account';
import { IWorkerExitEvent } from '@/interfaces/worker-exit-event';
import { AccountRepository } from '@/repositories/account';
import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class Startup implements OnApplicationBootstrap {
  private readonly logger: Logger = new Logger(Startup.name);

  constructor(
    private readonly connector: Connector,
    private readonly account_repository: AccountRepository,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    this.logger.debug('Starting application...');

    const accounts: IAccount[] = await this.account_repository.findAll();

    this.logger.debug(`Found ${accounts.length} accounts`);

    for (const account of accounts) {
      this.connector.start(account.username);
    }
  }

  @OnEvent(WorkerEvent.EXIT)
  restart(payload: IWorkerExitEvent) {
    this.logger.debug(`Restarting worker: ${payload.username}`);
    this.connector.start(payload.username);
  }
}
