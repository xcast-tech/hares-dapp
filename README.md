## Token Transfer Indexer

### Fetching Token Transfers

This project includes a script to fetch ERC20 token transfer events using Viem.

#### Usage

To fetch transfers for a specific token:

1. Set the RPC URL (optional):

   ```bash
   export POLYGON_RPC_URL=https://your-polygon-rpc-endpoint
   ```

2. Run the script with a specific token address:
   ```bash
   npm run fetch-transfers
   ```

#### Script Details

- The script fetches transfer events for an ERC20 token on the Polygon network
- Events are stored in a CSV file under the `log/` directory
- CSV format: `from,to,amount`

#### Customization

To modify the token address or block range, edit the `main()` function in `scripts/fetch-token-transfers.ts`:

```typescript
const tokenAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174"; // USDC on Polygon
await fetchTokenTransfers(tokenAddress, "startBlock", "endBlock");
```

#### Dependencies

- Viem
- TypeScript
- Node.js

#### Notes

- Requires an RPC endpoint for Polygon (defaults to public RPC if not specified)
- Large token transfers may take some time to index
