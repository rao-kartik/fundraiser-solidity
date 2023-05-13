import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Contract, Signer, providers, utils, BigNumber } from "ethers";

type Provider = providers.Provider;
type TransactionRequest = providers.TransactionRequest;
type TransactionReceipt = providers.TransactionReceipt;
type Interface = utils.Interface;

interface ContractFactory {
  attach(address: string): Contract;
  deploy(...args: any[]): Promise<Contract>;
  getDeployTransaction(...args: any[]): TransactionRequest;
  interface: Interface;
  bytecode: string;
  signer: Signer;
  connect(signerOrProvider: Signer | Provider): ContractFactory;
}

interface fundraiserStruct {
  raisedBy: SignerWithAddress;
  raisedFor: SignerWithAddress;
  about: String;
  category: BigNumber;
  amount: BigNumber;
  amountRaised: BigNumber;
  neededBefore: BigNumber;
  totalSupportors: BigNumber;
  createdOn: BigNumber;
  amountReturned: Boolean;
  isActive: Boolean;
  amountClaimed: BigNumber;
}

export type {
  ContractFactory,
  SignerWithAddress,
  Contract,
  Signer,
  Provider,
  TransactionRequest,
  Interface,
  BigNumber,
  fundraiserStruct,
  TransactionReceipt,
};
