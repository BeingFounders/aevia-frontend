"use client";

import { useState, FormEvent, useEffect, useCallback } from "react";
import { Label } from "@headlessui/react";
// import { Description, Field, Label, Switch } from "@headlessui/react";
// import { ChevronDownIcon } from "@heroicons/react/16/solid";

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { ChevronUpDownIcon } from "@heroicons/react/16/solid";
import { CheckIcon } from "@heroicons/react/20/solid";
import {
  approveERC20,
  getUserWalletAddress,
  signTypedData,
  checkAllowance,
  switchNetwork,
} from "./blockchain";
import {
  createPublicClient,
  createWalletClient,
  custom,
  formatUnits,
  parseUnits,
  type Address,
  type Abi,
  Chain,
} from "viem";
import { sepolia, mantleTestnet, modeTestnet, base } from "viem/chains";
import { ERC20_ABI } from "./blockchain";
import { createLegacy, getSignatureMessage, getContractByNameAndChainId, setSignature, startCron } from "./api";

// Add this type definition
type TokenType = {
  id: number;
  name: string;
  image: string;
  address: Address;
  chainId: number;
  type: string;
  decimals: number;
};

type TokensType = {
  [chainId: number]: TokenType[];
};

// Agregar el tipo para el contrato
type ContractType = {
  address: Address;
  abi: Abi;
};

const networks = [
  {
    id: 1,
    name: "Sepolia",
    image: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
    chainId: 11155111,
  },
  {
    id: 2,
    name: "Mantle Sepolia Testnet",
    image: "https://s2.coinmarketcap.com/static/img/coins/64x64/27075.png",
    chainId: 5003,
  },
  {
    id: 3,
    name: "Mantle Mainnet",
    image: "https://s2.coinmarketcap.com/static/img/coins/64x64/27075.png",
    chainId: 5000,
  },
  {
    id: 4,
    name: "Base Sepolia Testnet",
    image: "https://s2.coinmarketcap.com/static/img/coins/64x64/27716.png",
    chainId: 84532,
  },
  {
    id: 5,
    name: "Mode Sepolia Testnet",
    image: "https://s2.coinmarketcap.com/static/img/coins/64x64/31016.png",
    chainId: 919,
  },
];

const tokens: TokensType = {
  11155111: [
    {
      id: 1,
      name: "USDT",
      image: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
      address: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0" as Address,
      chainId: 11155111,
      type: "ERC20",
      decimals: 6,
    },
    {
      id: 2,
      name: "USDC",
      image: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
      address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as Address,
      chainId: 11155111,
      type: "ERC20",
      decimals: 6,
    },
  ],
  5003: [
    {
      id: 1,
      name: "USDT",
      image: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
      address: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0" as Address,
      chainId: 5003,
      type: "ERC20",
      decimals: 6,
    },
    {
      id: 2,
      name: "USDC",
      image: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
      address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238" as Address,
      chainId: 5003,
      type: "ERC20",
      decimals: 6,
    },
  ],
  5000: [
    {
      id: 3,
      name: "Just a Boy",
      image: "https://trump-boys.vercel.app/boyss.jpg",
      address: "0x144cfdAe8a75E5D7008740992eD2694E660b6C2C" as Address,
      chainId: 5003,
      type: "ERC721",
      decimals: 0,
    },
  ],
  84532: [],
  919: [
    {
      id: 1,
      name: "AEVIA (Fake ERC20)",
      image: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
      address: "0xB8a4b92ffFd0eEd15BbE22a65922Ac389262C719" as Address,
      chainId: 919,
      type: "ERC20",
      decimals: 18,
    },
  ],
};

// Add a mapping of chainId to Chain object
const chainsByChainId: { [chainId: number]: Chain } = {
  11155111: sepolia,
  5003: mantleTestnet,
  84532: base,
  919: modeTestnet,
  // ... add other chains as needed
};

