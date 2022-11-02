"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const anchor = __importStar(require("@project-serum/anchor"));
const web3_js_1 = require("@solana/web3.js");
const spl_token_1 = require("@solana/spl-token");
const constants_1 = require("../constants");
const index_1 = require("../util/index");
class UserPrediction {
    constructor(account) {
        this.account = account;
    }
    async updateData(data) {
        this.account = data;
        return true;
    }
    static async initializeUserPredictionInstruction(workspace, vault, game, round, user, userClaimable, fromTokenAccount, fromTokenAccountAuthority, userPredictionPubkey, upOrDown, amount) {
        if (amount.gt(constants_1.U64MAX) || amount.lt((0, constants_1.USER_PREDICTION_MIN_AMOUNT)(game.account.tokenDecimal)))
            throw Error("Amount does not fall in the required range for [1, u64::MAX]");
        const roundNumberBuffer = new anchor.BN(game.account.roundNumber).toArrayLike(Buffer, 'be', 4);
        return await workspace.program.methods.initUserPredictionInstruction(upOrDown.valueOf(), amount, [
            roundNumberBuffer.readUintBE(0, 1),
            roundNumberBuffer.readUintBE(1, 1),
            roundNumberBuffer.readUintBE(2, 1),
            roundNumberBuffer.readUintBE(3, 1),
        ]).accounts({
            signer: workspace.owner,
            game: game.account.address,
            user: user.account !== undefined ? user.account.address : user,
            userClaimable: userClaimable,
            currentRound: round.account !== undefined ? round.account.address : round,
            userPrediction: userPredictionPubkey,
            userPredictionHistory: game.account.userPredictionHistory,
            // deposit
            vault: vault.account.address,
            vaultAta: vault.account.vaultAta,
            fromTokenAccount: fromTokenAccount.address !== undefined ? fromTokenAccount.address : fromTokenAccount,
            fromTokenAccountAuthority: fromTokenAccountAuthority,
            tokenMint: vault.account.tokenMint,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            systemProgram: web3_js_1.SystemProgram.programId
        }).instruction();
    }
    static async initializeUserPrediction(workspace, vault, game, round, user, userClaimable, userTokenAccount, userTokenAccountAuthority, upOrDown, amount) {
        let [userPredictionPubkey, _userPredictionPubkeyBump] = await workspace.programAddresses.getUserPredictionPubkey(game, round, user);
        let ix = await this.initializeUserPredictionInstruction(workspace, vault, game, round, user, userClaimable, userTokenAccount, userTokenAccountAuthority, userPredictionPubkey, upOrDown, amount);
        let tx = new web3_js_1.Transaction().add(ix);
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    let txSignature = await workspace.sendTransaction(tx);
                    await (0, index_1.confirmTxRetry)(workspace, txSignature);
                }
                catch (error) {
                    reject(error);
                }
                try {
                    let userPrediction = await (0, index_1.fetchAccountRetry)(workspace, 'userPrediction', userPredictionPubkey);
                    resolve(new UserPrediction(userPrediction));
                }
                catch (error) {
                    reject(error);
                }
            }, 500);
        });
    }
    static async closeUserPredictionInstruction(workspace, prediction) {
        return await workspace.program.methods.closeUserPredictionInstruction().accounts({
            signer: workspace.owner,
            userPrediction: prediction.account.address,
            userPredictionCloseReceiver: prediction.account.owner
        }).instruction();
    }
    static async closeUserPrediction(workspace, prediction) {
        let ix = await this.closeUserPredictionInstruction(workspace, prediction);
        let tx = new web3_js_1.Transaction().add(ix);
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    let txSignature = await workspace.sendTransaction(tx);
                    await (0, index_1.confirmTxRetry)(workspace, txSignature);
                }
                catch (error) {
                    reject(error);
                }
                try {
                    prediction = null;
                    resolve(true);
                }
                catch (error) {
                    reject(error);
                }
            }, 500);
        });
    }
    static async adminCloseUserPredictionInstruction(workspace, prediction) {
        return await workspace.program.methods.adminCloseUserPredictionInstruction().accounts({
            signer: workspace.owner,
            userPrediction: prediction.account.address,
            userPredictionCloseReceiver: prediction.account.owner
        }).instruction();
    }
    static async adminCloseUserPrediction(workspace, prediction) {
        let ix = await this.adminCloseUserPredictionInstruction(workspace, prediction);
        let tx = new web3_js_1.Transaction().add(ix);
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    let txSignature = await workspace.sendTransaction(tx);
                    await (0, index_1.confirmTxRetry)(workspace, txSignature);
                }
                catch (error) {
                    reject(error);
                }
                try {
                    prediction = null;
                    resolve(true);
                }
                catch (error) {
                    reject(error);
                }
            }, 500);
        });
    }
    static async adminCloseUserPredictionFromPubkeysInstruction(workspace, userPrediction, receiver) {
        return await workspace.program.methods.adminCloseUserPredictionInstruction().accounts({
            signer: workspace.owner,
            userPrediction,
            userPredictionCloseReceiver: receiver
        }).instruction();
    }
    static async adminCloseUserPredictionFromPubkeys(workspace, userPrediction, receiver) {
        let ix = await this.adminCloseUserPredictionFromPubkeysInstruction(workspace, userPrediction, receiver);
        let tx = new web3_js_1.Transaction().add(ix);
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    let txSignature = await workspace.sendTransaction(tx);
                    await (0, index_1.confirmTxRetry)(workspace, txSignature);
                }
                catch (error) {
                    reject(error);
                }
                try {
                    resolve(true);
                }
                catch (error) {
                    reject(error);
                }
            }, 500);
        });
    }
}
exports.default = UserPrediction;
//# sourceMappingURL=userPrediction.js.map