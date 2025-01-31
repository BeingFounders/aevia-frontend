'use client'

import { useState, FormEvent } from 'react'
import { Description, Field, Label, Switch } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/16/solid'

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/16/solid'
import { CheckIcon } from '@heroicons/react/20/solid'

export default function Example() {
  const [emailFeatureEnabled, setEmailFeatureEnabled] = useState(false)
  const [cryptoFeatureEnabled, setCryptoFeatureEnabled] = useState(false)
  
  const currencies = [
    {
      id: 1,
      name: 'USDT',
      image:
        'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
      address: "0xdac17f958d2ee523a2206206994597c13d831ec7"
    },
    {
      id: 2,
      name: 'USDC',
      image:
        'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
      address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
    },
  ];

  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0])

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: 'United States',
    trustedContactName: '',
    trustedContactEmail: '',
    emailTo: '',
    emailMessage: '',
    recipientAddress: '',
    amount: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        country: formData.country,
        trustedContactName: formData.trustedContactName,
        trustedContactEmail: formData.trustedContactEmail,
        emailTo: emailFeatureEnabled ? formData.emailTo : null,
        emailMessage: emailFeatureEnabled ? formData.emailMessage : null,
        cryptoWalletTo: cryptoFeatureEnabled ? formData.recipientAddress : null,
        cryptoTokenAddress: cryptoFeatureEnabled ? selectedCurrency.address : null,
        cryptoAmount: cryptoFeatureEnabled ? formData.amount : null
      };

      const response = await fetch('https://my-last-wish-api-df78085c0eca.herokuapp.com/wishes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to save wish');
      }

      const data = await response.json();
      console.log('Wish saved successfully:', data);
      // Aquí puedes agregar alguna notificación de éxito o redirección
      
    } catch (error) {
      console.error('Error saving wish:', error);
      // Aquí puedes agregar alguna notificación de error
    }
  };

  return (
    <div className="mt-6 flex justify-center items-start h-screen mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className="mt-12">
            <h2 className="text-base/7 font-semibold text-gray-900">Personal Information</h2>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="first-name" className="block text-sm/6 font-medium text-gray-900">
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
                <label htmlFor="last-name" className="block text-sm/6 font-medium text-gray-900">
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
                <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
                  Life Verification Contact (your email)
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
                <p className="mt-3 text-sm/6 text-gray-600">We'll use this email to contact you and verify you are still alive.</p>
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="country" className="block text-sm/6 font-medium text-gray-900">
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
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-base/7 font-semibold text-gray-900">Emergency Contact</h2>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="trusted-contact-name" className="block text-sm/6 font-medium text-gray-900">
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
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="trusted-contact-email" className="block text-sm/6 font-medium text-gray-900">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="trusted-contact-email"
                    name="trustedContactEmail"
                    type="email"
                    value={formData.trustedContactEmail}
                    onChange={handleInputChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
                <p className="mt-3 text-sm/6 text-gray-600">We'll use this email to contact you and verify you are still alive.</p>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <Field>
              <Label as="h3" passive className="text-base font-semibold text-gray-900">
                Send a final message
              </Label>
              <div className="mt-2 sm:flex sm:items-start sm:justify-between">
                <div className="max-w-xl text-sm text-gray-500">
                  <Description>
                    Send a heartfelt final message to your friend, loved one, or family member.
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
          </div>
          
          { emailFeatureEnabled && ( 
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900">
                  Email to
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
                <label htmlFor="about" className="block text-sm/6 font-medium text-gray-900">
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
                <p className="mt-3 text-sm/6 text-gray-600">We'll send this message as it is.</p>
              </div>
            </div>
          )}

          <div className="mt-12">
            <Field>
              <Label as="h3" passive className="text-base font-semibold text-gray-900">
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
          </div>

          { cryptoFeatureEnabled && (
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900">
                Recipient Address
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
              <div className="sm:col-span-3">
                <Listbox value={selectedCurrency} onChange={setSelectedCurrency}>
                  <Label className="block text-sm/6 font-medium text-gray-900">Token</Label>
                  <div className="relative mt-2">
                    <ListboxButton className="grid w-full cursor-default grid-cols-1 rounded-md bg-white py-1.5 pl-3 pr-2 text-left text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6">
                      <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
                        <img alt="" src={selectedCurrency.image} className="size-5 shrink-0 rounded-full" />
                        <span className="block truncate">{selectedCurrency.name}</span>
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
                      {currencies.map((currency) => (
                        <ListboxOption
                          key={currency.id}
                          value={currency}
                          className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white data-[focus]:outline-none"
                        >
                          <div className="flex items-center">
                            <img alt="" src={currency.image} className="size-5 shrink-0 rounded-full" />
                            <span className="ml-3 block truncate font-normal group-data-[selected]:font-semibold">
                              {currency.name}
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
                <label htmlFor="username" className="block text-sm/6 font-medium text-gray-900">
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
                </div>
              </div>
            </div>        
          )}

          <div className="mt-24 mb-12 flex items-center justify-end gap-x-6">
            <button type="button" className="text-sm/6 font-semibold text-gray-900">
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Confirm
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
