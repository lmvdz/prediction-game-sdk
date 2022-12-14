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
const constants_1 = require("../constants");
const index_1 = require("../util/index");
const types_1 = require("../types");
class Round {
    constructor(account) {
        this.account = account;
    }
    print() {
        throw new Error("Method not implemented.");
    }
    async updateData(data) {
        this.account = data;
        return true;
    }
    static fromJSON(json) {
        let owner = new web3_js_1.PublicKey(json.owner);
        let game = new web3_js_1.PublicKey(json.game);
        let address = new web3_js_1.PublicKey(json.address);
        let roundNumber = json.roundNumber;
        let roundLength = new anchor.BN(json.roundLength, 16);
        let finished = json.finished;
        let invalid = json.invalid;
        let settled = json.settled;
        let feeCollected = json.feeCollected;
        let cranksPaid = json.cranksPaid;
        let roundPredictionsAllowed = json.roundPredictionsAllowed;
        let roundStartTime = new anchor.BN(json.roundStartTime, 16);
        let roundCurrentTime = new anchor.BN(json.roundCurrentTime, 16);
        let roundTimeDifference = new anchor.BN(json.roundTimeDifference, 16);
        let roundStartPrice = new anchor.BN(json.roundStartPrice, 16);
        let roundStartPriceDecimals = new anchor.BN(json.roundStartPriceDecimals, 16);
        let roundCurrentPrice = new anchor.BN(json.roundCurrentPrice, 16);
        let roundCurrentPriceDecimals = new anchor.BN(json.roundCurrentPriceDecimals, 16);
        let roundEndPrice = new anchor.BN(json.roundEndPrice, 16);
        let roundEndPriceDecimals = new anchor.BN(json.roundEndPriceDecimals, 16);
        let roundPriceDifference = new anchor.BN(json.roundPriceDifference, 16);
        let roundPriceDifferenceDecimals = new anchor.BN(json.roundPriceDifferenceDecimals, 16);
        let roundWinningDirection = json.roundWinningDirection;
        let totalFeeCollected = new anchor.BN(json.totalFeeCollected, 16);
        let totalUpAmount = new anchor.BN(json.totalUpAmount, 16);
        let totalDownAmount = new anchor.BN(json.totalDownAmount, 16);
        let totalAmountSettled = new anchor.BN(json.totalAmountSettled, 16);
        let totalPredictionsSettled = json.totalPredictionsSettled;
        let totalPredictions = json.totalPredictions;
        let totalUniqueCrankers = json.totalUniqueCrankers;
        let totalCranks = json.totalCranks;
        let totalCranksPaid = json.totalCranksPaid;
        let totalAmountPaidToCranks = new anchor.BN(json.totalAmountPaidToCranks, 16);
        let padding01 = json.padding01.map((x) => new web3_js_1.PublicKey(x));
        return {
            owner,
            game,
            address,
            roundNumber,
            roundLength,
            finished,
            invalid,
            settled,
            feeCollected,
            cranksPaid,
            roundPredictionsAllowed,
            roundStartTime,
            roundCurrentTime,
            roundTimeDifference,
            roundStartPrice,
            roundStartPriceDecimals,
            roundCurrentPrice,
            roundCurrentPriceDecimals,
            roundEndPrice,
            roundEndPriceDecimals,
            roundPriceDifference,
            roundPriceDifferenceDecimals,
            roundWinningDirection,
            totalFeeCollected,
            totalUpAmount,
            totalDownAmount,
            totalAmountSettled,
            totalPredictionsSettled,
            totalPredictions,
            totalUniqueCrankers,
            totalCranks,
            totalCranksPaid,
            totalAmountPaidToCranks,
            padding01
        };
    }
    convertOraclePriceToNumber(price, decimals_, game) {
        try {
            let decimals = decimals_.abs();
            if (game.account.oracle === types_1.Oracle.Chainlink) {
                let scaled_val = price.toString();
                if (scaled_val.length <= decimals.toNumber()) {
                    let zeros = "";
                    for (let x = 0; x < decimals.toNumber() - scaled_val.length; x++) {
                        zeros += "0";
                    }
                    let charArray = [...scaled_val];
                    charArray.splice(0, 0, ...zeros);
                    scaled_val = "0." + charArray.join("");
                    return parseFloat(scaled_val);
                }
                else {
                    let charArray = Array.from(scaled_val);
                    charArray.splice(charArray.length - decimals.toNumber(), 0, ".");
                    return parseFloat(charArray.join(""));
                }
            }
            else if (game.account.oracle === types_1.Oracle.Pyth || game.account.oracle === types_1.Oracle.Switchboard) {
                return parseFloat((price.div((new anchor.BN(10)).pow(decimals)).toNumber() + (price.mod((new anchor.BN(10)).pow(decimals)).toNumber() / (10 ** decimals.toNumber()))).toFixed(2));
            }
        }
        catch (error) {
            console.error(error);
        }
    }
    static initializeFirst(workspace, game, crank) {
        return new Promise((resolve, reject) => {
            workspace.programAddresses.getRoundPubkey(game.account.address, new anchor.BN(1)).then(([roundPubkey, _roundPubkeyBump]) => {
                workspace.program.methods.initFirstRoundInstruction().accounts({
                    signer: workspace.owner,
                    game: game.account.address,
                    crank: crank.account.address,
                    round: roundPubkey,
                    priceProgram: game.account.priceProgram,
                    priceFeed: game.account.priceFeed,
                    systemProgram: anchor.web3.SystemProgram.programId
                }).transaction().then(tx => {
                    workspace.sendTransaction(tx).then(txSignature => {
                        (0, index_1.confirmTxRetry)(workspace, txSignature).then(() => {
                            game.updateGameData(workspace).then((game) => {
                                game.loadRoundData(workspace).then((game) => {
                                    resolve(game);
                                }).catch(error => {
                                    reject(error);
                                });
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    }
    static initializeStuckFirst(workspace, game, crank) {
        return new Promise((resolve, reject) => {
            workspace.programAddresses.getRoundPubkey(game.account.address, new anchor.BN(1)).then(([roundPubkey, _roundPubkeyBump]) => {
                workspace.program.methods.initFirstRoundInstruction().accounts({
                    signer: workspace.owner,
                    game: game.account.address,
                    crank: crank.account.address,
                    round: roundPubkey,
                    priceProgram: game.account.priceProgram,
                    priceFeed: game.account.priceFeed,
                    systemProgram: anchor.web3.SystemProgram.programId
                }).transaction().then(tx => {
                    workspace.sendTransaction(tx).then(txSignature => {
                        (0, index_1.confirmTxRetry)(workspace, txSignature).then(() => {
                            game.updateGameData(workspace).then((game) => {
                                game.loadRoundData(workspace).then((game) => {
                                    resolve(game);
                                }).catch(error => {
                                    reject(error);
                                });
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    }
    static initializeSecond(workspace, game, crank) {
        return new Promise((resolve, reject) => {
            workspace.programAddresses.getRoundPubkey(game.account.address, new anchor.BN(2)).then(([roundPubkey, _secondRoundPubkeyBump]) => {
                let roundNumberAsBuffer = workspace.programAddresses.roundToBuffer(new anchor.BN(2));
                workspace.program.methods.initSecondRoundInstruction([roundNumberAsBuffer[0], roundNumberAsBuffer[1], roundNumberAsBuffer[2], roundNumberAsBuffer[3]]).accounts({
                    signer: workspace.owner,
                    game: game.account.address,
                    crank: crank.account.address,
                    secondRound: roundPubkey,
                    roundHistory: game.account.roundHistory,
                    firstRound: game.currentRound.account.address,
                    priceProgram: game.account.priceProgram,
                    priceFeed: game.account.priceFeed,
                    systemProgram: anchor.web3.SystemProgram.programId
                }).transaction().then(tx => {
                    workspace.sendTransaction(tx).then(txSignature => {
                        (0, index_1.confirmTxRetry)(workspace, txSignature).then(() => {
                            game.updateGameData(workspace).then((game) => {
                                game.updateRoundData(workspace).then((game) => {
                                    resolve(game);
                                }).catch(error => {
                                    reject(error);
                                });
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    }
    static initializeStuckSecond(workspace, game, crank) {
        return new Promise((resolve, reject) => {
            workspace.programAddresses.getRoundPubkey(game.account.address, new anchor.BN(2)).then(([roundPubkey, _secondRoundPubkeyBump]) => {
                let roundNumberAsBuffer = workspace.programAddresses.roundToBuffer(new anchor.BN(2));
                workspace.program.methods.initStuckSecondRoundInstruction([roundNumberAsBuffer[0], roundNumberAsBuffer[1], roundNumberAsBuffer[2], roundNumberAsBuffer[3]]).accounts({
                    signer: workspace.owner,
                    game: game.account.address,
                    crank: crank.account.address,
                    secondRound: roundPubkey,
                    roundHistory: game.account.roundHistory,
                    firstRound: game.currentRound.account.address,
                    priceProgram: game.account.priceProgram,
                    priceFeed: game.account.priceFeed,
                    systemProgram: anchor.web3.SystemProgram.programId
                }).transaction().then(tx => {
                    workspace.sendTransaction(tx).then(txSignature => {
                        (0, index_1.confirmTxRetry)(workspace, txSignature).then(() => {
                            game.updateGameData(workspace).then((game) => {
                                game.updateRoundData(workspace).then((game) => {
                                    resolve(game);
                                }).catch(error => {
                                    reject(error);
                                });
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    }
    static initializeNext(workspace, game, crank) {
        return new Promise((resolve, reject) => {
            let nextRoundNumber = new anchor.BN(game.currentRound.account.roundNumber + 1);
            if (nextRoundNumber.gt(constants_1.U32MAX)) {
                nextRoundNumber = new anchor.BN(1);
            }
            let roundNumberAsBuffer = workspace.programAddresses.roundToBuffer(nextRoundNumber);
            workspace.programAddresses.getRoundPubkey(game.account.address, nextRoundNumber).then(([roundPubkey, _roundPubkeyBump]) => {
                workspace.program.methods.initNextRoundAndClosePreviousInstruction([roundNumberAsBuffer[0], roundNumberAsBuffer[1], roundNumberAsBuffer[2], roundNumberAsBuffer[3]]).accounts({
                    signer: workspace.owner,
                    game: game.account.address,
                    crank: crank.account.address,
                    receiver: workspace.owner,
                    nextRound: roundPubkey,
                    roundHistory: game.account.roundHistory,
                    currentRound: game.currentRound.account.address,
                    previousRound: game.previousRound.account.address,
                    priceProgram: game.account.priceProgram,
                    priceFeed: game.account.priceFeed,
                    systemProgram: anchor.web3.SystemProgram.programId
                }).transaction().then(tx => {
                    workspace.sendTransaction(tx).then(txSignature => {
                        (0, index_1.confirmTxRetry)(workspace, txSignature).then(() => {
                            game.updateGameData(workspace).then((game) => {
                                game.updateRoundData(workspace).then((game) => {
                                    resolve(game);
                                }).catch(error => {
                                    reject(error);
                                });
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    }
    static initializeStuckNext(workspace, game, crank) {
        return new Promise((resolve, reject) => {
            let nextRoundNumber = new anchor.BN(game.currentRound.account.roundNumber + 1);
            if (nextRoundNumber.gt(constants_1.U32MAX)) {
                nextRoundNumber = new anchor.BN(1);
            }
            let roundNumberAsBuffer = workspace.programAddresses.roundToBuffer(nextRoundNumber);
            workspace.programAddresses.getRoundPubkey(game.account.address, nextRoundNumber).then(([roundPubkey, _roundPubkeyBump]) => {
                workspace.program.methods.initStuckNextRoundAndClosePreviousInstruction([roundNumberAsBuffer[0], roundNumberAsBuffer[1], roundNumberAsBuffer[2], roundNumberAsBuffer[3]]).accounts({
                    signer: workspace.owner,
                    game: game.account.address,
                    crank: crank.account.address,
                    receiver: workspace.owner,
                    nextRound: roundPubkey,
                    roundHistory: game.account.roundHistory,
                    currentRound: game.currentRound.account.address,
                    previousRound: game.previousRound.account.address,
                    priceProgram: game.account.priceProgram,
                    priceFeed: game.account.priceFeed,
                    systemProgram: anchor.web3.SystemProgram.programId
                }).transaction().then(tx => {
                    workspace.sendTransaction(tx).then(txSignature => {
                        (0, index_1.confirmTxRetry)(workspace, txSignature).then(() => {
                            game.updateGameData(workspace).then((game) => {
                                game.updateRoundData(workspace).then((game) => {
                                    resolve(game);
                                }).catch(error => {
                                    reject(error);
                                });
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    }
    static adminCloseRound(workspace, round) {
        return new Promise((resolve, reject) => {
            workspace.program.methods.adminCloseRoundInstruction().accounts({
                signer: workspace.owner,
                round: round.account.address,
                receiver: workspace.owner
            }).transaction().then(tx => {
                workspace.sendTransaction(tx).then(txSignature => {
                    (0, index_1.confirmTxRetry)(workspace, txSignature).then(() => {
                        resolve();
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    }
}
exports.default = Round;
//# sourceMappingURL=round.js.map