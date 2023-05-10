import { expect } from "chai";
import { ethers } from "hardhat";

import { Contract, ContractFactory, SignerWithAddress } from "../Types/Fundraiser.types";

describe("Fundraiser Test", () => {
  let FundraiserToken: ContractFactory,
    fundraiserTokenContract: Contract,
    owner: SignerWithAddress,
    addr1: SignerWithAddress,
    addr2: SignerWithAddress,
    addr3: SignerWithAddress;

  before(async (): Promise<void> => {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    FundraiserToken = await ethers.getContractFactory("Fundraiser");
    fundraiserTokenContract = await FundraiserToken.deploy();
  });

  /**
   * Test for starting a fundraiser
      * There should be no fundraiser initially
      * After calling the function a fundraiser is created
        * Compairing the vaules of created and fundraiser with entered values
   */
  describe("Test for starting a fundraiser", (): void => {
    let _fundRaiserBefore: any, _fundRaiserAfter: any;

    before(async (): Promise<void> => {
      // _fundRaiserBefore = await fundraiserTokenContract.fundRaisers(0);

      await fundraiserTokenContract
        .connect(addr1)
        .startFundRaiser(addr1.address, 10000000, 2, "Need money for higher studies", 0);

      _fundRaiserAfter = await fundraiserTokenContract.fundRaisers(0);
      // console.log("_fundRaiserBefore", _fundRaiserBefore);
    });

    // it("There should be no active fundraiser", () => {
    //   expect(_fundRaiserBefore.contributors).to.have.lengthOf(0);
    // });

    it("A new fundraiser is created", (): void => {
      console.log("_fundRaiserAfter", _fundRaiserAfter.createdOn, Date.now());

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
});
