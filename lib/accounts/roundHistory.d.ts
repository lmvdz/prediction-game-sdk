import * as anchor from "@project-serum/anchor";
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { Workspace } from "../workspace";
import { DataUpdatable } from "../dataUpdatable";
import { Printable } from "src/printable";
export declare type RoundHistoryItem = {
    recordId: anchor.BN;
    address: PublicKey;
    roundNumber: number;
    roundStartTime: anchor.BN;
    roundCurrentTime: anchor.BN;
    roundTimeDifference: anchor.BN;
    roundStartPrice: anchor.BN;
    roundStartPriceDecimals: anchor.BN;
    roundCurrentPrice: anchor.BN;
    roundCurrentPriceDecimals: anchor.BN;
    roundEndPrice: anchor.BN;
    roundEndPriceDecimals: anchor.BN;
    roundPriceDifference: anchor.BN;
    roundPriceDifferenceDecimals: anchor.BN;
    roundWinningDirection: number;
    roundInvalid: boolean;
    totalFeeCollected: anchor.BN;
    totalUpAmount: anchor.BN;
    totalDownAmount: anchor.BN;
    totalAmountSettled: anchor.BN;
    totalPredictionsSettled: number;
    totalPredictions: number;
    totalUniqueCrankers: number;
    totalCranks: number;
    totalCranksPaid: number;
    totalAmountPaidToCranks: anchor.BN;
};
export declare type RoundHistoryAccount = {
    head: anchor.BN;
    game: PublicKey;
    address: PublicKey;
    rounds: RoundHistoryItem[];
};
export default class RoundHistory implements DataUpdatable<RoundHistoryAccount>, Printable {
    account: RoundHistoryAccount;
    constructor(account: RoundHistoryAccount);
    print(): void;
    updateData(data: RoundHistoryAccount): Promise<boolean>;
    static fromJSON2<RoundHistoryAccountItem>(json: any): RoundHistoryAccountItem;
    static fromJSON<RoundHistoryAccount>(json: any): RoundHistoryAccount;
    static adminCloseUserRoundHistoryInstruction(workspace: Workspace, roundHistory: PublicKey): Promise<TransactionInstruction>;
    static adminCloseUserRoundHistory(workspace: Workspace, roundHistory: PublicKey): Promise<boolean>;
}
