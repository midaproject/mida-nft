import { ethers } from "hardhat";
import { Signer } from "ethers";

import { MIDANFT } from "../typechain";

export interface TestResources {
  pauser: Signer;
  pauserAddress: string;
  minter: Signer;
  minterAddress: string;
  uriSetter: Signer;
  uriSetterAddress: string;
  royaltySetter: Signer;
  royaltySetterAddress: string;
  anon: Signer;
  anonAddress: string;
  midanft: MIDANFT;
  pauserRole: string;
  minterRole: string;
  uriSetterRole: string;
  royaltySetterRole: string;
}

export async function getTestResources(): Promise<TestResources> {
  const signers = await ethers.getSigners();
  const pauser = signers[1];
  const pauserAddress = await pauser.getAddress();
  const minter = signers[2];
  const minterAddress = await minter.getAddress();
  const uriSetter = signers[3];
  const uriSetterAddress = await uriSetter.getAddress();
  const royaltySetter = signers[4];
  const royaltySetterAddress = await royaltySetter.getAddress();
  const anon = signers[5];
  const anonAddress = await anon.getAddress();

  const MIDANFT = await ethers.getContractFactory("MIDANFT");
  const midanft = await MIDANFT.deploy();
  await midanft.deployed();

  const pauserRole = await midanft.PAUSER_ROLE();
  const minterRole = await midanft.MINTER_ROLE();
  const uriSetterRole = await midanft.URI_SETTER_ROLE();
  const royaltySetterRole = await midanft.ROYALTY_SETTER_ROLE();
  await midanft.grantRole(pauserRole, pauserAddress);
  await midanft.grantRole(minterRole, minterAddress);
  await midanft.grantRole(uriSetterRole, uriSetterAddress);
  await midanft.grantRole(royaltySetterRole, royaltySetterAddress);

  return {
    pauser,
    pauserAddress,
    minter,
    minterAddress,
    uriSetter,
    uriSetterAddress,
    royaltySetter,
    royaltySetterAddress,
    anon,
    anonAddress,
    midanft,
    pauserRole,
    minterRole,
    uriSetterRole,
    royaltySetterRole,
  };
}
