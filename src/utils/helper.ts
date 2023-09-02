import { arrayify, concat, hexlify } from "@ethersproject/bytes";
const ADDRESS_PREFIX_ZERO_BYTES = "0x000000000000000000000000";

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function extendAddress(address: string) {
  const addrBytes = arrayify(address);
  const zeroBytes = arrayify(ADDRESS_PREFIX_ZERO_BYTES);
  const extendAddrArray = concat([zeroBytes, addrBytes]);
  return hexlify(extendAddrArray);
}
