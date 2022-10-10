// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;
    mapping(address => mapping(address => uint256)) public deposit;

    event Deposit(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _balance
    );

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }
    function depositToken(address _token, uint256 _amount) public {
        Token(_token).transferFrom(msg.sender, address(this), _amount);
        deposit[_token][msg.sender] += _amount;
        emit Deposit(_token, msg.sender, _amount, deposit[_token][msg.sender]);
    }
}