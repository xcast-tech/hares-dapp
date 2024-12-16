import { useRouter } from 'next/router'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function Token() {
  const router = useRouter()
  const { slug } = router.query

  return (
    <div className='px-[10vw] py-4'>
      <ConnectButton />
      <h1 className='mt-10 font-bold'>Token: {slug}</h1>
      <Card className='mt-6'>
        <CardHeader>
          <CardTitle>Buy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 w-80">
            <Input placeholder='name' />
            <Input placeholder='symbol' />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Submit</Button>
        </CardFooter>
      </Card>
      <Card className='mt-6'>
        <CardHeader>
          <CardTitle>Sell</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 w-80">
            <Input placeholder='name' />
            <Input placeholder='symbol' />
          </div>
        </CardContent>
        <CardFooter>
          <Button>Submit</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

