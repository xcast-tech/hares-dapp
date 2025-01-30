import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardHeader, 
  CardBody, 
  Button, 
  Input, 
  Progress,
  Divider,
  Tabs,
  Tab,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from "@nextui-org/react";
import Head from "next/head";
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import { toast } from 'react-toastify';
import { parseEther } from 'viem';
import { useHarespadContract } from '@/hooks/useHarespadContract';
import { isAddress } from 'viem';
import { GetStaticPaths, GetStaticProps } from 'next';

const TabKeys = {
  buy: "buy",
  sell: "sell",
};

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking'
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;

  // Validate if slug is a valid Ethereum address
  if (!slug || !isAddress(slug)) {
    return {
      notFound: true
    };
  }

  return {
    props: {
      slug
    },
    revalidate: 10 // Revalidate every 10 seconds
  };
};

export default function TokenLaunchpad({ slug }: { slug: `0x${string}` }) {
  const { address } = useAccount();
  const { 
    raise, 
    raisedOf, 
    getClaim, 
    getIsGraduate, 
    uniswapBuy, 
    uniswapSell 
  } = useHarespadContract();

  const [currentStage, setCurrentStage] = useState<'raising' | 'graduate'>('raising');
  const [raiseAmount, setRaiseAmount] = useState('');
  const [userRaiseInfo, setUserRaiseInfo] = useState({
    totalRaised: 0,
    maxClaimableTokens: 0,
  });

  const [tabKey, setTabKey] = useState<string | number>(TabKeys.buy);
  const [buyInputValue, setBuyInputValue] = useState<string>();
  const [sellInputValue, setSellInputValue] = useState<string>();
  const [slippage, setSlippage] = useState("20");
  const [editSlippage, setEditSlippage] = useState("");
  const [slippageModalOpen, setSlippageModalOpen] = useState(false);
  const [trading, setTrading] = useState(false);

  const tabColor = tabKey === "buy" ? "success" : "danger";

  const buyOptions = [
    { label: "reset", value: 0 },
    { label: "0.01 ETH", value: 0.01 },
    { label: "0.02 ETH", value: 0.02 },
    { label: "0.05 ETH", value: 0.05 },
    { label: "0.1 ETH", value: 0.1 },
  ];

  const sellOptions = [
    { label: "reset", value: 0 },
    { label: "25%", value: 0.25 },
    { label: "50%", value: 0.5 },
    { label: "100%", value: 1 },
  ];

  useEffect(() => {
    const fetchTokenInfo = async () => {
      try {
        // Check graduation status
        const isGraduated = await getIsGraduate(slug);
        setCurrentStage(isGraduated ? 'graduate' : 'raising');

        // Fetch user's raised amount
        if (address) {
          const raised = await raisedOf(slug, address);
          
          // Get claimable tokens
          const [claimableTokens] = await getClaim(slug, address);

          setUserRaiseInfo({
            totalRaised: raised,
            maxClaimableTokens: Number(claimableTokens)
          });
        }
      } catch (error) {
        console.error('Error fetching token info:', error);
        toast('Failed to fetch token information');
      }
    };

    fetchTokenInfo();
  }, [slug, address]);

  const handleRaiseSubmit = async () => {
    const amount = parseFloat(raiseAmount);
    if (isNaN(amount) || amount <= 0) {
      toast('Invalid raise amount');
      return;
    }

    try {
      const tx = await raise(slug, amount);
      if (tx) {
        toast('Raise submitted successfully');
        setRaiseAmount('');
      }
    } catch (error) {
      toast('Failed to submit raise');
    }
  };

  const handleBuy = async () => {
    const amount = parseFloat(buyInputValue || '0');
    if (isNaN(amount) || amount <= 0) {
      toast('Invalid buy amount');
      return;
    }

    try {
      setTrading(true);
      // TODO: Implement actual buy logic with proper parameters
      const tx = await uniswapBuy(
        slug, 
        address!, 
        BigInt(0), 
        BigInt(0)
      );
      if (tx) {
        toast('Buy transaction initiated');
      }
    } catch (error) {
      toast('Failed to buy tokens');
    } finally {
      setTrading(false);
    }
  };

  const handleSell = async () => {
    const amount = parseFloat(sellInputValue || '0');
    if (isNaN(amount) || amount <= 0) {
      toast('Invalid sell amount');
      return;
    }

    try {
      setTrading(true);
      // TODO: Implement actual sell logic with proper parameters
      const tx = await uniswapSell(
        slug, 
        BigInt(0), 
        address!, 
        BigInt(0), 
        BigInt(0)
      );
      if (tx) {
        toast('Sell transaction initiated');
      }
    } catch (error) {
      toast('Failed to sell tokens');
    } finally {
      setTrading(false);
    }
  };

  const handleSlippageModalClose = () => {
    const num = +editSlippage;
    if (num < 0 || num > 100) {
      toast("Invalid slippage");
      return;
    }
    setSlippage(editSlippage || "0");
    setSlippageModalOpen(false);
  };

  return (
    <div className="container mx-auto p-4">
      <Head>
        <title>{`Launchpad | hares.ai`}</title>
      </Head>
      <Card>
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
          <h1 className="text-2xl font-bold">Token Launchpad: {slug}</h1>
        </CardHeader>
        <CardBody>
          {currentStage === 'raising' && (
            <div className="space-y-4">
              <h2 className="text-xl">Raising Stage</h2>
              <Input 
                type="number" 
                label="Enter amount to raise"
                value={raiseAmount}
                onValueChange={setRaiseAmount}
                fullWidth
                variant="bordered"
              />
              <Button 
                color="primary" 
                fullWidth 
                onClick={handleRaiseSubmit}
              >
                Submit Raise
              </Button>
              {userRaiseInfo.totalRaised > 0 && (
                <div>
                  <p>Total Raised: {userRaiseInfo.totalRaised} ETH</p>
                </div>
              )}
            </div>
          )}

          {currentStage === 'graduate' && (
            <div className="text-xs xl:text-sm">
              <Tabs 
                fullWidth 
                className="h-[40px]" 
                size="lg" 
                color={tabColor} 
                selectedKey={tabKey} 
                onSelectionChange={(key) => setTabKey(key)}
              >
                <Tab key={TabKeys.buy} title="Buy" />
                <Tab key={TabKeys.sell} title="Sell" />
              </Tabs>
              <div className="mt-6">
                {tabKey === TabKeys.buy && (
                  <div>
                    <div>
                      <div className="mb-3 flex justify-between items-center">
                        <span>Amount (ETH)</span>
                        <Button
                          size="sm"
                          className="text-[#999] h-[26px]"
                          onPress={() => {
                            setEditSlippage(slippage);
                            setSlippageModalOpen(true);
                          }}
                        >
                          set max slippage
                        </Button>
                      </div>
                      <Input
                        value={buyInputValue}
                        onChange={(e) => setBuyInputValue(e.target.value)}
                        type="number"
                        endContent={"ETH"}
                        autoFocus={false}
                      />
                    </div>

                    <div className="mt-4 mb-2 flex gap-1">
                      {buyOptions.map((option, i) => (
                        <Chip
                          key={i}
                          size="sm"
                          className="cursor-pointer text-[10px] xl:text-xs"
                          onClick={() => setBuyInputValue(String(option.value))}
                        >
                          {option.label}
                        </Chip>
                      ))}
                    </div>
                    <Button 
                      fullWidth 
                      color="success" 
                      className="mt-2" 
                      onPress={handleBuy} 
                      isLoading={trading}
                    >
                      {trading ? "Trading..." : "Place trade"}
                    </Button>
                  </div>
                )}

                {tabKey === TabKeys.sell && (
                  <div>
                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <div>Amount (Token)</div>
                        <Button
                          size="sm"
                          className="text-[#999] h-[26px]"
                          onPress={() => {
                            setEditSlippage(slippage);
                            setSlippageModalOpen(true);
                          }}
                        >
                          set max slippage
                        </Button>
                      </div>
                      <Input
                        value={sellInputValue}
                        onChange={(e) => setSellInputValue(e.target.value)}
                        type="number"
                        endContent={"Token"}
                        autoFocus={false}
                      />
                    </div>

                    <div className="mt-4 mb-2 flex gap-1">
                      {sellOptions.map((option, i) => (
                        <Chip
                          key={i}
                          size="sm"
                          className="cursor-pointer text-[10px] xl:text-xs"
                          onClick={() => setSellInputValue(String(option.value))}
                        >
                          {option.label}
                        </Chip>
                      ))}
                    </div>
                    <Button 
                      fullWidth 
                      color="danger" 
                      className="mt-2" 
                      onPress={handleSell} 
                      isLoading={trading}
                    >
                      {trading ? "Trading..." : "Place trade"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={slippageModalOpen} onOpenChange={(open) => setSlippageModalOpen(open)}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Set Max. Slippage (%)</ModalHeader>
              <ModalBody>
                <div>
                  <Input
                    type="number"
                    value={editSlippage}
                    onChange={(event) => setEditSlippage(event.target.value)}
                    autoFocus={false}
                  />
                  <div className="text-xs mt-1">This is the maximum amount of slippage you are willing to accept when placing trades.</div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={handleSlippageModalClose}>
                  OK
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
