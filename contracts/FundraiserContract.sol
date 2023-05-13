// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title Fundraiser Contract
 * @author Kartik Yadav
 * @notice This contract is for raising funds from the community for those who are  in need of the funds for differnt purposes like education, medical, animals, environemnt and others.
 */

contract Fundraiser is Ownable {
  using Address for address;

  /* Structs, Valriable, Enums etc start */
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
    uint256 totalSupportors;
    uint256 createdOn;
    uint256 updatedOn;
    bool isActive;
    uint256 amountClaimed;
  }

  struct donor {
    uint256 amount;
    uint256 donatedOn;
  }
  /* Structs, Valriable, Enums etc end */

  /* Events Start */
  event fundraiserStarted(
    address _raisedBy,
    address _raisedFor,
    uint256 _amount,
    uint16 _toBeRaisedInDays,
    string _about,
    Category _category
  );
  event DonationSuccessful(address _donatedBy, uint _donatedTo, uint _amountDonated);
  event ActivationStautsChanged(uint _fundraiser, bool _activationStatus);
  event UpdateSuccessful(
    uint256 _fundraiser,
    uint256 _updatedAmount,
    string _updatedAbout,
    Category _updatedCategory,
    uint16 _updatedNeededBefore
  );
  event BlacklistedStatusChanged(uint fundRaiser, bool _blacklistStatus);
  event ClaimSuccessful(uint _claimedFrom, address _claimedBy, uint _amountCliamed);
  event WithdrawSuccessful(uint _withdrawalFrom, address _withdrawalBy, uint _amountWithdrawn);
  /* Events End */

  /* Modifiers Start */
  modifier isValidFundraiser(uint256 _fundraiserId) {
    require(
      _fundraiserId >= 0 && _fundraiserId < fundRaisers.length,
      "Oops! This fundraiser does not exist"
    );
    _;
  }

  modifier isNotAContractAddress(address _addr) {
    require(!_addr.isContract(), "You can't raise for a contract");
    _;
  }

  modifier onlyFundraiserOwner(uint256 _fundraiserId) {
    require(
      fundRaisers[_fundraiserId].raisedBy == msg.sender ||
        fundRaisers[_fundraiserId].raisedFor == msg.sender,
      "You don't have sufficient permissions"
    );
    _;
  }

  modifier hasSufficientBalance(uint _fundraiserId, uint _transferAmt) {
    require(
      _transferAmt >= 0 &&
        _transferAmt <= fundRaisers[_fundraiserId].amountRaised &&
        _transferAmt <=
        fundRaisers[_fundraiserId].amountRaised - fundRaisers[_fundraiserId].amountClaimed,
      "Sorry! Insufficient balance"
    );
    _;
  }
  /* Modifiers End */

  /* Mappings Start */
  fundRaiser[] public fundRaisers;
  mapping(uint256 => mapping(address => donor)) public donors;
  mapping(uint256 => bool) public blacklistedFundraisers;

  /* Mappings End */

  /**
   * @param _raisedFor the address of the person for whom the funds are to be raised
   * @param _amount total amount that is to be raised
   * @param _toBeRaisedInDays total number of days during which the funds are to be raised
   * @param _about Description abount why the user need funds
   * @param _category category in which this fundraiser lies (eg: education, medical etc). But the input will in number format (eg: 0, 1, 2, ...)
   */
  function startFundRaiser(
    address _raisedFor,
    uint256 _amount,
    uint16 _toBeRaisedInDays,
    string memory _about,
    Category _category
  ) external isNotAContractAddress(_raisedFor) {
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

    emit fundraiserStarted(msg.sender, _raisedFor, _amount, _toBeRaisedInDays, _about, _category);
  }

  /**
   * @param _fundraiserId id of the fundraiser to whom you want to donate funds
   */
  function donateFunds(uint256 _fundraiserId) external payable isValidFundraiser(_fundraiserId) {
    // checking if fundraiser is blacklisted
    require(
      !blacklistedFundraisers[_fundraiserId],
      "Sorry! This fundraiser has been blacklisted. It can no longer raise funds"
    );

    fundRaiser memory fundraiserDetails = fundRaisers[_fundraiserId];

    // checking if fundraiser is active
    require(
      fundraiserDetails.isActive,
      "Either the fundraiser is no longer accepting donations or He has raised the needed amount"
    );

    // checking if the donation is in the required limit
    require(
      msg.value <= fundraiserDetails.amount &&
        msg.value <= fundraiserDetails.amount - fundraiserDetails.amountRaised,
      "Thank You for your help but we can't accept funds as the fundraiser doesn't need that much funds."
    );

    // checking if transferring after expiry
    require(
      (block.timestamp + (fundraiserDetails.neededBefore * 1 days)) >= block.timestamp,
      "Sorry! The timeperiod to raise funds has passed"
    );

    donor memory _donor = donors[_fundraiserId][msg.sender];

    // updating fundraiser details
    fundraiserDetails.amountRaised += msg.value;

    // to check if the donor has donated earlier
    if (_donor.amount == 0 && msg.value != 0) {
      fundraiserDetails.totalSupportors += 1;
    }

    // marking fundaraiser as inactive when the comple amount has been raised
    if (fundraiserDetails.amountRaised == fundraiserDetails.amount) {
      fundraiserDetails.isActive = false;
    }

    fundRaisers[_fundraiserId] = fundraiserDetails;

    // updating donor details
    _donor.amount += msg.value;
    _donor.donatedOn = block.timestamp;
    donors[_fundraiserId][msg.sender] = _donor;

    emit DonationSuccessful(msg.sender, _fundraiserId, msg.value);
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

    emit BlacklistedStatusChanged(_fundraiserId, _status);
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

    emit ActivationStautsChanged(_fundraiserId, _status);
  }

  /**
   * @param _fundraiserId id of the fundraiser to whom you want to update the details
   * @param _amount total amount that is to be raised
   * @param _about Description abount why the user need funds
   * @param _category category in which this fundraiser lies (eg: education, medical etc). But the input will in number format (eg: 0, 1, 2, ...)
   */
  function updateFundraiserDetails(
    uint256 _fundraiserId,
    uint256 _amount,
    string memory _about,
    Category _category,
    uint16 _neededBefore
  ) external isValidFundraiser(_fundraiserId) onlyFundraiserOwner(_fundraiserId) {
    fundRaiser memory _updateFundraiser = fundRaisers[_fundraiserId];

    require(
      _amount >= _updateFundraiser.amountRaised,
      "The new raised amount is less than the current amount raised"
    );

    if (_neededBefore < _updateFundraiser.neededBefore) {
      require(
        block.timestamp >= (_updateFundraiser.neededBefore - _neededBefore) * 1 days,
        "Please give us more time to raise the funds"
      );
    }

    if (_neededBefore != _updateFundraiser.neededBefore) {
      _updateFundraiser.neededBefore = _neededBefore;
    }

    _updateFundraiser.amount = _amount;

    if (_amount == _updateFundraiser.amountRaised && _updateFundraiser.isActive)
      _updateFundraiser.isActive = false;
    else if (!_updateFundraiser.isActive) _updateFundraiser.isActive = true;

    _updateFundraiser.about = _about;
    _updateFundraiser.category = _category;
    _updateFundraiser.updatedOn = block.timestamp;

    fundRaisers[_fundraiserId] = _updateFundraiser;

    emit UpdateSuccessful(_fundraiserId, _amount, _about, _category, _neededBefore);
  }

  /**
   * @param _fundraiserId id of findraiser of which the funda re  to be claimed
   * @param _transferAmt amount that is to be claimed
   */
  function claimDonations(
    uint256 _fundraiserId,
    uint _transferAmt
  )
    external
    payable
    isValidFundraiser(_fundraiserId)
    onlyFundraiserOwner(_fundraiserId)
    hasSufficientBalance(_fundraiserId, _transferAmt)
  {
    fundRaisers[_fundraiserId].amountClaimed = _transferAmt;
    payable(fundRaisers[_fundraiserId].raisedFor).transfer(_transferAmt);

    emit ClaimSuccessful(_fundraiserId, msg.sender, _transferAmt);
  }

  /**
   *
   * @param _fundraiserId fundraiser id from which the user wants to withdraw the donations
   * @param _withdrawAmt amount that is to be withdrawn
   */
  function withdrawFunds(
    uint _fundraiserId,
    uint _withdrawAmt
  )
    external
    payable
    isValidFundraiser(_fundraiserId)
    hasSufficientBalance(_fundraiserId, _withdrawAmt)
  {
    require(
      donors[_fundraiserId][msg.sender].amount >= _withdrawAmt,
      "Sorry! Your donated amout is less than your withdrawal amount"
    );

    payable(msg.sender).transfer(_withdrawAmt);

    if (_withdrawAmt == donors[_fundraiserId][msg.sender].amount) {
      fundRaisers[_fundraiserId].totalSupportors -= 1;
    }

    donors[_fundraiserId][msg.sender].amount -= _withdrawAmt;
    fundRaisers[_fundraiserId].amountRaised -= _withdrawAmt;

    emit WithdrawSuccessful(_fundraiserId, msg.sender, _withdrawAmt);
  }
}
