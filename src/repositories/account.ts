// NestJS
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";

// Schemas
import { Account, AccountDocument } from "@schemas/account";

// Interfaces
import { IAccount } from "@interfaces/account";

// NPM
import { Model } from "mongoose";

@Injectable()
export class AccountRepository {

    constructor(
        @InjectModel(Account.name) private model: Model<Account>
    ) {}


    async findAll(): Promise<IAccount[]> {
        const documents: AccountDocument[] = await this.model.find();
        return documents.map(document => document.toJSON()) as IAccount[];
    }

    async findOneByNickname(nickname: string): Promise<IAccount | null> {
        const document: AccountDocument | null = await this.model.findOne({ nickname });
        return document !== null ? document.toJSON() as IAccount : null;
    }

    async save(data: Partial<IAccount>): Promise<IAccount> {
        const instance: AccountDocument = await new this.model(data).save();
        return instance.toJSON() as IAccount;
    }
}