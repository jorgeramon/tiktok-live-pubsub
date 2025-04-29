// NestJS
import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";

// Core
import { ConnectionPool } from "@core/connection-pool";

// Repositories
import { AccountRepository } from "@repositories/account";

// Interfaces
import { IAccount } from "@interfaces/account";

@Injectable()
export class Startup implements OnApplicationBootstrap {

    private readonly logger: Logger = new Logger(Startup.name);

    constructor (
        private readonly connection_pool: ConnectionPool,
        private readonly account_repository: AccountRepository
    ) {}
    
    async onApplicationBootstrap(): Promise<void> {

        this.logger.debug('Starting application...');

        const accounts: IAccount[] = await this.account_repository.findAll();

        this.logger.debug(`Found ${accounts.length} accounts`);

        for (const account of accounts) {
            this.connection_pool.add(account.username);
        }

        this.connection_pool.add('lukegeee')
    }
}