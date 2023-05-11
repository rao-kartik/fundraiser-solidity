import { expect } from "chai";
import { ethers } from "hardhat";

import { Contract, ContractFactory, SignerWithAddress } from "../Types/Fundraiser.types";

describe("Fundraiser Test", () => {
  let FundraiserFactory: ContractFactory,
    fundraiserContract: Contract,
    owner: SignerWithAddress,
    addr1: SignerWithAddress,
    addr2: SignerWithAddress,
    addr3: SignerWithAddress;

  before(async (): Promise<void> => {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    FundraiserFactory = await ethers.getContractFactory("Fundraiser");
    fundraiserContract = await FundraiserFactory.deploy();
  });

  /**
   * Test for starting a fundraiser
   * There should be no fundraiser initially
   * After calling the function a fundraiser is created
   * Compairing the vaules of created and fundraiser with entered values
   */
  describe("Test for starting a fundraiser", (): void => {
    it("There should be no active fundraiser", async () => {
      const _fundRaiserBefore: any = await fundraiserContract.fundRaisers(0);

      expect(_fundRaiserBefore).to.be.revertedWithPanic("");
    });

    it("A new fundraiser is created", async (): Promise<void> => {
      await fundraiserContract
        .connect(addr1)
        .startFundRaiser(addr1.address, 10000000, 2, "Need money for higher studies", 0);

      const _fundRaiserAfter: any = await fundraiserContract.fundRaisers(0);

      expect(_fundRaiserAfter.raisedBy).to.equal(addr1.address);
      expect(_fundRaiserAfter.raisedFor).to.equal(addr1.address);
      expect(_fundRaiserAfter.amount).to.equal(10000000);
      expect(_fundRaiserAfter.neededBefore).to.equal(2);
      expect(_fundRaiserAfter.about).to.equal("Need money for higher studies");
      expect(_fundRaiserAfter.isActive).to.equal(true);
      expect(_fundRaiserAfter.amountRaised).to.equal(0);
      expect(_fundRaiserAfter.category).to.equal(0);
      expect(_fundRaiserAfter.totalSupporters).to.equal(0);
      expect(_fundRaiserAfter.amountTransferred).to.equal(false);
    });
  });

  describe("Test for donating funds to a fudraiser", async (): Promise<void> => {
    let _fundraiserDetails: any;

    before(async (): Promise<void> => {
      await fundraiserContract
        .connect(addr1)
        .startFundRaiser(addr1.address, 10000000, 2, "Need money for higher studies", 0);

      _fundraiserDetails = await fundraiserContract.fundRaisers(0);
    });

    it("Is a valid fundraiser", async (): Promise<void> => {
      const donation = ethers.utils.parseEther("10000");

      await fundraiserContract.connect(addr2).donateFunds(1);
      const _updatedFundraiserDetails = await fundraiserContract.fundRaisers(1, donation);

      console.log(_updatedFundraiserDetails);
    });
  });
});
