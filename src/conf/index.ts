import dotenv from "dotenv";
dotenv.config({});

export const ZKLINK_RPC_ENDPOINT = process.env.ZKLINK_RPC_ENDPOINT;
export const ZKLINK_RPC_ENDPOINT_PORT = process.env.ZKLINK_RPC_ENDPOINT_PORT;

export const custormChainRPC: { [chainId: number]: string | undefined } = {
  137: `https://polygon-mainnet.infura.io/v3/${process.env.INFURE_KEY}`,
  7: `https://linea-mainnet.infura.io/v3/${process.env.INFURE_KEY}`,
  2: `https://avalanche-mainnet.infura.io/v3/${process.env.INFURE_KEY}`,
  4: `https://mainnet.infura.io/v3/${process.env.INFURE_KEY}`,
  10: "https://optimism.publicnode.com",
};
