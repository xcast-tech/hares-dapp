import { getEthBuyQuote, getTokenSellQuote } from '@/lib/utils';
import * as dotenv from 'dotenv'
dotenv.config();

async function main() {
  console.log(getEthBuyQuote(1e8, 1))
  console.log(getTokenSellQuote(5e8, 1e8))
}

main()