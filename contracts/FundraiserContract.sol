// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Fundraiser Contract
 * @author Kartik Yadav
 * @notice This contract is for raising funds from the community for those who are  in need of the funds for differnt purposes like education, medical, animals, environemnt and others.
 */

contract Fundraiser is Ownable {
  enum Category {
    EDUCATION,
    MEDICAL,
    WOMANANDGIRLS,
    ANIMALS,
    CREATIVE,
    FOODANDHUNGER,
    ENVIRONMENT,
    CHILDREN,
    MEMORIAL,
    COMMUNITYDEVELOPMENT,
    OTHERS
  }

  struct fundRaiser {
    address raisedBy;
    address raisedFor;
    string about;
    Category category;
    uint256 amount;
    uint256 amountRaised;
    uint16 neededBefore;
    uint256 totalSupporters;
    uint256 createdOn;
    uint256 updatedOn;
    bool isActive;
    bool amountTransferred;
  }

  struct donor {
    uint256 amount;
    uint256 donatedOn;
  }

  modifier isValidFundraiser(uint256 _fundraiserId) {
    require(
      _fundraiserId >= 0 && _fundraiserId < fundRaisers.length,
      "Oops! This fundraiser does not exist"
    );
    _;
  }

  modifier onlyFundraiserOwner(uint256 _fundraiserId) {
    require(
      fundRaisers[_fundraiserId].raisedBy == msg.sender,
      "Sorry! You don't have access to change the status of fundraiser"
    );
    _;
  }

  fundRaiser[] public fundRaisers;
  mapping(uint256 => mapping(address => donor)) public donors;
  mapping(uint256 => bool) public blacklistedFundraisers;

  /**
   * @param _raisedFor the address of the person for whom the funds are to be raised
   * @param _amount total amount that is to be raised
   * @param _toBeRaisedInDays total number of days during which the funds are to be raised
   * @param _about Description abount why the user need funds
   * @param _category category in which this fundraiser lies (eg: education, medical etc). But the input will in number format (eg: 0, 1, 2, ...)
   */
  function startFundRaiser(
    address _raisedFor,
    uint64 _amount,
    uint16 _toBeRaisedInDays,
    string memory _about,
    Category _category
  ) external {
    require(_raisedFor != address(0), "Oops! It's an invalid address");
    require(_amount > 0, "Sorry! Please add some amount to be raised");
    require(_toBeRaisedInDays > 0, "Give us atleast 1 day to raise funds");
    require(
      _category >= Category.EDUCATION && _category <= Category.OTHERS,
      "Sorry, you have selected wrong category"
    );

    fundRaiser memory newFundraiser;
    newFundraiser.raisedBy = msg.sender;
    newFundraiser.raisedFor = _raisedFor;
    newFundraiser.amount = _amount;
    newFundraiser.neededBefore = _toBeRaisedInDays;
    newFundraiser.createdOn = block.timestamp;
    newFundraiser.isActive = true;
    newFundraiser.category = _category;
    newFundraiser.about = _about;

    fundRaisers.push(newFundraiser);
  }

  /**
   * @param _fundraiserId id of the fundraiser to whom you want to donate funds
   */
  function donateFunds(uint256 _fundraiserId) external payable isValidFundraiser(_fundraiserId) {
    /* checking if fundraiser is blacklisted */
    require(
      !blacklistedFundraisers[_fundraiserId],
      "Sorry! This fundraiser has been blacklisted. It can no longer raise funds"
    );

    fundRaiser memory fundraiserDetails = fundRaisers[_fundraiserId];

    /* checking if fundraiser is active */
    require(
      fundraiserDetails.isActive,
      "Either the fundraiser is no longer accepting donations or He has raised the needed amount"
    );

    /* checking transferred amount is less than or equal to desired amount */
    require(msg.value <= fundraiserDetails.amount, "The fundRaiser doesn't need this much amount");

    /* checking if the transferred amount is less than remaining amount */
    require(
      msg.value <= fundraiserDetails.amount - fundraiserDetails.amountRaised,
      "Thank You for your help but we can't accept funds as the fundraiser doesn't need that much funds."
    );

    /* checking if transferring after expiry */
    require(
      (block.timestamp + (fundraiserDetails.neededBefore * 1 days)) >= block.timestamp,
      "Sorry! The timeperiod to raise funds has passed"
    );

    donor memory _donor = donors[_fundraiserId][msg.sender];

    /* updating fundraiser details */
    fundraiserDetails.amountRaised += msg.value;

    if (_donor.amount == 0) {
      fundraiserDetails.totalSupporters += 1;
    }

    if (fundraiserDetails.amountRaised == fundraiserDetails.amount) {
      fundraiserDetails.isActive = false;

      payable(fundraiserDetails.raisedFor).transfer(fundraiserDetails.amount);

      fundraiserDetails.amountTransferred = true;
    }

    fundRaisers[_fundraiserId] = fundraiserDetails;

    /* updating donor details */

    _donor.amount += msg.value;
    _donor.donatedOn = block.timestamp;

    donors[_fundraiserId][msg.sender] = _donor;
  }

  /**
   * @param _fundraiserId id of the fundraiser to whom you want to donate funds
   * @param _status true or false based on whether its to be blacklisted or remove from blacklist
   */
  function blacklistFundraiser(
    uint256 _fundraiserId,
    bool _status
  ) external onlyOwner isValidFundraiser(_fundraiserId) {
    blacklistedFundraisers[_fundraiserId] = _status;
  }

  /**
   * @param _fundraiserId id of the fundraiser to whom you want to donate funds
   * @param _status true or false based on whether to pause or start receiving funds
   */
  function manageActiveStatusOfFundraiser(
    uint256 _fundraiserId,
    bool _status
  ) external isValidFundraiser(_fundraiserId) onlyFundraiserOwner(_fundraiserId) {
    fundRaisers[_fundraiserId].isActive = _status;
  }

  /**
   * @param _fundraiserId id of the fundraiser to whom you want to update the details
   * @param _amount total amount that is to be raised
   * @param _raisedFor the address of the person for whom the funds are to be raised
   * @param _about Description abount why the user need funds
   * @param _category category in which this fundraiser lies (eg: education, medical etc). But the input will in number format (eg: 0, 1, 2, ...)
   */
  function updateFundraiserDetails(
    uint256 _fundraiserId,
    uint256 _amount,
    string memory _about,
    Category _category,
    address _raisedFor
  ) external isValidFundraiser(_fundraiserId) onlyFundraiserOwner(_fundraiserId) {
    fundRaiser memory _updateFundraiser = fundRaisers[_fundraiserId];

    if (_amount >= _updateFundraiser.amountRaised) {
      _updateFundraiser.amount = _amount;
    }

    if (bytes(_about).length > 0) {
      _updateFundraiser.about = _about;
    }

    if (_raisedFor != address(0)) {
      _updateFundraiser.raisedFor = _raisedFor;
    }

    _updateFundraiser.category = _category;
    _updateFundraiser.updatedOn = block.timestamp;

    fundRaisers[_fundraiserId] = _updateFundraiser;
  }
}
