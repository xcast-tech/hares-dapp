export default [
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "protocolFeeRecipient",
            type: "address",
          },
          {
            internalType: "address",
            name: "weth",
            type: "address",
          },
          {
            internalType: "address",
            name: "nonfungiblePositionManager",
            type: "address",
          },
          {
            internalType: "address",
            name: "swapRouter",
            type: "address",
          },
          {
            internalType: "address",
            name: "bondingCurve",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "tradeCreatorFeeBps",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "lpCreatorFeeBps",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "graduateCreatorFee",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "createTokenFee",
            type: "uint256",
          },
        ],
        internalType: "struct IBABFactory.Config",
        name: "_config",
        type: "tuple",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "InsufficientFee",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "creator",
        type: "address",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        indexed: false,
        internalType: "string",
        name: "symbol",
        type: "string",
      },
      {
        indexed: false,
        internalType: "address",
        name: "validator",
        type: "address",
      },
      {
        components: [
          {
            internalType: "address",
            name: "protocolFeeRecipient",
            type: "address",
          },
          {
            internalType: "address",
            name: "weth",
            type: "address",
          },
          {
            internalType: "address",
            name: "nonfungiblePositionManager",
            type: "address",
          },
          {
            internalType: "address",
            name: "swapRouter",
            type: "address",
          },
          {
            internalType: "address",
            name: "bondingCurve",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "tradeCreatorFeeBps",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "lpCreatorFeeBps",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "graduateCreatorFee",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "createTokenFee",
            type: "uint256",
          },
        ],
        indexed: false,
        internalType: "struct IBABFactory.Config",
        name: "config",
        type: "tuple",
      },
    ],
    name: "BABTokenCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "symbol",
        type: "string",
      },
      {
        internalType: "address",
        name: "validator",
        type: "address",
      },
    ],
    name: "createToken",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [],
    name: "getConfig",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "protocolFeeRecipient",
            type: "address",
          },
          {
            internalType: "address",
            name: "weth",
            type: "address",
          },
          {
            internalType: "address",
            name: "nonfungiblePositionManager",
            type: "address",
          },
          {
            internalType: "address",
            name: "swapRouter",
            type: "address",
          },
          {
            internalType: "address",
            name: "bondingCurve",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "tradeCreatorFeeBps",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "lpCreatorFeeBps",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "graduateCreatorFee",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "createTokenFee",
            type: "uint256",
          },
        ],
        internalType: "struct IBABFactory.Config",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: "address",
            name: "protocolFeeRecipient",
            type: "address",
          },
          {
            internalType: "address",
            name: "weth",
            type: "address",
          },
          {
            internalType: "address",
            name: "nonfungiblePositionManager",
            type: "address",
          },
          {
            internalType: "address",
            name: "swapRouter",
            type: "address",
          },
          {
            internalType: "address",
            name: "bondingCurve",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "tradeCreatorFeeBps",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "lpCreatorFeeBps",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "graduateCreatorFee",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "createTokenFee",
            type: "uint256",
          },
        ],
        internalType: "struct IBABFactory.Config",
        name: "_config",
        type: "tuple",
      },
    ],
    name: "setConfig",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
