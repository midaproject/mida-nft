import { expect } from "chai";
import { constants } from "ethers";

import { getTestResources, TestResources } from "./utils";

const { AddressZero } = constants;

describe("MIDANFT", () => {
  let testResources: TestResources;

  beforeEach(async () => {
    testResources = await getTestResources();
  });

  describe("setBaseURI", () => {
    it("reject if NO role", async () => {
      const { midanft, anon, anonAddress, setterRole } = testResources;
      const tx = midanft.connect(anon).setBaseURI("ipfs://abc");
      await expect(tx).revertedWith(
        `AccessControl: account ${anonAddress.toLowerCase()} is missing role ${setterRole}`
      );
    });

    it("reject if pauser role", async () => {
      const { midanft, pauser, pauserAddress, setterRole } = testResources;
      const tx = midanft.connect(pauser).setBaseURI("ipfs://abc");
      await expect(tx).revertedWith(
        `AccessControl: account ${pauserAddress.toLowerCase()} is missing role ${setterRole}`
      );
    });

    it("reject if minter role", async () => {
      const { midanft, minter, minterAddress, setterRole } = testResources;
      const tx = midanft.connect(minter).setBaseURI("ipfs://abc");
      await expect(tx).revertedWith(
        `AccessControl: account ${minterAddress.toLowerCase()} is missing role ${setterRole}`
      );
    });

    it("should set a new base uri when called by setter", async () => {
      const { midanft, setter } = testResources;
      const tx = midanft.connect(setter).setBaseURI("ipfs://abc");
      await expect(tx).emit(midanft, "NewBaseURI").withArgs("", "ipfs://abc");
    });
  });

  describe("safeMint", () => {
    it("reject mint if not minter", async () => {
      const { midanft, anon, anonAddress, minterRole } = testResources;
      const tx = midanft.connect(anon).safeMint();
      await expect(tx).revertedWith(
        `AccessControl: account ${anonAddress.toLowerCase()} is missing role ${minterRole}`
      );
    });

    it("should mint", async () => {
      const { midanft, minter, minterAddress } = testResources;
      const beforeBalance = await midanft.balanceOf(minterAddress);

      const tx = midanft.connect(minter).safeMint();
      await expect(tx).emit(midanft, "Transfer").withArgs(AddressZero, minterAddress, 0);

      const afterBalance = await midanft.balanceOf(minterAddress);
      expect(afterBalance).eq(beforeBalance.add(1));
    });
  });
});
