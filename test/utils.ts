import { ethers } from "hardhat";
import { Signer } from "ethers";

import { MIDANFT } from "../typechain";

export interface TestResources {
  pauser: Signer;
  pauserAddress: string;
  minter: Signer;
  minterAddress: string;
  setter: Signer;
  setterAddress: string;
  anon: Signer;
  anonAddress: string;
  midanft: MIDANFT;
  pauserRole: string;
  minterRole: string;
  setterRole: string;
}

export async function getTestResources(): Promise<TestResources> {
  const signers = await ethers.getSigners();
  const pauser = signers[1];
  const pauserAddress = await pauser.getAddress();
  const minter = signers[2];
  const minterAddress = await minter.getAddress();
  const setter = signers[3];
  const setterAddress = await setter.getAddress();
  const anon = signers[4];
  const anonAddress = await anon.getAddress();

  const MIDANFT = await ethers.getContractFactory("MIDANFT");
  const midanft = await MIDANFT.deploy();
  await midanft.deployed();

  const pauserRole = await midanft.PAUSER_ROLE();
  const minterRole = await midanft.MINTER_ROLE();
  const setterRole = await midanft.SETTER_ROLE();
  await midanft.grantRole(pauserRole, pauserAddress);
  await midanft.grantRole(minterRole, minterAddress);
  await midanft.grantRole(setterRole, setterAddress);

  return {
    pauser,
    pauserAddress,
    minter,
    minterAddress,
    setter,
    setterAddress,
    anon,
    anonAddress,
    midanft,
    pauserRole,
    minterRole,
    setterRole,
  };
}
