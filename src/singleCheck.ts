import { Contract, ethers, toBeHex } from "ethers";
import { extendAddress } from "./utils/helper";
import ZKLINK_ABI from "./abi/zklink.abi.json";

const RPC = "https://avalanche.drpc.org";
const CONTRACT_ADDRESS = "0xb86934fa6e53e15320911485c775d4ba4020fa5a";

async function getPendingBalance() {
  const provider = new ethers.JsonRpcProvider(RPC);
  const contract = new Contract(CONTRACT_ADDRESS, ZKLINK_ABI, provider);
  const pendingBalance = await contract.getPendingBalance(
    extendAddress("0xe2c2b029fac50141da1e626621d64a68bf5f9bd4"),
    toBeHex(18)
  );
  console.log(`pendingBalance: ${pendingBalance.toString()}`);
}

getPendingBalance();
