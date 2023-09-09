const sqlite3 = require("sqlite3").verbose();
export const db = new sqlite3.Database("./src/db/withdraw.db");

db.run(`
  CREATE TABLE IF NOT EXISTS 
      withdraw (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          block_number INTEGER NOT NULL,
          tx_hash TEXT NOT NULL, 
          chain_id INTEGER, 
          pending_balance TEXT,
          pending_balance_amount TEXT,
          token_id INTEGER NOT NULL,
          token_address TEXT NOT NULL,
          decimals INTEGER NOT NULL,
          receipter TEXT NOT NULL
      );
`);

export interface FailedWithdrawInfo {
  blockNumber: number;
  txHash: string;
  chainId: number;
  pendingBalance: string;
  pendingBalanceAmount: string;
  tokenId: number;
  tokenAddress: string;
  decimals: number;
  receipter: string;
}
export function insertFiledWithdrawTx({
  blockNumber,
  txHash,
  chainId,
  pendingBalance,
  pendingBalanceAmount,
  tokenId,
  tokenAddress,
  decimals,
  receipter,
}: FailedWithdrawInfo): Promise<any> {
  return db.run(
    `
    INSERT INTO withdraw 
    (block_number,tx_hash,chain_id,pending_balance,pending_balance_amount,token_id,token_address,decimals,receipter)
    VALUES (?,?,?,?,?,?,?,?,?)
  `,
    [
      blockNumber,
      txHash,
      chainId,
      pendingBalance,
      pendingBalanceAmount,
      tokenId,
      tokenAddress,
      decimals,
      receipter,
    ]
  );
}

export async function selectDB(sql: string, params: any[]): Promise<any> {
  return new Promise((resolve, reject) => {
    db.all(sql, [], (error: any, resdata: any) => {
      if (error) {
        reject(error);
      } else {
        resolve(resdata);
      }
    });
  });
}
