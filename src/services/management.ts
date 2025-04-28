// NestJS
import { Injectable, Logger } from "@nestjs/common";

// Core
import { ConnectionPool } from "@core/connection-pool";

// Repositories
import { AccountRepository } from "@repositories/account";

// Interfaces
import { IAccount } from "@interfaces/account";

@Injectable()
export class ManagementService {

    private readonly logger: Logger = new Logger(ManagementService.name);
    
    constructor (
        private readonly connection_pool: ConnectionPool,
        private readonly account_repository: AccountRepository
    ) {}

    async subscribe(username: string): Promise<void> {
        let account: IAccount | null = await this.account_repository.findOneByUsername(username);

        if (!account) {
            account = await this.account_repository.save({ username });
        }

        this.connection_pool.add(account.username);
    }
}