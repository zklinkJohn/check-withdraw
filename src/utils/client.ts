import { Client } from "jayson/promise";

import { ZKLINK_RPC_ENDPOINT, ZKLINK_RPC_ENDPOINT_PORT } from "../conf";

export const zklinkRpcClient = Client.http({
  host: ZKLINK_RPC_ENDPOINT,
  port: ZKLINK_RPC_ENDPOINT_PORT,
});
