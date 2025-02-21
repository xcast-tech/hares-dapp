import { createPublicClient, http, parseAbi, Address, Log } from 'viem';
import { bsc } from 'viem/chains';
import fs from 'fs';
import path from 'path';

// ERC20 Transfer ABI
const ERC20_ABI = parseAbi([
  'event Transfer(address indexed from, address indexed to, uint256 amount)'
]);

// Define a type for Transfer event logs
type TransferLog = Log & {
  args: {
    from: Address;
    to: Address;
    amount: bigint;
  }
};

async function fetchTokenTransfers(
  tokenAddress: Address,
  fromBlock?: string,
  toBlock?: string,
  blockStep: number = 500
) {

  const client = createPublicClient({
    chain: bsc,
    transport: http(),
  });

  // Convert block numbers, handling 'latest' case
  const startBlock = fromBlock ? BigInt(fromBlock) : BigInt(0);
  const endBlock = toBlock && toBlock !== 'latest'
    ? BigInt(toBlock)
    : await client.getBlockNumber();

  // Collect all logs
  const allLogs: TransferLog[] = [];

  // Fetch logs in 100-block increments
  for (let currentStart = startBlock; currentStart < endBlock; currentStart += BigInt(blockStep)) {
    const currentEnd = currentStart + BigInt(blockStep) - BigInt(1);
    const blockRangeEnd = currentEnd > endBlock ? endBlock : currentEnd;

    console.log(`Fetching logs from block ${currentStart} to ${blockRangeEnd}`);

    try {
      const logs = await client.getLogs({
        address: tokenAddress,
        event: ERC20_ABI[0],
        fromBlock: currentStart,
        toBlock: blockRangeEnd
      }) as TransferLog[];
      console.log(`Fetched ${logs.length} logs`);

      const csvData = logs.map(log => {
        const { from, to, amount } = log.args;
        return `${log.transactionHash},${log.blockNumber},${log.transactionIndex},${from},${to},${amount.toString()}`;
      });
      fs.appendFileSync('./log/f2b-transfer.csv', csvData.join('\n'));
    } catch (error) {
      console.error(`Error fetching logs for block range ${currentStart}-${blockRangeEnd}:`, error);
    }
  }
}

// Example usage (can be modified or removed)
async function main() {
  const tokenAddress = '0x23d3f4eaaa515403c6765bb623f287a8cca28f2b' as Address;

  try {
    const csvPath = await fetchTokenTransfers(
      tokenAddress,
      '46628700'
    );
    console.log(`CSV file created: ${csvPath}`);
  } catch (error) {
    console.error('Error fetching token transfers:', error);
  }
}

// Uncomment to run directly
main();