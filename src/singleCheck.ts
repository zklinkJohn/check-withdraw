import { Contract, ethers, toBeHex } from "ethers";
import { extendAddress } from "./utils/helper";
import ZKLINK_ABI from "./abi/zklink.abi.json";

// const RPC = "https://avalanche.drpc.org";
const RPC = "https://arb1.arbitrum.io/rpc";
const CONTRACT_ADDRESS = "0xb86934fa6e53e15320911485c775d4ba4020fa5a";

async function getPendingBalance() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const contract = new Contract(CONTRACT_ADDRESS, ZKLINK_ABI, provider);
  const pendingBalance = await contract.getPendingBalance(
    extendAddress("0xa219439258ca9da29e9cc4ce5596924745e12b93"),
    toBeHex(141)
  );
  console.log(`pendingBalance: ${pendingBalance.toString()}`);
}

getPendingBalance();
