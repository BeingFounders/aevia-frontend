import { Chain, createPublicClient, createWalletClient, custom, parseUnits, type Address } from 'viem'

export const ERC20_ABI = [{
  name: 'approve',
  type: 'function',
  stateMutability: 'nonpayable',
  inputs: [
    { name: 'spender', type: 'address' },
    { name: 'amount', type: 'uint256' }
  ],
  outputs: [{ type: 'bool' }]
}, {
  name: 'allowance',
  type: 'function',
  stateMutability: 'view',
  inputs: [
    { name: 'owner', type: 'address' },
    { name: 'spender', type: 'address' }
  ],
  outputs: [{ type: 'uint256' }]
}];

export interface EIP712Data {
  domain: {
      name: string;
      version: string;
      chainId: number;
      verifyingContract: Address;
  };
  types: {
      [key: string]: Array<{ name: string; type: string }>;
  };
  message: Record<string, string | number | boolean>;
  primaryType: string;
}

export const getUserWalletAddress = async (chain: Chain) => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }
  const walletClient = createWalletClient({
    chain,
    transport: custom(window.ethereum)
  });

  const [address] = await walletClient.requestAddresses();
  return address;
}

export const approveERC20 = async (
  tokenAddress: Address, 
  spenderAddress: Address, 
  amount: string, 
  decimals: number,
  chain: Chain
) => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const publicClient = createPublicClient({
    chain,
    transport: custom(window.ethereum)
  });

  const walletClient = createWalletClient({
    chain,
    transport: custom(window.ethereum)
  });

  const [address] = await walletClient.requestAddresses();
  const parsedAmount = parseUnits(amount, decimals);

  const hash = await walletClient.writeContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [spenderAddress, parsedAmount],
    account: address
  });

  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
};

export const signTypedData = async (data: EIP712Data, chain: Chain) => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const walletClient = createWalletClient({
    chain,
    transport: custom(window.ethereum)
  });

  const [address] = await walletClient.requestAddresses();

  const signature = await walletClient.signTypedData({
    account: address,
    domain: data.domain,
    types: data.types,
    primaryType: data.primaryType,
    message: data.message,
  });

  return {
    address,
    signature
  }
};

export const checkAllowance = async (
  tokenAddress: Address, 
  spenderAddress: Address, 
  amount: string, 
  decimals: number,
  chain: Chain
) => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const publicClient = createPublicClient({
    chain,
    transport: custom(window.ethereum)
  });

  const walletClient = createWalletClient({
    chain,
    transport: custom(window.ethereum)
  });

  const [address] = await walletClient.requestAddresses();
  const parsedAmount = parseUnits(amount, decimals);

  const allowance: bigint = await publicClient.readContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address, spenderAddress],
  }) as bigint;

  return allowance >= parsedAmount;
};

export const switchNetwork = async (chain: Chain) => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const walletClient = createWalletClient({
    chain,
    transport: custom(window.ethereum)
  });

  try {
    await walletClient.switchChain({ id: chain.id });
  } catch (error) {
    console.error('Error switching chain:', error);
    throw error;
  }
};