export default function LegacyForm() {
  const [emailFeatureEnabled, _setEmailFeatureEnabled] = useState(true);
  const [cryptoFeatureEnabled, _setCryptoFeatureEnabled] = useState(true);
  const [hasAllowance, setHasAllowance] = useState(false);
  const [currentAllowance, setCurrentAllowance] = useState("0");
  const [protocolContract, setProtocolContract] = useState<ContractType | null>(null);

  const defaultNetwork = networks[0].chainId;
  const [selectedToken, setSelectedToken] = useState(
    tokens[defaultNetwork][0]
  );

  const [selectedNetwork, setSelectedNetwork] = useState(networks[0]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "United States",
    trustedContactName: "",
    trustedContactEmail: "",
    emailTo: "",
    emailMessage: "",
    recipientAddress: "",
    amount: "",
    tokenId: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const userWalletAddress = cryptoFeatureEnabled
        ? await getUserWalletAddress(chainsByChainId[selectedNetwork.chainId])
        : null;

      if (cryptoFeatureEnabled && !userWalletAddress) {
        throw new Error("User wallet address not found");
      }

      // Uncomment when ready to use
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        country: formData.country,
        trustedContactName: formData.trustedContactName,
        trustedContactEmail: formData.trustedContactEmail,
        emailTo: emailFeatureEnabled ? formData.emailTo : null,
        emailMessage: emailFeatureEnabled ? formData.emailMessage : null,
        cryptoWalletFrom: cryptoFeatureEnabled ? userWalletAddress : null,
        cryptoWalletTo: cryptoFeatureEnabled ? formData.recipientAddress : null,
        cryptoTokenAddress: cryptoFeatureEnabled ? selectedToken.address : null,
        cryptoTokenId: selectedToken.type === "ERC721" ? formData.tokenId : null,
        cryptoAmount: selectedToken.type === "ERC20" ? parseUnits(formData.amount, selectedToken.decimals).toString() : null,
        cryptoChainId: cryptoFeatureEnabled ? selectedToken.chainId : null,
        cryptoTokenType: selectedToken.type === "ERC20" ? 0 : 1,
      };
      
      const legacyData = await createLegacy(payload);
      console.log("Legacy saved successfully:", legacyData);

      const message = await getSignatureMessage(legacyData.id);
      console.log("getSignatureMessage",message);

      const { address, signature } = await signTypedData(message, chainsByChainId[selectedNetwork.chainId]);
      console.log("signTypedData",{ address, signature });

      await setSignature(legacyData.id, signature);
      console.log("Signature set successfully");

      await startCron({
        user: formData.email,
        beneficiary: formData.emailTo,
        contact_id: formData.trustedContactEmail,
        legacy: `${formData.amount} ${selectedToken.name}`,
      });
      console.log("Cron started successfully");

    } catch (error) {
      console.error("Error saving legacy:", error);
    }
  };

  // Función para verificar allowance
  const verifyAllowance = useCallback(async () => {
    if (cryptoFeatureEnabled && 
        selectedToken.type === "ERC20" && 
        formData.amount && 
        protocolContract) {
      try {
        const chain = chainsByChainId[selectedNetwork.chainId];
        const allowed = await checkAllowance(
          selectedToken.address,
          protocolContract.address,
          formData.amount,
          selectedToken.decimals,
          chain
        );
        setHasAllowance(allowed);
      } catch (error) {
        console.error("Error checking allowance:", error);
        setHasAllowance(false);
      }
    }
  }, [cryptoFeatureEnabled, formData.amount, selectedToken, protocolContract, selectedNetwork.chainId]);

  useEffect(() => {
    verifyAllowance();
  }, [verifyAllowance]);

  const handleApprove = async () => {
    try {
      debugger;
      if (!protocolContract?.address) return;
      if (!formData.amount) return;
      
      const chain = chainsByChainId[selectedNetwork.chainId];
      if (chain.id !== selectedNetwork.chainId) {
        await handleNetworkChange(selectedNetwork);
      }

      await approveERC20(
        selectedToken.address,
        protocolContract.address,
        formData.amount,
        selectedToken.decimals,
        chain
      );
      await verifyAllowance();
    } catch (error) {
      console.error("Error approving spend:", error);
    }
  };

  const getCurrentAllowance = useCallback(async () => {
    if (cryptoFeatureEnabled && selectedToken.type === "ERC20") {
      if (!protocolContract?.address) return;

      try {
        const chain = chainsByChainId[selectedNetwork.chainId];
        const publicClient = createPublicClient({
          chain,
          transport: custom(window.ethereum),
        });
        const walletClient = createWalletClient({
          chain,
          transport: custom(window.ethereum),
        });
        const [address] = await walletClient.requestAddresses();
        const allowance: bigint = await publicClient.readContract({
          address: selectedToken.address,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [address, protocolContract.address],
        }) as bigint;
        setCurrentAllowance(formatUnits(allowance, selectedToken.decimals));
      } catch (error) {
        console.error("Error getting allowance:", error);
        setCurrentAllowance("0");
      }
    }
  }, [cryptoFeatureEnabled, selectedToken, protocolContract, selectedNetwork.chainId]);

  useEffect(() => {
    getCurrentAllowance();
  }, [getCurrentAllowance]);

  useEffect(() => {
    const networkTokens = tokens[selectedNetwork.chainId];
    if (networkTokens?.length > 0) {
      setSelectedToken(networkTokens[0]);
    }
    
    const fetchProtocolAddress = async () => {
      try {
        const contract = await getContractByNameAndChainId("AeviaProtocol", selectedNetwork.chainId);
        setProtocolContract(contract);
      } catch (error) {
        console.error("Error fetching protocol address:", error);
        setProtocolContract(null);
      }
    };

    fetchProtocolAddress();
  }, [selectedNetwork.chainId]);

  return (
    <div className="mt-6 flex justify-center items-start h-screen mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className="mt-12">
            <h2 className="text-base/7 font-semibold text-gray-900">
              Legacy Information
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label
                  htmlFor="first-name"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  First name
                </label>
                <div className="mt-2">
                  <input
                    id="first-name"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="last-name"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Last name
                </label>
                <div className="mt-2">
                  <input
                    id="last-name"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="email"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Your telegram username
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="text"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
              {/* <div className="sm:col-span-3">
                <label
                  htmlFor="country"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Country
                </label>
                <div className="mt-2 grid grid-cols-1">
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  >
                    <option>United States</option>
                    <option>Canada</option>
                    <option>Colombia</option>
                    <option>Mexico</option>
                    <option>Argentina</option>
                    <option>Uruguay</option>
                  </select>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                  />
                </div>
              </div> */}
            </div>
          </div>

          <div className="mt-6">
            {/* <h2 className="text-base/7 font-semibold text-gray-900">
              Emergency Contact
            </h2> */}
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              {/* <div className="sm:col-span-3">
                <label
                  htmlFor="trusted-contact-name"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Name
                </label>
                <div className="mt-2">
                  <input
                    id="trusted-contact-name"
                    name="trustedContactName"
                    type="text"
                    value={formData.trustedContactName}
                    onChange={handleInputChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div> */}
              <div className="sm:col-span-3">
                <label
                  htmlFor="trusted-contact-email"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Emergency contact telegram username
                </label>
                <div className="mt-2">
                  <input
                    id="trusted-contact-email"
                    name="trustedContactEmail"
                    type="text"
                    value={formData.trustedContactEmail}
                    onChange={handleInputChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
              <div className="sm:col-span-3"></div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="username"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Beneficiary telegram username
                </label>
                <div className="mt-2">
                  <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                    <input
                      id="email_to"
                      name="emailTo"
                      type="text"
                      placeholder="john"
                      value={formData.emailTo}
                      onChange={handleInputChange}
                      className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="mt-12">
            <Field>
              <Label
                as="h3"
                passive
                className="text-base font-semibold text-gray-900"
              >
                Send a final message
              </Label>
              <div className="mt-2 sm:flex sm:items-start sm:justify-between">
                <div className="max-w-xl text-sm text-gray-500">
                  <Description>
                    Send a heartfelt final message to your friend, loved one, or
                    family member.
                  </Description>
                </div>
                <div className="mt-5 sm:ml-6 sm:mt-0 sm:flex sm:shrink-0 sm:items-center">
                  <Switch
                    checked={emailFeatureEnabled}
                    onChange={setEmailFeatureEnabled}
                    className="group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 data-[checked]:bg-indigo-600"
                  >
                    <span
                      aria-hidden="true"
                      className="inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5"
                    />
                  </Switch>
                </div>
              </div>
            </Field>
          </div> */}

          {/* {emailFeatureEnabled && (
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label
                  htmlFor="username"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Beneficiary telegram username
                </label>
                <div className="mt-2">
                  <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                    <input
                      id="email_to"
                      name="emailTo"
                      type="text"
                      placeholder="john@doe.com"
                      value={formData.emailTo}
                      onChange={handleInputChange}
                      className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                    />
                  </div>
                </div>
              </div>
              <div className="col-span-full">
                <label
                  htmlFor="about"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Message
                </label>
                <div className="mt-2">
                  <textarea
                    id="email_message"
                    name="emailMessage"
                    rows={6}
                    value={formData.emailMessage}
                    onChange={handleInputChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
                <p className="mt-3 text-sm/6 text-gray-600">
                  We'll send this message as it is.
                </p>
              </div>
            </div>
          )} */}

          {/* <div className="mt-12">
            <Field>
              <Label
                as="h3"
                passive
                className="text-base font-semibold text-gray-900"
              >
                Send cryptos
              </Label>
              <div className="mt-2 sm:flex sm:items-start sm:justify-between">
                <div className="max-w-xl text-sm text-gray-500">
                  <Description>
                    Send your cryptos to your family or a friend
                  </Description>
                </div>
                <div className="mt-5 sm:ml-6 sm:mt-0 sm:flex sm:shrink-0 sm:items-center">
                  <Switch
                    checked={cryptoFeatureEnabled}
                    onChange={setCryptoFeatureEnabled}
                    className="group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 data-[checked]:bg-indigo-600"
                  >
                    <span
                      aria-hidden="true"
                      className="inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5"
                    />
                  </Switch>
                </div>
              </div>
            </Field>
          </div> */}

          {cryptoFeatureEnabled && (
            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <Listbox value={selectedNetwork} onChange={setSelectedNetwork}>
                  <Label className="block text-sm/6 font-medium text-gray-900">
                    Network
                  </Label>
                  <div className="relative mt-2">
                    <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pl-3 pr-2 text-left text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                      <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
                        <img
                          alt=""
                          src={selectedNetwork.image}
                          className="size-5 shrink-0 rounded-full"
                        />
                        <span className="block truncate">
                          {selectedNetwork.name}
                        </span>
                      </span>
                      <ChevronUpDownIcon
                        aria-hidden="true"
                        className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                      />
                    </ListboxButton>

                    <ListboxOptions
                      transition
                      className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
                    >
                      {networks.map((network) => (
                        <ListboxOption
                          key={network.id}
                          value={network}
                          className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white data-[focus]:outline-none"
                        >
                          <div className="flex items-center">
                            <img
                              alt=""
                              src={network.image}
                              className="size-5 shrink-0 rounded-full"
                            />
                            <span className="ml-3 block truncate font-normal group-data-[selected]:font-semibold">
                              {network.name}
                            </span>
                          </div>

                          <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-[&:not([data-selected])]:hidden group-data-[focus]:text-white">
                            <CheckIcon aria-hidden="true" className="size-5" />
                          </span>
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </div>
                </Listbox>
              </div>
              <div className="sm:col-span-3">
                <Listbox
                  value={selectedToken}
                  onChange={setSelectedToken}
                >
                  <Label className="block text-sm/6 font-medium text-gray-900">
                    Token
                  </Label>
                  <div className="relative mt-2">
                    <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pl-3 pr-2 text-left text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                      <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
                        <img
                          alt=""
                          src={selectedToken.image}
                          className="size-5 shrink-0 rounded-full"
                        />
                        <span className="block truncate">
                          {selectedToken.name}
                        </span>
                      </span>
                      <ChevronUpDownIcon
                        aria-hidden="true"
                        className="col-start-1 row-start-1 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                      />
                    </ListboxButton>

                    <ListboxOptions
                      transition
                      className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
                    >
                      {tokens[selectedNetwork.chainId]?.map((token) => (
                        <ListboxOption
                          key={token.id}
                          value={token}
                          className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white data-[focus]:outline-none"
                        >
                          <div className="flex items-center">
                            <img
                              alt=""
                              src={token.image}
                              className="size-5 shrink-0 rounded-full"
                            />
                            <span className="ml-3 block truncate font-normal group-data-[selected]:font-semibold">
                              {token.name}
                            </span>
                          </div>

                          <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-[&:not([data-selected])]:hidden group-data-[focus]:text-white">
                            <CheckIcon aria-hidden="true" className="size-5" />
                          </span>
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </div>
                </Listbox>
              </div>
              {selectedToken.type === "ERC20" ? (
                <div className="sm:col-span-3">
                  <label
                    htmlFor="amount"
                    className="block text-sm/6 font-medium text-gray-900"
                  >
                    Amount
                  </label>
                  <div className="mt-2">
                    <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                      <input
                        id="amount"
                        name="amount"
                        type="text"
                        placeholder="1000"
                        value={formData.amount}
                        onChange={handleInputChange}
                        className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                      />
                    </div>
                    <p className="mt-3 text-sm/6 text-gray-600">
                      This contract can move up to {currentAllowance} {selectedToken.name} from your account
                    </p>
                  </div>
                </div>
              ) : (
                <div className="sm:col-span-3">
                  <label
                    htmlFor="tokenId"
                    className="block text-sm/6 font-medium text-gray-900"
                  >
                    Token ID
                  </label>
                  <div className="mt-2">
                    <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                      <input
                        id="tokenId"
                        name="tokenId"
                        type="text"
                        placeholder="1"
                        value={formData.tokenId}
                        onChange={handleInputChange}
                        className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                      />
                    </div>
                  </div>
                </div>
              )}
              <div className="sm:col-span-3">
                <label
                  htmlFor="recipient_address"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  To Address
                </label>
                <div className="mt-2">
                  <div className="flex items-center rounded-md bg-white pl-3 outline outline-1 -outline-offset-1 outline-gray-300 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-indigo-600">
                    <input
                      id="recipient_address"
                      name="recipientAddress"
                      type="text"
                      placeholder="0x00000000000000"
                      value={formData.recipientAddress}
                      onChange={handleInputChange}
                      className="block min-w-0 grow py-1.5 pl-1 pr-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline focus:outline-0 sm:text-sm/6"
                    />
                  </div>
                </div>
              </div>
              {cryptoFeatureEnabled && 
                selectedToken.type === "ERC20" && 
                !!formData.amount && 
                !hasAllowance && (
                <div className="sm:col-span-6">
                  <button
                    type="button"
                    onClick={handleApprove}
                    className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Entrusts {formData.amount} {selectedToken.name} to Aevia
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-24 mb-12 flex items-center justify-end gap-x-6">
            <button
              type="button"
              className="text-sm/6 font-semibold text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={cryptoFeatureEnabled && !hasAllowance}
              className={`rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                cryptoFeatureEnabled && !hasAllowance
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {cryptoFeatureEnabled ? "Confirm and Sign" : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
