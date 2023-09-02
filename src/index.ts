import {
  ChainInfo,
  SupportTokens,
  getBlockByNumber,
  getSupportChains,
  getSupportTokens,
} from "./api";
import { sleep, extendAddress } from "./utils/helper";
import logger from "./logger";
import { ethers, Contract, toBeHex, FallbackProvider } from "ethers";
import { insertFiledWithdrawTx, FailedWithdrawInfo } from "./db";
import ZKLINK_ABI from "./abi/zklink.abi.json";

interface TokenAndChainInfo {
  tokenId: number;
  chainId: number;
  address: string;
  decimals: number;
}

let latestBlockNumber = 18110;
const supportChainsMap: { [chainId: string]: ChainInfo } = {};
const tokens: TokenAndChainInfo[] = [];

async function start() {
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

async function startLoop() {
  const blockInfo = await getBlockByNumber(latestBlockNumber);
  const transactions = blockInfo.transactions;
  for (const transaction of transactions) {
    if (transaction.tx.type === "Withdraw") {
      const chainInfo = supportChainsMap[transaction.tx.toChainId];
      const provider = new ethers.JsonRpcProvider(chainInfo.web3Url);
      const contract = new Contract(
        chainInfo.mainContract,
        ZKLINK_ABI,
        provider
      );
      const pendingBalance = await contract.getPendingBalance(
        extendAddress(transaction.tx.to),
        toBeHex(transaction.tx.l1TargetToken)
      );

      // get token decimals
      const filterTokens = tokens.filter(
        (item) =>
          Number(item.chainId) == Number(chainInfo.chainId) &&
          Number(item.tokenId) === Number(transaction.tx.l1TargetToken)
      );
      if (filterTokens.length > 0) {
        const tokenInfo = filterTokens[0];
        // if (
        //   BigInt(pendingBalance) / BigInt(10) ** BigInt(tokenInfo.decimals) >
        //   0
        // ) {
        const filedWithdrawInfo: FailedWithdrawInfo = {
          blockNumber: latestBlockNumber,
          txHash: transaction.txHash,
          chainId: chainInfo.chainId,
          pendingBalance: pendingBalance,
          tokenId: tokenInfo.tokenId,
          tokenAddress: tokenInfo.address,
          decimals: tokenInfo.decimals,
          receipter: transaction.tx.to,
        };
        console.log({ filedWithdrawInfo });
        await insertFiledWithdrawTx(filedWithdrawInfo);
        logger.error(`pending balance not withdraw`);
        // }
      }
      logger.info(`pending Balance: ${pendingBalance}`);
    }
  }

  await sleep(1000);
  latestBlockNumber++;
  logger.info(`latest block number: ${latestBlockNumber}`);
  //   startLoop();
}

start();
