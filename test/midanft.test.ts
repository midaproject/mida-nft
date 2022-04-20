import { expect } from "chai";

import { getTestResources, TestResources } from "./utils";

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
        `AccessControl: account ${anonAddress} is missing role ${setterRole}`
      );
    });

    it("reject if pauser role", async () => {
      const { midanft, pauser, pauserAddress, setterRole } = testResources;
      const tx = midanft.connect(pauser).setBaseURI("ipfs://abc");
      await expect(tx).revertedWith(
        `AccessControl: account ${pauserAddress} is missing role ${setterRole}`
      );
    });

    it("reject if minter role", async () => {
      const { midanft, minter, minterAddress, setterRole } = testResources;
      const tx = midanft.connect(minter).setBaseURI("ipfs://abc");
      await expect(tx).revertedWith(
        `AccessControl: account ${minterAddress} is missing role ${setterRole}`
      );
    });

    it("should set a new base uri when called by setter", async () => {
      const { midanft, setter } = testResources;
      const tx = midanft.connect(setter).setBaseURI("ipfs://abc");
      await expect(tx).emit(midanft, "NewBaseURI").withArgs("", "ipfs://abc");
    });
  });
});
