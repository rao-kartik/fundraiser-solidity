import { expect } from "chai";
import { ethers } from "hardhat";

import {
  BigNumber,
  Contract,
  ContractFactory,
  SignerWithAddress,
  fundraiserStruct,
} from "../Types/Fundraiser.types";

const gasLimit = 300000;
const amountToBeRaised = 10000000;
const aboutFundraiser = "Need money for higher studies";

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
   * Thw raised for address passed should not be a contract address
   * After calling the function a fundraiser is created
   * Compairing the vaules of created and fundraiser with entered values
   * Emit event for successsful start of fundraiser
   */
  describe("Test for starting a fundraiser", (): void => {
    it("There should be no active fundraiser", async () => {
      const _fundRaiserBefore: fundraiserStruct = fundraiserContract.fundRaisers(0);

      await expect(_fundRaiserBefore).to.be.revertedWithoutReason();
    });

    it("The raised for address should not be a contract address", async (): Promise<void> => {
      const tx: Promise<void> = fundraiserContract
        .connect(addr1)
        .startFundRaiser(fundraiserContract.address, amountToBeRaised, 2, aboutFundraiser, 0, {
          gasLimit,
        });

      await expect(tx).to.be.revertedWith("You can't raise for a contract");
    });

    it("A new fundraiser is created", async (): Promise<void> => {
      const tx = await fundraiserContract
        .connect(addr3)
        .startFundRaiser(addr3.address, amountToBeRaised, 2, aboutFundraiser, 0);

      const _fundRaiserAfter: fundraiserStruct = await fundraiserContract.fundRaisers(0);

      const blockTimestamp = (await ethers.provider.getBlock(tx.blockNumber)).timestamp;

      expect(_fundRaiserAfter.raisedBy).to.equal(addr3.address);
      expect(_fundRaiserAfter.raisedFor).to.equal(addr3.address);
      expect(_fundRaiserAfter.amount).to.equal(amountToBeRaised);
      expect(_fundRaiserAfter.neededBefore).to.equal(2);
      expect(_fundRaiserAfter.about).to.equal(aboutFundraiser);
      expect(_fundRaiserAfter.isActive).to.equal(true);
      expect(_fundRaiserAfter.amountRaised).to.equal(0);
      expect(_fundRaiserAfter.category).to.equal(0);
      expect(_fundRaiserAfter.totalSupportors).to.equal(0);
      expect(_fundRaiserAfter.amountClaimed).to.equal(0);
      expect(_fundRaiserAfter.createdOn).to.equal(blockTimestamp);
      expect(_fundRaiserAfter.amountReturned).to.equal(false);
    });

    it("Should emit an event for successful start fo fundraiser", async (): Promise<void> => {
      const tx = fundraiserContract
        .connect(addr1)
        .startFundRaiser(addr3.address, amountToBeRaised, 2, aboutFundraiser, 0);

      await expect(tx)
        .to.emit(fundraiserContract, "FundraiserStarted")
        .withArgs(addr1.address, addr3.address, amountToBeRaised, 2, aboutFundraiser, 0);
    });
  });

  /**
   * Test for managing the active status of the fundraiser
   * The fundraiser should be active initially
   * The status should change to false when passed false and true when passed true
   * Emit event for change of activation status
   */
  describe("Test for managing the active status of the fundraiser", async (): Promise<void> => {
    it("Status should be active once the fundraiser is created", async (): Promise<void> => {
      const _fundRaiserDetails: fundraiserStruct = await fundraiserContract.fundRaisers(0);

      expect(_fundRaiserDetails.isActive).to.equal(true);
    });

    it("Change active status of fundraiser should fail if anyone other than the owner or the onw for whom the fundraiser is started tries to change the status", async (): Promise<void> => {
      const tx: Promise<void> = fundraiserContract.manageActiveStatusOfFundraiser(0, false, {
        gasLimit,
      });

      await expect(tx).to.be.revertedWith("You don't have sufficient permissions");
    });

    it("The fundraiser should be marked as inactive", async (): Promise<void> => {
      await fundraiserContract.connect(addr3).manageActiveStatusOfFundraiser(0, false, {
        gasLimit,
      });

      const _fundRaiserDetails: fundraiserStruct = await fundraiserContract.fundRaisers(0);

      expect(_fundRaiserDetails.isActive).to.equal(false);
    });

    it("The fundraiser should be marked as active", async (): Promise<void> => {
      await fundraiserContract.connect(addr3).manageActiveStatusOfFundraiser(0, true, {
        gasLimit,
      });

      const _fundRaiserDetails: fundraiserStruct = await fundraiserContract.fundRaisers(0);

      expect(_fundRaiserDetails.isActive).to.equal(true);
    });

    it("Should emit event on successful change of status", async (): Promise<void> => {
      const tx = fundraiserContract.connect(addr3).manageActiveStatusOfFundraiser(1, false, {
        gasLimit,
      });

      await expect(tx).to.emit(fundraiserContract, "ActivationStautsChanged").withArgs(1, false);
    });
  });

  /**
   * Test for donating funds to fundraiser
   * The fundraiser should be valid
   * The fundraiser should not be blacklisted
   * The fundraiser should be active
   * Donation should be less than or equal to what is desired & the remaining amount that is left to be raised
   * After the donation is successful check if the required fields are updated or not
   * After the funds are donated and the needed amount is raised, the fundraiser should be marked as inactive
   * Emit event for successsful donation
   */
  describe("Test for donating funds to a fudraiser", (): void => {
    it("The donation should fail if the fundraiser Id doesn't exist", async (): Promise<void> => {
      const donation: BigNumber = ethers.utils.parseEther("1");

      const tx: Promise<void> = fundraiserContract
        .connect(addr2)
        .donateFunds(2, { value: donation, gasLimit });

      await expect(tx).to.be.revertedWith("Oops! This fundraiser does not exist");
    });

    it("The donation should fail if the fundraiser is blacklisted", async (): Promise<void> => {
      await fundraiserContract.blacklistFundraiser(0, true);

      const _blacklistStatus: boolean = await fundraiserContract.blacklistedFundraisers(0);

      expect(_blacklistStatus).to.equal(true);

      const donation: BigNumber = ethers.utils.parseEther("1");
      const tx: Promise<void> = fundraiserContract
        .connect(addr2)
        .donateFunds(0, { value: donation, gasLimit });

      await expect(tx).to.be.revertedWith(
        "Sorry! This fundraiser has been blacklisted. It can no longer raise funds"
      );

      await fundraiserContract.blacklistFundraiser(0, false);
    });

    it("The donation should fail if the fundraiser is inactive", async (): Promise<void> => {
      await fundraiserContract
        .connect(addr3)
        .manageActiveStatusOfFundraiser(0, false, { gasLimit });

      const donation: BigNumber = ethers.utils.parseEther("1");
      const tx: Promise<void> = fundraiserContract
        .connect(addr2)
        .donateFunds(0, { value: donation, gasLimit });

      await expect(tx).to.be.revertedWith(
        "Either the fundraiser is no longer accepting donations or He has raised the needed amount"
      );

      await fundraiserContract.connect(addr3).manageActiveStatusOfFundraiser(0, true, { gasLimit });
    });

    it("The donation should fail if donation is more than the needed amount", async (): Promise<void> => {
      const donation: BigNumber = ethers.utils.parseEther("1");

      const tx: Promise<void> = fundraiserContract
        .connect(addr2)
        .donateFunds(0, { value: donation, gasLimit });

      await expect(tx).to.be.revertedWith(
        "Thank You for your help but we can't accept funds as the fundraiser doesn't need that much funds."
      );
    });

    // it("The donation should fail if the funds are donated once the time period to raise funds has passed", async (): Promise<void> => {
    //   await fundraiserContract.startFundRaiser(
    //     owner.address,
    //     amountToBeRaised,
    //     1,
    //     aboutFundraiser,
    //     0
    //   );

    //   const donation: BigNumber = ethers.utils.parseEther("0.00000000000001");

    //   const tx: Promise<void> = fundraiserContract
    //     .connect(addr2)
    //     .donateFunds(2, { value: donation, gasLimit });

    //   await expect(tx).to.be.revertedWith("Sorry! The timeperiod to raise funds has passed");
    // });

    it("Donation successful", async (): Promise<void> => {
      const donation: BigNumber = ethers.utils.parseEther("0.0000000000001");

      await fundraiserContract.connect(addr2).donateFunds(0, { value: donation, gasLimit });

      const _fundRaiserDetails = await fundraiserContract.fundRaisers(0);

      expect(_fundRaiserDetails.amountRaised).to.equal(donation);
      expect(_fundRaiserDetails.totalSupportors).to.equal(1);

      const _donorDetails = await fundraiserContract.donors(0, addr2.address);

      expect(_donorDetails.amount).to.equal(donation);

      const _donorsAddress = await fundraiserContract.donorsAddressList(
        0,
        _fundRaiserDetails.totalSupportors - 1
      );

      expect(_donorsAddress).to.equal(addr2.address);
    });

    it("Mark fundraiser as inactive once the needed amount is raised", async (): Promise<void> => {
      const donation: BigNumber = ethers.utils.parseEther("0.0000000000099");
      await fundraiserContract.connect(addr2).donateFunds(0, { value: donation, gasLimit });

      const _fundRaiserDetails = await fundraiserContract.fundRaisers(0);

      expect(_fundRaiserDetails.amountRaised).to.equal(`${amountToBeRaised}`);
      expect(_fundRaiserDetails.totalSupportors).to.equal(1);
      expect(_fundRaiserDetails.isActive).to.equal(false);
    });

    it("Should emit event on successsful donation", async (): Promise<void> => {
      const donation: BigNumber = ethers.utils.parseEther("0.0000000000001");

      const fundraiserDetails = await fundraiserContract.fundRaisers(1);

      if (!fundraiserDetails.isActive) {
        await fundraiserContract.connect(addr3).manageActiveStatusOfFundraiser(1, true, {
          gasLimit,
        });
      }

      const tx = fundraiserContract.donateFunds(1, { value: donation, gasLimit });

      await expect(tx)
        .to.emit(fundraiserContract, "DonationSuccessful")
        .withArgs(owner.address, 1, donation);
    });
  });

  /**
   * Test for updating the fundraiser details
   * The fundraiser id should be valid
   * Only the owner of fundraiser or for whom the fundrasier is initiated can update the details
   * Only if the new amount >= raisedAmount, the fundraiser is updated
   * After the fundraiser is updated, mathcing the values with updated values
   * Emit event for successsful update
   */
  describe("Test for updating the fundraiser", (): void => {
    it("Update should fail if the fundraiser Id doesn't exist", async (): Promise<void> => {
      const tx: Promise<void> = fundraiserContract
        .connect(addr3)
        .updateFundraiserDetails(9, amountToBeRaised + 10000, aboutFundraiser, 0, 2, {
          gasLimit,
        });

      await expect(tx).to.be.revertedWith("Oops! This fundraiser does not exist");
    });

    it("Update should fail if the update is not initiated by the owner of the fundraiser or for whom the fundraiser is beign raised", async (): Promise<void> => {
      const tx: Promise<void> = fundraiserContract.updateFundraiserDetails(
        0,
        amountToBeRaised + 10000,
        aboutFundraiser,
        0,
        2,
        {
          gasLimit,
        }
      );

      await expect(tx).to.be.revertedWith("You don't have sufficient permissions");
    });

    it("Update should fail if the new amount is less than amount already raised", async (): Promise<void> => {
      const tx: Promise<void> = fundraiserContract
        .connect(addr3)
        .updateFundraiserDetails(0, amountToBeRaised - 50000, aboutFundraiser, 0, 2, {
          gasLimit,
        });

      await expect(tx).to.be.revertedWith(
        "The new raised amount is less than the current amount raised"
      );
    });

    it("Update successsfull", async (): Promise<void> => {
      await fundraiserContract
        .connect(addr3)
        .updateFundraiserDetails(0, amountToBeRaised + 110000, "For Education", 2, 4, {
          gasLimit,
        });

      const _fundRaiserDetails = await fundraiserContract.fundRaisers(0);

      expect(_fundRaiserDetails.amount).to.equal(amountToBeRaised + 110000);
      expect(_fundRaiserDetails.neededBefore).to.equal(4);
      expect(_fundRaiserDetails.category).to.equal(2);
      expect(_fundRaiserDetails.about).to.equal("For Education");
    });

    it("Should emit event on successful update of fundraiser", async (): Promise<void> => {
      const tx: Promise<void> = fundraiserContract
        .connect(addr3)
        .updateFundraiserDetails(1, amountToBeRaised + 10000, aboutFundraiser, 1, 3, {
          gasLimit,
        });

      await expect(tx)
        .to.emit(fundraiserContract, "UpdateSuccessful")
        .withArgs(1, amountToBeRaised + 10000, aboutFundraiser, 1, 3);
    });
  });

  /**
   * Test for claiming of donations
   * Checking if its a valid fundraiser id
   * Checking if the claim is registered by the the owner of the fundraiser or for whom the fundraiser is initiated
   * Checking if the fundraiser has sufficient funds raised
   * claim successful
   * Emit event for successsful claim
   */
  describe("Test for claiming funds by the receiver", async (): Promise<void> => {
    it("Claim should fail if the fundraiser Id doesn't exist", async (): Promise<void> => {
      const tx: Promise<void> = fundraiserContract.claimDonations(22, 5000, {
        gasLimit,
      });

      await expect(tx).to.be.revertedWith("Oops! This fundraiser does not exist");
    });

    it("Claim should fail if the transaction is not initiated by the owner of the fundraiser or for whom the fundraiser is beign raised", async (): Promise<void> => {
      const tx: Promise<void> = fundraiserContract.claimDonations(0, 5000, {
        gasLimit,
      });

      await expect(tx).to.be.revertedWith("You don't have sufficient permissions");
    });

    it("Claim should fail if the fundraiser doesn't have sufficient balance", async (): Promise<void> => {
      const tx: Promise<void> = fundraiserContract.connect(addr3).claimDonations(0, 50000000, {
        gasLimit,
      });

      await expect(tx).to.be.revertedWith("Sorry! Insufficient balance");
    });

    it("Claim successful", async (): Promise<void> => {
      const _claim = 5000000;

      await fundraiserContract.connect(addr3).claimDonations(0, _claim, {
        gasLimit,
      });

      const _fundRaiserDetails = await fundraiserContract.fundRaisers(0);

      expect(_fundRaiserDetails.amountClaimed).to.be.equal(_claim);
    });

    it("Should emit event on successful claim of donations", async (): Promise<void> => {
      const _claim = 50;

      const tx = fundraiserContract.connect(addr3).claimDonations(0, _claim, {
        gasLimit,
      });

      await expect(tx)
        .to.emit(fundraiserContract, "ClaimSuccessful")
        .withArgs(0, addr3.address, _claim);
    });
  });

  /**
   * Test for withdrawal of donations by the donor
   * Checking if its a valid fundraiser id
   * Checking if the fundraiser has sufficient funds raised
   * Checking if the donor has donated the amount that he wants to withdraw
   * withdraw successful
   * Emit event for successsful withdrawal
   */
  describe("Test for withdrawal of funds by the donor", async (): Promise<void> => {
    it("Withdraw should fail if the fundraiser Id doesn't exist", async (): Promise<void> => {
      const tx: Promise<void> = fundraiserContract.withdrawFunds(22, 5000, {
        gasLimit,
      });

      await expect(tx).to.be.revertedWith("Oops! This fundraiser does not exist");
    });

    it("Withdraw should fail if the fundraiser doesn't have sufficient balance", async (): Promise<void> => {
      const tx: Promise<void> = fundraiserContract.connect(addr2).withdrawFunds(0, 50000000, {
        gasLimit,
      });

      await expect(tx).to.be.revertedWith("Sorry! Insufficient balance");
    });

    it("Withdraw should fail if the withdrawal amount is more than what is donated", async (): Promise<void> => {
      const donation: BigNumber = ethers.utils.parseEther("0.00000000000005");
      await fundraiserContract.donateFunds(0, { value: donation, gasLimit });

      const tx = fundraiserContract.withdrawFunds(0, 60000, {
        gasLimit,
      });

      await expect(tx).to.be.revertedWith(
        "Sorry! Your donated amout is less than your withdrawal amount"
      );
    });

    it("Withdraw successful", async (): Promise<void> => {
      const _withdraw = 5000;

      const _fundRaiserDetailsBefore = await fundraiserContract.fundRaisers(0);
      const _donorDetailsBefore = await fundraiserContract.donors(0, owner.address);

      await fundraiserContract.withdrawFunds(0, _withdraw, {
        gasLimit,
      });
      const _fundRaiserDetailsAfter = await fundraiserContract.fundRaisers(0);

      expect(_fundRaiserDetailsAfter.amountRaised).to.be.equal(
        _fundRaiserDetailsBefore.amountRaised - _withdraw
      );

      const _donorDetailsAfter = await fundraiserContract.donors(0, owner.address);

      expect(_donorDetailsAfter.amount).to.be.equal(_donorDetailsBefore.amount - _withdraw);
    });

    it("Should emit event on successful withdrawal of donated funds", async (): Promise<void> => {
      const _withdrawAmt = 5000;

      const tx = fundraiserContract.withdrawFunds(0, _withdrawAmt, {
        gasLimit,
      });

      await expect(tx)
        .to.emit(fundraiserContract, "WithdrawSuccessful")
        .withArgs(0, owner.address, _withdrawAmt);
    });
  });

  /**
   * Test for blacklisting and whitelisting a fundraiser
   * Only owner of the contract will be able to blacklist or whitelist a fundraiser
   * Check if its a valid fundraiser
   * Check if the fundraiser blacklisted or whitelisted
   * Emit event on successful status change
   */

  describe("Test for balacklisting and whitlisting a fundraiser", (): void => {
    it("Give error if anyone other thanthe owner of the contract tries to change the blacklist status of the fundraiser", async (): Promise<void> => {
      const tx = fundraiserContract.connect(addr1).blacklistFundraiser(1, true, { gasLimit });

      await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Blacklisting should fail if the fundraiser Id doesn't exist", async (): Promise<void> => {
      const tx: Promise<void> = fundraiserContract.blacklistFundraiser(22, true, { gasLimit });

      await expect(tx).to.be.revertedWith("Oops! This fundraiser does not exist");
    });

    it("Blacklist the fundraiser", async (): Promise<void> => {
      const _fundRaiserBefore = await fundraiserContract.blacklistedFundraisers(1);

      await fundraiserContract.blacklistFundraiser(1, true, { gasLimit });

      const _fundRaiserAfter = await fundraiserContract.blacklistedFundraisers(1);

      expect(_fundRaiserBefore).to.equal(false);
      expect(_fundRaiserAfter).to.equal(true);
    });

    it("Whitelist the fundraiser", async (): Promise<void> => {
      const _fundRaiserBefore = await fundraiserContract.blacklistedFundraisers(1);

      await fundraiserContract.blacklistFundraiser(1, false, { gasLimit });

      const _fundRaiserAfter = await fundraiserContract.blacklistedFundraisers(1);

      expect(_fundRaiserBefore).to.equal(true);
      expect(_fundRaiserAfter).to.equal(false);
    });

    it("Should emit event on successful change of blacklist status", async (): Promise<void> => {
      const tx = fundraiserContract.blacklistFundraiser(1, true, { gasLimit });

      await expect(tx).to.emit(fundraiserContract, "BlacklistedStatusChanged").withArgs(1, true);
    });
  });

  /**
   * Test for transferring donations back to respective donors
   * Check if  the fundraiser is valid
   * Transfer can be made only by the owner of contract or owner of fundraiser or for whom the fundraiser is initiated
   * Check if there are any donors
   * Check if there is any amount claimed by the donee
   * Transfer the donations successfully to the donors addresses
   * Emit event on successful transfer of donations
   */
  describe("Test for transferring back donations to donors", (): void => {
    it("Transfer should fail if the fundraiser Id doesn't exist", async (): Promise<void> => {
      const tx: Promise<void> = fundraiserContract.transferFundsBackToDonors(22, {
        gasLimit,
      });

      await expect(tx).to.be.revertedWith("Oops! This fundraiser does not exist");
    });

    it("Transfer should fail if the transfer is not made by the owner of the contract or the owner of fundraiser or for whom the fundraiser has been raised", async (): Promise<void> => {
      const tx: Promise<void> = fundraiserContract.connect(addr1).transferFundsBackToDonors(0, {
        gasLimit,
      });

      await expect(tx).to.be.revertedWith("You don't have sufficient permissions");
    });

    it("Transfer should fail if there are no donors", async (): Promise<void> => {
      await fundraiserContract
        .connect(addr3)
        .startFundRaiser(addr3.address, amountToBeRaised, 2, aboutFundraiser, 0);

      const tx: Promise<void> = fundraiserContract.connect(addr3).transferFundsBackToDonors(2, {
        gasLimit,
      });

      await expect(tx).to.be.revertedWith("Sorry! We are not able to find any donations");
    });

    it("Transfer should fail if donee has claimed the amount", async (): Promise<void> => {
      const tx: Promise<void> = fundraiserContract.connect(addr3).transferFundsBackToDonors(0, {
        gasLimit,
      });

      await expect(tx).to.be.revertedWith(
        "Part of donation has already been claimed. You can't transfer funds"
      );
    });

    it("Successfully transfered to donors", async (): Promise<void> => {
      const _fundraiserId = 2;
      const donation: BigNumber = ethers.utils.parseEther("0.00000000000005");
      await fundraiserContract
        .connect(addr2)
        .donateFunds(_fundraiserId, { value: donation, gasLimit });

      const _fundRaiserBefore = await fundraiserContract.fundRaisers(_fundraiserId);

      await fundraiserContract.transferFundsBackToDonors(_fundraiserId, {
        gasLimit,
      });

      const _fundRaiserAfter = await fundraiserContract.fundRaisers(_fundraiserId);

      expect(_fundRaiserBefore.amountReturned).to.equal(false);
      expect(_fundRaiserAfter.amountReturned).to.equal(true);

      for (let i = 0; i < _fundRaiserAfter.totalSupportors; i++) {
        const _donorAddress = await fundraiserContract.donorsAddressList(_fundraiserId, i);

        const _donorAmount = (await fundraiserContract.donors(_fundraiserId, _donorAddress)).amount;

        expect(_donorAmount).to.equal(0);
      }
    });

    it("Transfer should fail if the donations are already returned", async (): Promise<void> => {
      const _fundraiserId = 2;

      const tx: Promise<void> = fundraiserContract
        .connect(addr3)
        .transferFundsBackToDonors(_fundraiserId, {
          gasLimit,
        });

      await expect(tx).to.be.revertedWith("Donations already returned");
    });

    it("Should emit event on successful transfer", async (): Promise<void> => {
      const tx = fundraiserContract.transferFundsBackToDonors(1, {
        gasLimit,
      });

      expect(tx).to.emit(fundraiserContract, "AmountSuccessfullyReturnedToDOnors").withArgs(0);
    });
  });
});
