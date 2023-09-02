import { Client } from "jayson/promise";

import { ZKLINK_RPC_ENDPOINT } from "../conf";

export const zklinkRpcClient = Client.https({
  host: ZKLINK_RPC_ENDPOINT,
});
