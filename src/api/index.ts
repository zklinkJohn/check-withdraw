import { zklinkRpcClient } from "../utils/client";

export interface Transaction {
  txHash: string;
  tx: {
    type: string;
    toChainId: number; // withdraw type exist
    from: string;
    subAccountId: number;
    l2SourceToken: number;
    l1TargetToken: number;
    amount: bigint;
    to: string;
    serialId: number;
    ethHash: string;
  };
  executedTimestamp: number;
}

export interface BlockInfo {
  number: number;
  commitment: string;
  rootHash: string;
  feeAccountId: number;
  blockSize: number;
  opsCompositionNumber: number;
  createdAt: string;
  transactions: Transaction[];
}

export interface ChainInfo {
  chainId: number;
  layerOneChainId: number;
  mainContract: string;
  web3Url: string;
}

export interface TokenChainInfo {
  chainId: number;
  address: string;
  decimals: number;
  fastWithdraw: boolean;
}
export interface TokenInfo {
  id: number;
  symbol: string;
  chains: { [chainId: string]: TokenChainInfo };
}

export interface SupportTokens {
  [tokenId: string]: TokenInfo;
}

export function getBlockByNumber(blockNumber: number): Promise<BlockInfo> {
  return zklinkRpcClient
    .request("getBlockByNumber", [blockNumber, true, false])
    .then((res) => res.result);
}

export function getSupportChains(): Promise<ChainInfo[]> {
  return zklinkRpcClient
    .request("getSupportChains", [])
    .then((res) => res.result);
}

export function getSupportTokens(): Promise<SupportTokens> {
  return zklinkRpcClient
    .request("getSupportTokens", [])
    .then((res) => res.result);
}
