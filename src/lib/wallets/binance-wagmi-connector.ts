import type BinanceProvider from "@binance/w3w-ethereum-provider";
import {
  ProviderRpcError,
  isInBinance,
  normalizeChainId,
  getDeepLink,
  getIsMobile,
} from "@binance/w3w-utils";
import {
  SwitchChainError,
  UserRejectedRequestError,
  getAddress,
  numberToHex,
} from "viem";
import { ChainNotConfiguredError, createConnector } from "wagmi";
import { injected } from "wagmi/connectors";

type BinanceOptions = ConstructorParameters<typeof BinanceProvider>[0];
export type BinanceW3WParameters = BinanceOptions;

binanceWallet.type = "binanceWallet" as const;

function binanceWallet(parameters: BinanceW3WParameters = {}) {
  type Provider = BinanceProvider;
  type Properties = Record<string, unknown>;

  let walletProvider: Provider | undefined;

  return createConnector<Provider, Properties>((config) => ({
    id: "wallet.binance.com",
    name: "Binance Wallet",
    type: binanceWallet.type,
    async setup() {
      const provider = await this.getProvider();
      if (!provider) return;
      provider.on("connect", this.onConnect?.bind(this));
    },
    async connect({ chainId } = {}) {
      // hack for mobile
      if (!isInBinance() && getIsMobile()) {
        window.open(getDeepLink(location.href, chainId).bnc);
        return { accounts: [], chainId: chainId as number };
      }
      chainId = chainId ?? 56;
      const provider = await this.getProvider({ chainId });

      provider.on("accountsChanged", this.onAccountsChanged.bind(this));
      provider.on("chainChanged", this.onChainChanged.bind(this));
      provider.on("disconnect", this.onDisconnect.bind(this));
      setTimeout(
        () => config.emitter.emit("message", { type: "connecting" }),
        0
      );

      provider.setLng(parameters.lng || "en");

      const accounts = (await provider.enable()).map((x) => getAddress(x));
      const id = await this.getChainId();
      return { accounts, chainId: id };
    },
    async disconnect() {
      const provider = await this.getProvider();
      provider.disconnect();

      provider.removeListener("accountsChanged", this.onAccountsChanged);
      provider.removeListener("chainChanged", this.onChainChanged);
      provider.removeListener("disconnect", this.onDisconnect);
    },
    async getAccounts() {
      const provider = await this.getProvider();
      const accounts = (await provider.request({
        method: "eth_accounts",
      })) as string[];
      return accounts.map((x) => getAddress(x));
    },
    async getChainId() {
      const provider = await this.getProvider();
      const chainId =
        provider.chainId ??
        (await provider?.request({ method: "eth_chainId" }));
      return normalizeChainId(chainId);
    },
    async getProvider({ chainId }: { chainId?: number } = {}): Promise<any> {
      if (typeof window === "undefined") return undefined;
      const BinanceProvider = (await import("@binance/w3w-ethereum-provider"))
        .default;

      const targetChainId = chainId || config.chains[0]?.id;
      const rpc = !parameters.infuraId
        ? config.chains.reduce(
            (rpcProps, chain) => ({
              ...rpcProps,
              [chain.id]: chain.rpcUrls.default.http[0],
            }),
            {}
          )
        : {};

      walletProvider = new BinanceProvider({
        ...parameters,
        chainId: targetChainId,
        rpc: { ...rpc, ...(this.options as any)?.rpc },
      });
      return walletProvider;
    },
    async isAuthorized() {
      try {
        const account = await this.getAccounts();
        return account.length > 0;
      } catch {
        return false;
      }
    },
    async switchChain({ chainId }) {
      const chain = config.chains.find((chain) => chain.id === chainId);
      if (!chain) throw new SwitchChainError(new ChainNotConfiguredError());

      const provider = await this.getProvider();
      const id = numberToHex(chain.id);

      try {
        await Promise.race([
          provider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: id }],
          }),
          new Promise((res) =>
            config.emitter.once("change", ({ chainId: currentChainId }) => {
              if (currentChainId === chainId) res(chainId);
            })
          ),
        ]);
        return chain;
      } catch (error) {
        const message =
          typeof error === "string"
            ? error
            : (error as ProviderRpcError)?.message;
        if (/user rejected request/i.test(message))
          throw new UserRejectedRequestError(error as any);
        throw new SwitchChainError(error as any);
      }
    },
    onAccountsChanged(accounts: string[]) {
      if (accounts.length === 0) config.emitter.emit("disconnect");
      else
        config.emitter.emit("change", {
          accounts: accounts.map((x) => getAddress(x)),
        });
    },
    onChainChanged(chain) {
      const chainId = normalizeChainId(chain);
      config.emitter.emit("change", { chainId });
    },
    async onConnect(connectInfo) {
      const accounts = await this.getAccounts();
      if (accounts.length === 0) return;

      const chainId = normalizeChainId(connectInfo.chainId);
      config.emitter.emit("connect", { accounts, chainId });

      const provider = await this.getProvider();
      if (provider) {
        provider.removeListener("connect", this.onConnect?.bind(this));
        provider.on("accountsChanged", this.onAccountsChanged.bind(this));
        provider.on("chainChanged", this.onChainChanged);
        provider.on("disconnect", this.onDisconnect.bind(this));
      }
    },
    async onDisconnect(error) {
      config.emitter.emit("disconnect");
      const provider = await this.getProvider();
      provider.removeListener(
        "accountsChanged",
        this.onAccountsChanged.bind(this)
      );
      provider.removeListener("chainChanged", this.onChainChanged);
      provider.removeListener("disconnect", this.onDisconnect.bind(this));
      provider.on("connect", this.onConnect?.bind(this));
    },
  }));
}

export const getWagmiConnectorV2 = () => {
  if (isInBinance()) {
    return injected;
  }
  return binanceWallet;
};
