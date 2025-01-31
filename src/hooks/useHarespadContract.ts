import { getSignatureApi } from "@/lib/apis";
import { ABIs, contractAddress } from "@/lib/constant";
import { Address } from "@/lib/types";
import { parseEther } from "viem";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { toast } from "react-toastify";
import { getSqrtPriceLimitX96 } from "@/lib/utils";

export function useHarespadContract() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  async function createToken(name: string, symbol: string, tokenId: number) {
    if (!address) {
      toast("Please connect wallet first");
      return null;
    }

    try {
      const tx = await writeContractAsync({
        address: contractAddress.HarespadFactory,
        abi: ABIs.HarespadFactory,
        functionName: "createToken",
        args: [name, symbol, ""],
      });

      await publicClient?.waitForTransactionReceipt({ hash: tx });
      return tx;
    } catch (error: any) {
      toast(error?.message);
      return null;
    }
  }

  async function raise(harespadAddress: Address, amount: number) {
    if (!address) {
      toast("Please connect wallet first");
      return null;
    }

    try {
      const tx = await writeContractAsync({
        address: harespadAddress,
        abi: ABIs.Harespad,
        functionName: "raise",
        args: [address],
        value: parseEther(amount.toString()),
      });

      await publicClient?.waitForTransactionReceipt({ hash: tx });
      return tx;
    } catch (error: any) {
      toast(error?.message);
      return null;
    }
  }

  async function raisedOf(harespadAddress: Address, userAddress: Address) {
    if (!publicClient) {
      return 0;
    }

    try {
      const raised = await publicClient.readContract({
        address: harespadAddress,
        abi: ABIs.Harespad,
        functionName: "raisedOf",
        args: [userAddress],
      });

      return Number(raised);
    } catch (error: any) {
      toast(error?.message);
      return 0;
    }
  }

  async function getClaim(harespadAddress: Address, userAddress: Address) {
    if (!publicClient) {
      return [0, 0];
    }

    try {
      const claimInfo = await publicClient.readContract({
        address: harespadAddress,
        abi: ABIs.Harespad,
        functionName: "getClaim",
        args: [userAddress],
      });

      return claimInfo;
    } catch (error: any) {
      toast(error?.message);
      return [0, 0];
    }
  }

  async function claim(harespadAddress: Address) {
    if (!address) {
      toast("Please connect wallet first");
      return null;
    }

    try {
      const tx = await writeContractAsync({
        address: harespadAddress,
        abi: ABIs.Harespad,
        functionName: "claim",
        args: [[address]],
      });

      await publicClient?.waitForTransactionReceipt({ hash: tx });
      return tx;
    } catch (error: any) {
      toast(error?.message);
      return null;
    }
  }

  async function getIsGraduate(harespadAddress: Address) {
    if (!publicClient) {
      return false;
    }

    try {
      const isGraduate = await publicClient.readContract({
        address: harespadAddress,
        abi: ABIs.Harespad,
        functionName: "getIsGraduate",
        args: [],
      });

      return isGraduate;
    } catch (error: any) {
      toast(error?.message);
      return false;
    }
  }

  async function owner(harespadAddress: Address) {
    if (!publicClient) {
      return null;
    }

    try {
      const tokenOwner = await publicClient.readContract({
        address: harespadAddress,
        abi: ABIs.Harespad,
        functionName: "owner",
        args: [],
      });

      return tokenOwner;
    } catch (error: any) {
      toast(error?.message);
      return null;
    }
  }

  async function graduate(harespadAddress: Address) {
    if (!address) {
      toast("Please connect wallet first");
      return null;
    }

    try {
      const tx = await writeContractAsync({
        address: harespadAddress,
        abi: ABIs.Harespad,
        functionName: "graduate",
        args: [],
      });

      await publicClient?.waitForTransactionReceipt({ hash: tx });
      return tx;
    } catch (error: any) {
      toast(error?.message);
      return null;
    }
  }

  async function uniswapBuy(
    harespadAddress: Address,
    recipient: Address,
    minOrderSize: bigint,
    sqrtPriceLimitX96: bigint
  ) {
    if (!address) {
      toast("Please connect wallet first");
      return null;
    }

    try {
      const tx = await writeContractAsync({
        address: harespadAddress,
        abi: ABIs.Harespad,
        functionName: "uniswapBuy",
        args: [recipient, minOrderSize, sqrtPriceLimitX96],
        value: parseEther("0.01"), // Example value, adjust as needed
      });

      await publicClient?.waitForTransactionReceipt({ hash: tx });
      return tx;
    } catch (error: any) {
      toast(error?.message);
      return null;
    }
  }

  async function uniswapSell(
    harespadAddress: Address,
    tokensToSell: bigint,
    recipient: Address,
    minPayoutSize: bigint,
    sqrtPriceLimitX96: bigint
  ) {
    if (!address) {
      toast("Please connect wallet first");
      return null;
    }

    try {
      const tx = await writeContractAsync({
        address: harespadAddress,
        abi: ABIs.Harespad,
        functionName: "uniswapSell",
        args: [tokensToSell, recipient, minPayoutSize, sqrtPriceLimitX96],
      });

      await publicClient?.waitForTransactionReceipt({ hash: tx });
      return tx;
    } catch (error: any) {
      toast(error?.message);
      return null;
    }
  }

  return {
    createToken,
    raise,
    raisedOf,
    getClaim,
    claim,
    getIsGraduate,
    owner,
    graduate,
    uniswapBuy,
    uniswapSell,
  };
}
