import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useState } from 'react';
import { useContract } from '@/hooks/useContract';
import { useAccount } from 'wagmi';
import { Label } from '@/components/ui/label';

export default function Demo() {

  const { address } = useAccount()
  const { createToken } = useContract()
  const [name, setName] = useState('')
  const [symbol, setSymbol] = useState('')
  const [tx, setTx] = useState('')
  const [commitment, setCommitment] = useState<Record<string, string>>({
    value: '1000000000000000000',
    recipient: address || '0x',
    refundRecipient: address || '0x',
    minOrderSize: '0',
    sqrtPriceLimitX96: '0',
    expired: '999999999999',
  })
  const [signature, setSignature] = useState('')

  const handleCreateToken = async () => {
    if (!name || !symbol) {
      alert('Invalid')
      return
    }
    const res = await createToken(name, symbol)
    console.log(res)
    setTx(res?.transactionHash ?? '')
  }
  
  const handleGenerateSignature = async () => {
    const res = await fetch('/api/signature', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commitment)
    }).then(res => res.json())
    setSignature(res.data)
  }

  return (
    <div className='px-[10vw] py-4'>
      <ConnectButton />
      <Card className='mt-10'>
        <CardHeader>
          <CardDescription>Connected wallet: {address}</CardDescription>
        </CardHeader>
      </Card>
      <Card className='mt-10'>
        <CardHeader>
          <CardTitle>Create Token</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 w-80">
            <Input placeholder='name' value={name} onChange={e => setName(e.target.value)}/>
            <Input placeholder='symbol' value={symbol} onChange={e => setSymbol(e.target.value)}/>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleCreateToken}>Submit</Button>
          <a href={`https://polygonscan.com/tx/${tx}`} className='ml-2'>{tx}</a>
        </CardFooter>
      </Card>

      <Card className='mt-10'>
        <CardHeader>
          <CardTitle>Generate signature</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {
              Object.keys(commitment).map(v => (
                <div className='flex gap-2 items-center'>
                  <Label className='w-32'>{v}</Label>
                  <Input className='w-80' placeholder={v} value={commitment[v]} onChange={e => setCommitment({...commitment, [v]: e.target.value})}/>
                </div>
              ))
            }
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerateSignature}>Submit</Button>
          <span className="ml-2">{signature}</span>
        </CardFooter>
      </Card>
    </div>
  );
}
