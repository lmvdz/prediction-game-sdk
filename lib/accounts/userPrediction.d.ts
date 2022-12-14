import * as anchor from "@project-serum/anchor";
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { Account } from '@solana/spl-token';
import { Workspace } from '../workspace';
import { DataUpdatable } from "../dataUpdatable";
import Round from "./round";
import Game from './game';
import { UpOrDown } from "../types";
import User from "./user";
import Vault from "./vault";
import { Printable } from "src/printable";
export declare type UserPredictionAccount = {
    owner: PublicKey;
    address: PublicKey;
    user: PublicKey;
    userClaimable: PublicKey;
    game: PublicKey;
    round: PublicKey;
    upOrDown: number;
    amount: anchor.BN;
    settled: boolean;
    padding01: PublicKey[];
};
export default class UserPrediction implements DataUpdatable<UserPredictionAccount>, Printable {
    account: UserPredictionAccount;
    constructor(account: UserPredictionAccount);
    print(): void;
    updateData(data: UserPredictionAccount): Promise<boolean>;
    static initializeUserPredictionInstruction(workspace: Workspace, vault: Vault, game: Game, round: Round | PublicKey, user: User | PublicKey, userClaimable: PublicKey, fromTokenAccount: Account | PublicKey, fromTokenAccountAuthority: PublicKey, userPredictionPubkey: PublicKey, upOrDown: UpOrDown, amount: anchor.BN): Promise<TransactionInstruction>;
    static initializeUserPrediction(workspace: Workspace, vault: Vault, game: Game, round: Round, user: User | PublicKey, userClaimable: PublicKey, userTokenAccount: PublicKey, userTokenAccountAuthority: PublicKey, upOrDown: UpOrDown, amount: anchor.BN): Promise<UserPrediction>;
    static closeUserPredictionInstruction(workspace: Workspace, prediction: UserPrediction): Promise<TransactionInstruction>;
    static closeUserPrediction(workspace: Workspace, prediction: UserPrediction): Promise<boolean>;
    static adminCloseUserPredictionInstruction(workspace: Workspace, prediction: UserPrediction): Promise<TransactionInstruction>;
    static adminCloseUserPrediction(workspace: Workspace, prediction: UserPrediction): Promise<boolean>;
    static adminCloseUserPredictionFromPubkeysInstruction(workspace: Workspace, userPrediction: PublicKey, receiver: PublicKey): Promise<TransactionInstruction>;
    static adminCloseUserPredictionFromPubkeys(workspace: Workspace, userPrediction: PublicKey, receiver: PublicKey): Promise<boolean>;
}
