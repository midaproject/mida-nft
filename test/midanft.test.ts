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
    it("reject if not allowed", async () => {
      const { midanft, anon, anonAddress, uriSetterRole } = testResources;
      const tx = midanft.connect(anon).setBaseURI("ipfs://abc");
      await expect(tx).revertedWith(
        `AccessControl: account ${anonAddress.toLowerCase()} is missing role ${uriSetterRole}`
      );
    });

    it("should set a new base uri when called by setter", async () => {
      const { midanft, uriSetter } = testResources;
      const tx = midanft.connect(uriSetter).setBaseURI("ipfs://abc");
      await expect(tx).emit(midanft, "BaseURIChanged").withArgs("", "ipfs://abc");
    });
  });

  describe("setTokenURI", () => {
    it("reject if not allowed", async () => {
      const { midanft, anon, anonAddress, uriSetterRole } = testResources;
      const tx = midanft.connect(anon).setTokenURI(0, "token-uri");
      await expect(tx).revertedWith(
        `AccessControl: account ${anonAddress.toLowerCase()} is missing role ${uriSetterRole}`
      );
    });

    it("should set the token uri", async () => {
      const { midanft, anon, minter, uriSetter } = testResources;
      await midanft.connect(minter).safeMint();
      await midanft.connect(uriSetter).setTokenURI(0, "token-uri");
      const tokenURI = await midanft.connect(anon).tokenURI(0);
      expect(tokenURI).eq("token-uri");
    });

    it("should concatenate base uri with token uri", async () => {
      const { midanft, anon, minter, uriSetter } = testResources;
      await midanft.connect(minter).safeMint();
      await midanft.connect(uriSetter).setBaseURI("https://midanft.com/metadata/");
      await midanft.connect(uriSetter).setTokenURI(0, "token-uri");
      const tokenURI = await midanft.connect(anon).tokenURI(0);
      expect(tokenURI).eq("https://midanft.com/metadata/token-uri");
    });
  });

  describe("setDefaultRoyalty", () => {
    it("reject if not allowed", async () => {
      const { midanft, anon, anonAddress, royaltySetterRole } = testResources;
      const tx = midanft.connect(anon).setDefaultRoyalty(anonAddress, 300);
      await expect(tx).revertedWith(
        `AccessControl: account ${anonAddress.toLowerCase()} is missing role ${royaltySetterRole}`
      );
    });

    it("should set the default royalty", async () => {
      const { midanft, royaltySetter, anonAddress } = testResources;
      await midanft.connect(royaltySetter).setDefaultRoyalty(anonAddress, 300);
      const royaltyInfo = await midanft.royaltyInfo(1, 30000);
      expect(royaltyInfo[0]).eq(anonAddress);
      expect(royaltyInfo[1]).eq(900);
    });
  });

  describe("setTokenRoyalty", () => {
    it("reject if not allowed", async () => {
      const { midanft, anon, anonAddress, royaltySetterRole } = testResources;
      const tx = midanft.connect(anon).setTokenRoyalty(1, anonAddress, 200);
      await expect(tx).revertedWith(
        `AccessControl: account ${anonAddress.toLowerCase()} is missing role ${royaltySetterRole}`
      );
    });

    it("should set the token royalty", async () => {
      const { midanft, royaltySetter, anonAddress } = testResources;
      await midanft.connect(royaltySetter).setDefaultRoyalty(anonAddress, 200);
      await midanft.connect(royaltySetter).setTokenRoyalty(2, anonAddress, 300);

      const royaltyInfo1 = await midanft.royaltyInfo(1, 30000);
      const royaltyInfo2 = await midanft.royaltyInfo(2, 30000);

      expect(royaltyInfo1[0]).eq(anonAddress);
      expect(royaltyInfo1[1]).eq(600);
      expect(royaltyInfo2[0]).eq(anonAddress);
      expect(royaltyInfo2[1]).eq(900);
    });
  });

  describe("safeMint", () => {
    it("reject if not allowed", async () => {
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

  describe("safeMintBatch", () => {
    it("reject if not allowed", async () => {
      const { midanft, anon, anonAddress, minterRole } = testResources;
      const tx = midanft.connect(anon).safeMintBatch(5);
      await expect(tx).revertedWith(
        `AccessControl: account ${anonAddress.toLowerCase()} is missing role ${minterRole}`
      );
    });

    it("reject mint if out of bounds", async () => {
      const { midanft, minter } = testResources;
      const tx = midanft.connect(minter).safeMintBatch(0);
      await expect(tx).revertedWith(`Quantity must be > 0`);
    });

    it("should mint", async () => {
      const { midanft, minter, minterAddress } = testResources;
      const beforeBalance = await midanft.balanceOf(minterAddress);

      const tx = midanft.connect(minter).safeMintBatch(5);
      await expect(tx).emit(midanft, "Transfer").withArgs(AddressZero, minterAddress, 4);

      const afterBalance = await midanft.balanceOf(minterAddress);
      expect(afterBalance).eq(beforeBalance.add(5));
    });
  });
});
