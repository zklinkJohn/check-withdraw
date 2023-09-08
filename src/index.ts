import {
  ChainInfo,
  SupportTokens,
  getBlockByNumber,
  getSupportChains,
  getSupportTokens,
  getLatestBlockNumber,
} from "./api";
import { sleep, extendAddress } from "./utils/helper";
import logger from "./logger";
import { ethers, Contract, toBeHex, FallbackProvider } from "ethers";
import { insertFiledWithdrawTx, FailedWithdrawInfo } from "./db";
import ZKLINK_ABI from "./abi/zklink.abi.json";
import { custormChainRPC } from "./conf";

interface TokenAndChainInfo {
  tokenId: number;
  chainId: number;
  address: string;
  decimals: number;
}

let latestBlockNumber = 4155; // 上次跑的区块
const supportChainsMap: { [chainId: string]: ChainInfo } = {};
const tokens: TokenAndChainInfo[] = [];
let latestVerifyedBlockNumber: number;

async function start() {
  latestVerifyedBlockNumber = (await getLatestBlockNumber()).verified;
  logger.info(`latestVerifyedBlockNumber: ${latestVerifyedBlockNumber}`);
  const supportChains = await getSupportChains();
  for (const supportChain of supportChains) {
    supportChainsMap[supportChain.chainId] = supportChain;
  }
  const supportTokens: SupportTokens = await getSupportTokens();
  const tokenIds = Object.keys(supportTokens);
  for (const tokenId of tokenIds) {
    for (const layer2ChainId of Object.keys(supportTokens[tokenId].chains)) {
      const tokenChainInfo = supportTokens[tokenId].chains[layer2ChainId];
      const tokenAndChainInfo: TokenAndChainInfo = {
        tokenId: Number(tokenId),
        chainId: Number(layer2ChainId),
        address: tokenChainInfo.address,
        decimals: tokenChainInfo.decimals,
      };
      tokens.push(tokenAndChainInfo);
    }
  }

  // start loop
  startLoop();
}
let pendingBalance: bigint;
async function startLoop() {
  if (latestBlockNumber >= latestVerifyedBlockNumber) {
    return;
  }
  console.log(`latestBlockNumber: ${latestBlockNumber}`);
  const blockInfo = await getBlockByNumber(latestBlockNumber);
  const transactions = blockInfo.transactions;

  for (const transaction of transactions) {
    if (transaction.tx.type === "Withdraw") {
      // logger.info(
      //   `withdraw transaction: ${JSON.stringify(transaction, null, 2)}`
      // );
      const chainInfo = supportChainsMap[transaction.tx.toChainId];
      if (custormChainRPC[chainInfo.chainId] !== undefined) {
        chainInfo.web3Url = custormChainRPC[chainInfo.chainId]!;
      }
      const provider = new ethers.JsonRpcProvider(chainInfo.web3Url);
      const contract = new Contract(
        chainInfo.mainContract,
        ZKLINK_ABI,
        provider
      );

      try {
        pendingBalance = await contract.getPendingBalance(
          extendAddress(transaction.tx.to),
          toBeHex(transaction.tx.l1TargetToken)
        );
      } catch (error) {
        logger.error(
          `blockNumber: ${latestBlockNumber} chainId: ${chainInfo.chainId} RPC: ${chainInfo.web3Url}`
        );
        startLoop();
      } finally {
        await sleep(500);
      }

      // get token decimals
      const filterTokens = tokens.filter(
        (item) =>
          Number(item.chainId) == Number(chainInfo.chainId) &&
          Number(item.tokenId) === Number(transaction.tx.l1TargetToken)
      );
      if (filterTokens.length > 0) {
        const tokenInfo = filterTokens[0];
        const decimals =
          tokenInfo.decimals === 18 ? 0 : 18 - tokenInfo.decimals;
        const amount = BigInt(pendingBalance) / BigInt(10) ** BigInt(decimals);
        const filedWithdrawInfo: FailedWithdrawInfo = {
          blockNumber: latestBlockNumber,
          txHash: transaction.txHash,
          chainId: chainInfo.chainId,
          pendingBalance: pendingBalance.toString(),
          pendingBalanceAmount: amount.toString(),
          tokenId: tokenInfo.tokenId,
          tokenAddress: tokenInfo.address,
          decimals: tokenInfo.decimals,
          receipter: transaction.tx.to,
        };
        await insertFiledWithdrawTx(filedWithdrawInfo);
      }
      // logger.info(`pending Balance: ${pendingBalance}`);
      await sleep(1000);
    }
  }

  await sleep(1500);
  latestBlockNumber++;
  // logger.info(`latest block number: ${latestBlockNumber}`);
  startLoop();
}

start();
