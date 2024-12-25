import { ABIs } from '@/lib/constant';
import { getEthBuyQuote, getTokenSellQuote } from '@/lib/utils';
import * as dotenv from 'dotenv'
import { decodeErrorResult } from 'viem';
dotenv.config();

async function main() {
  // console.log(getEthBuyQuote(1e8, 1))
  // console.log(getTokenSellQuote(5e8, 1e8))

  const err = decodeErrorResult({
    abi: ABIs.HaresAbi,
    data: '0x8baa579f'
  })
  console.log(err)
}

main()