import * as anchor from "@project-serum/anchor";
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { Workspace } from "../workspace";
import { DataUpdatable } from "../dataUpdatable";
import { Printable } from "src/printable";
export declare type UserPredictionHistoryItem = {
    recordId: anchor.BN;
    address: PublicKey;
    game: PublicKey;
    round: PublicKey;
    upOrDown: number;
    amount: anchor.BN;
};
export declare type UserPredictionHistoryAccount = {
    head: anchor.BN;
    game: PublicKey;
    address: PublicKey;
    userPredictions: UserPredictionHistoryItem[];
};
export default class UserPredictionHistory implements DataUpdatable<UserPredictionHistoryAccount>, Printable {
    account: UserPredictionHistoryAccount;
    constructor(account: UserPredictionHistoryAccount);
    print(): void;
    updateData(data: UserPredictionHistoryAccount): Promise<boolean>;
    static fromJSON2<UserPredictionHistoryItem>(json: any): UserPredictionHistoryItem;
    static fromJSON<UserPredictionHistoryAccount>(json: any): UserPredictionHistoryAccount;
    static adminCloseUserUserPredictionHistoryInstruction(workspace: Workspace, userPredictionHistory: PublicKey): Promise<TransactionInstruction>;
    static adminCloseUserUserPredictionHistory(workspace: Workspace, userPredictionHistory: PublicKey): Promise<boolean>;
}
