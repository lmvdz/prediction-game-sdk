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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = exports.closeAllHistory = exports.closeAllUserClaimable = exports.closeAllUser = exports.closeAllRounds = exports.closeAllCranks = exports.closeAllUserPredictions = exports.closeAllVaults = exports.closeAllGames = exports.closeAll = exports.createFakeMint = exports.gameSeeds = void 0;
const web3_js_1 = require("@solana/web3.js");
const web3_js_2 = require("@solana/web3.js");
const nodewallet_1 = __importDefault(require("@project-serum/anchor/dist/cjs/nodewallet"));
const anchor = __importStar(require("@project-serum/anchor"));
const game_1 = __importDefault(require("./accounts/game"));
const spl_token_1 = require("@solana/spl-token");
const util_1 = require("./util");
const workspace_1 = require("./workspace");
const types_1 = require("./types");
const vault_1 = __importDefault(require("./accounts/vault"));
const userPrediction_1 = __importDefault(require("./accounts/userPrediction"));
const crank_1 = __importDefault(require("./accounts/crank"));
const round_1 = __importDefault(require("./accounts/round"));
const user_1 = __importDefault(require("./accounts/user"));
const userClaimable_1 = __importDefault(require("./accounts/userClaimable"));
const userPredictionHistory_1 = __importDefault(require("./accounts/userPredictionHistory"));
const roundHistory_1 = __importDefault(require("./accounts/roundHistory"));
exports.gameSeeds = [
    {
        baseSymbol: "DOT",
        priceProgram: new web3_js_1.PublicKey("2TfB33aLaneQb5TNVwyDz3jSZXS6jdW2ARw1Dgf84XCG"),
        priceFeed: new web3_js_1.PublicKey("B6bjqp6kL3qniMn9nuzHvjzRLiJvvVusugDXJXhYjNYz"),
        roundLength: new anchor.BN(300),
        oracle: types_1.Oracle.Switchboard
    },
    {
        baseSymbol: "ATOM",
        priceProgram: new web3_js_1.PublicKey("gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s"),
        priceFeed: new web3_js_1.PublicKey("7YAze8qFUMkBnyLVdKT4TFUUFui99EwS5gfRArMcrvFk"),
        roundLength: new anchor.BN(300),
        oracle: types_1.Oracle.Pyth
    },
    {
        baseSymbol: "SOL",
        priceProgram: new web3_js_1.PublicKey("gSbePebfvPy7tRqimPoVecS2UsBvYv46ynrzWocc92s"),
        priceFeed: new web3_js_1.PublicKey("J83w4HKfqxwcq3BEMMkPFSppX3gqekLyLJBexebFVkix"),
        roundLength: new anchor.BN(300),
        oracle: types_1.Oracle.Pyth
    },
    {
        baseSymbol: "BTC",
        priceProgram: new web3_js_1.PublicKey("2TfB33aLaneQb5TNVwyDz3jSZXS6jdW2ARw1Dgf84XCG"),
        priceFeed: new web3_js_1.PublicKey("8SXvChNYFhRq4EZuZvnhjrB3jJRQCv4k3P4W6hesH3Ee"),
        roundLength: new anchor.BN(300),
        oracle: types_1.Oracle.Switchboard
    },
    {
        baseSymbol: "ETH",
        priceProgram: new web3_js_1.PublicKey("HEvSKofvBgfaexv23kMabbYqxasxU3mQ4ibBMEmJWHny"),
        priceFeed: new web3_js_1.PublicKey("2ypeVyYnZaW2TNYXXTaZq9YhYvnqcjCiifW1C6n8b7Go"),
        roundLength: new anchor.BN(300),
        oracle: types_1.Oracle.Chainlink
    }
];
async function createFakeMint(connection, owner, keypair, mintDecimals = 6) {
    const mintKey = keypair || web3_js_2.Keypair.generate();
    try {
        await (0, spl_token_1.createMint)(connection, owner, owner.publicKey, owner.publicKey, mintDecimals, mintKey);
    }
    catch (error) {
        console.warn("mint already created");
    }
    return await (0, spl_token_1.getMint)(connection, mintKey.publicKey);
}
exports.createFakeMint = createFakeMint;
const loadGame = (workspace, baseSymbol, vault, oracle, priceProgram, priceFeed, roundLength) => {
    return new Promise((resolve, reject) => {
        workspace.programAddresses.getGamePubkey(vault, priceProgram, priceFeed).then(([gamePubkey, _vaultPubkeyBump]) => {
            (0, util_1.fetchAccountRetry)(workspace, 'game', (gamePubkey)).then(gameAccount => {
                resolve(new game_1.default(gameAccount));
            }).catch(error => {
                game_1.default.initGameAndHistory(workspace, baseSymbol, vault, oracle, priceProgram, priceFeed, 30, 1000, roundLength).then(game => {
                    resolve(game);
                }).catch(error => {
                    reject(error);
                });
            });
        }).catch(error => {
            console.error(error);
            reject(error);
        });
    });
};
const loadVault = (workspace, tokenMint) => {
    return new Promise((resolve, reject) => {
        workspace.programAddresses.getVaultPubkey(tokenMint).then(([vaultPubkey, _vaultPubkeyBump]) => {
            (0, util_1.fetchAccountRetry)(workspace, 'vault', (vaultPubkey)).then(vaultAccount => {
                resolve(new vault_1.default(vaultAccount));
            }).catch(error => {
                vault_1.default.initializeVault(workspace, tokenMint).then(vault => {
                    resolve(vault);
                }).catch(error => {
                    reject(error);
                });
            });
        }).catch(error => {
            console.error(error);
            reject(error);
        });
    });
};
async function initFromGameSeed(workspace, gameSeed, mint) {
    try {
        let vault = await loadVault(workspace, mint);
        let game = await loadGame(workspace, gameSeed.baseSymbol, vault, gameSeed.oracle, gameSeed.priceProgram, gameSeed.priceFeed, gameSeed.roundLength);
        return [vault, game];
    }
    catch (error) {
        console.error(error);
        return [null, null];
    }
}
async function closeAll(owner, connection, cluster, mintReceiverAta) {
    Promise.allSettled([
        await closeAllVaults(owner, connection, cluster, mintReceiverAta),
        await closeAllUserClaimable(owner, connection, cluster),
        await closeAllRounds(owner, connection, cluster),
        await closeAllCranks(owner, connection, cluster),
        await closeAllUserPredictions(owner, connection, cluster),
        await closeAllUser(owner, connection, cluster),
        await closeAllGames(owner, connection, cluster),
        await closeAllHistory(owner, connection, cluster)
    ]);
}
exports.closeAll = closeAll;
async function closeAllGames(owner, connection, cluster) {
    const botWallet = new nodewallet_1.default(owner);
    const workspace = workspace_1.Workspace.load(connection, botWallet, cluster, { commitment: 'confirmed' });
    await Promise.allSettled((await workspace.program.account.game.all()).map(async (gameAccount) => {
        console.log('game', gameAccount.publicKey.toBase58());
        let game = new game_1.default(gameAccount.account);
        try {
            return await (game).adminCloseGame(workspace);
        }
        catch (error) {
            console.error(error);
        }
    }));
}
exports.closeAllGames = closeAllGames;
async function closeAllVaults(owner, connection, cluster, mintReceiverAta) {
    const botWallet = new nodewallet_1.default(owner);
    const workspace = workspace_1.Workspace.load(connection, botWallet, cluster, { commitment: 'confirmed' });
    try {
        await Promise.allSettled((await workspace.program.account.vault.all()).map(async (vaultAccount) => {
            try {
                console.log('vault', vaultAccount.publicKey.toBase58());
                let vault = new vault_1.default(vaultAccount.account);
                await vault.closeVaultTokenAccounts(workspace, mintReceiverAta);
                await vault.closeVault(workspace);
            }
            catch (error) {
                console.error(error);
            }
        }));
    }
    catch (error) {
        console.error(error);
    }
}
exports.closeAllVaults = closeAllVaults;
async function closeAllUserPredictions(owner, connection, cluster) {
    const botWallet = new nodewallet_1.default(owner);
    const workspace = workspace_1.Workspace.load(connection, botWallet, cluster, { commitment: 'confirmed' });
    await Promise.allSettled((await workspace.program.account.userPrediction.all()).map(async (userPredictionAccount) => {
        console.log('userPrediction', userPredictionAccount.publicKey.toBase58());
        let userPrediction = new userPrediction_1.default(userPredictionAccount.account);
        try {
            return await userPrediction_1.default.adminCloseUserPrediction(workspace, userPrediction);
        }
        catch (error) {
            console.error(error);
        }
    }));
}
exports.closeAllUserPredictions = closeAllUserPredictions;
async function closeAllCranks(owner, connection, cluster) {
    const botWallet = new nodewallet_1.default(owner);
    const workspace = workspace_1.Workspace.load(connection, botWallet, cluster, { commitment: 'confirmed' });
    await Promise.allSettled((await workspace.program.account.crank.all()).map(async (crankAccount) => {
        console.log('crank', crankAccount.publicKey.toBase58());
        let crank = new crank_1.default(crankAccount.account);
        try {
            return await crank.adminCloseCrankAccount(workspace);
        }
        catch (error) {
            console.error(error);
        }
    }));
}
exports.closeAllCranks = closeAllCranks;
async function closeAllRounds(owner, connection, cluster) {
    const botWallet = new nodewallet_1.default(owner);
    const workspace = workspace_1.Workspace.load(connection, botWallet, cluster, { commitment: 'confirmed' });
    await Promise.allSettled((await workspace.program.account.round.all()).map(async (roundAccount) => {
        console.log('round', roundAccount.publicKey.toBase58());
        let round = new round_1.default(roundAccount.account);
        try {
            return await round_1.default.adminCloseRound(workspace, round);
        }
        catch (error) {
            console.error(error);
        }
    }));
}
exports.closeAllRounds = closeAllRounds;
async function closeAllUser(owner, connection, cluster) {
    const botWallet = new nodewallet_1.default(owner);
    const workspace = workspace_1.Workspace.load(connection, botWallet, cluster, { commitment: 'confirmed' });
    await Promise.allSettled((await workspace.program.account.user.all()).map(async (userAccount) => {
        console.log('user', userAccount.publicKey.toBase58());
        let user = new user_1.default(userAccount.account);
        try {
            return await user.adminCloseUserAccount(workspace);
        }
        catch (error) {
            console.error(error);
        }
    }));
}
exports.closeAllUser = closeAllUser;
async function closeAllUserClaimable(owner, connection, cluster) {
    const botWallet = new nodewallet_1.default(owner);
    const workspace = workspace_1.Workspace.load(connection, botWallet, cluster, { commitment: 'confirmed' });
    await Promise.allSettled((await workspace.program.account.userClaimable.all()).map(async (userClaimableAccount) => {
        console.log('userClaimable', userClaimableAccount.publicKey.toBase58());
        try {
            return await userClaimable_1.default.adminCloseUserClaimable(workspace, userClaimableAccount.publicKey);
        }
        catch (error) {
            console.error(error);
        }
    }));
}
exports.closeAllUserClaimable = closeAllUserClaimable;
async function closeAllHistory(owner, connection, cluster) {
    const botWallet = new nodewallet_1.default(owner);
    const workspace = workspace_1.Workspace.load(connection, botWallet, cluster, { commitment: 'confirmed' });
    await Promise.allSettled([...(await workspace.program.account.userPredictionHistory.all()).map(async (userPredictionHistory) => {
            console.log('userPredictionHistory', userPredictionHistory.publicKey.toBase58());
            try {
                return await userPredictionHistory_1.default.adminCloseUserUserPredictionHistory(workspace, userPredictionHistory.publicKey);
            }
            catch (error) {
                console.error(error);
            }
        }), ...(await workspace.program.account.roundHistory.all()).map(async (roundHistory) => {
            console.log('roundHistory', roundHistory.publicKey.toBase58());
            try {
                return await roundHistory_1.default.adminCloseUserRoundHistory(workspace, roundHistory.publicKey);
            }
            catch (error) {
                console.error(error);
            }
        })]);
}
exports.closeAllHistory = closeAllHistory;
async function init(owner, connection, cluster, mint) {
    const botWallet = new nodewallet_1.default(owner);
    const workspace = workspace_1.Workspace.load(connection, botWallet, cluster, { commitment: 'confirmed' });
    (await Promise.all(exports.gameSeeds.map(async (gameSeed) => {
        return await initFromGameSeed(workspace, gameSeed, mint.address);
    }))).forEach(([vault, game]) => {
        console.log(game.baseSymbolAsString() + ' loaded.');
    });
}
exports.init = init;
//# sourceMappingURL=admin.js.map