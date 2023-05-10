import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Contract, Signer, providers, utils } from "ethers";

type Provider = providers.Provider;
type TransactionRequest = providers.TransactionRequest;
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

export type {
  ContractFactory,
  SignerWithAddress,
  Contract,
  Signer,
  Provider,
  TransactionRequest,
  Interface,
};
