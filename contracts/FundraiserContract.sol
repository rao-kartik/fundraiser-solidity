// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Fundraiser is Ownable {
  struct fundRaiser {
    address raisedBy;
    address raisedFor;
    uint64 amount;
    uint64 amountRaised;
    uint16 neededInDays;
    uint totalSupporters;
    uint createdOn;
    bool isActive;
  }

  struct donor {
    uint amount;
    uint donatedOn;
  }

  modifier isValidFundraiser(uint _fundraiserId) {
    require(
      _fundraiserId >= 0 && _fundraiserId < fundRaisers.length,
      "Oops! This fundraiser does not exist"
    );
    _;
  }

  modifier onlyFundraiserOwner(uint _fundraiserId) {
    require(
      fundRaisers[_fundraiserId].raisedBy == msg.sender,
      "Sorry! You don't have access to change the status of fundraiser"
    );
    _;
  }

  fundRaiser[] fundRaisers;
  mapping(uint => mapping(address => donor)) donors;
  mapping(uint => bool) blacklistedFundraisers;

  function startFundRaiser(address _raisedFor, uint64 _amount, uint16 _toBeRaisedInDays) external {
    require(_raisedFor != address(0), "Oops! It's an invalid address");
    require(_amount > 0, "Sorry! Please add some amount to be raised");
    require(_toBeRaisedInDays > 0, "Give us atleast 1 day to raise funds");

    fundRaiser memory newFundraiser;
    newFundraiser.raisedFor = _raisedFor;
    newFundraiser.amount = _amount;
    newFundraiser.neededInDays = _toBeRaisedInDays;
    newFundraiser.createdOn = block.timestamp;
    newFundraiser.isActive = true;

    fundRaisers.push(newFundraiser);
  }

  function donateFunds(
    uint _fundraiserId,
    uint64 _amountToBeTransferred
  ) external isValidFundraiser(_fundraiserId) {
    fundRaiser memory fundraiserDetails;

    /* checking if fundraiser is blacklisted */
    require(
      !blacklistedFundraisers[_fundraiserId],
      "Sorry! This fundraiser has been blacklisted. It can no longer raise funds"
    );

    /* checking if fundraiser is active */
    require(
      fundraiserDetails.isActive,
      "Either the fundraiser is no longer accepting donations or He has raised the needed amount"
    );

    /* checking transferred amount is less than or equal to desired amount */
    require(
      _amountToBeTransferred <= fundraiserDetails.amount,
      "The fundRaiser has already raised the required amount"
    );

    /* checking if the transferred amount is less than remaining amount */
    require(
      _amountToBeTransferred <= fundraiserDetails.amount - fundraiserDetails.amountRaised,
      "Thank You for your help but we can't accept funds as the fundraiser doesn't need that much funds."
    );

    /* updating fundraiser details */
    fundraiserDetails.amountRaised += _amountToBeTransferred;

    if (fundraiserDetails.amountRaised == fundraiserDetails.amount) {
      fundraiserDetails.isActive = false;
    }

    fundRaisers[_fundraiserId] = fundraiserDetails;

    /* updating donor details */
    donor memory _donor = donors[_fundraiserId][msg.sender];

    _donor.amount += _amountToBeTransferred;
    _donor.donatedOn = block.timestamp;

    donors[_fundraiserId][msg.sender] = _donor;
  }

  function blacklistFundraiser(
    uint _fundraiserId,
    bool _status
  ) external onlyOwner isValidFundraiser(_fundraiserId) {
    blacklistedFundraisers[_fundraiserId] = _status;
  }

  function manageActiveStatusOfFundraiser(
    uint _fundraiserId,
    bool _status
  ) external isValidFundraiser(_fundraiserId) onlyFundraiserOwner(_fundraiserId) {
    fundRaisers[_fundraiserId].isActive = _status;
  }
}
