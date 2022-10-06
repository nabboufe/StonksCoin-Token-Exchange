// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

//import "hardhat/console.sol";

contract Token {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply; // 1,000,000 x 10^18
    mapping (uint256 => Account) accounts;

    struct Account {
        uint256 nonce;
        uint256 balance;
        uint256 storageRoot;
        address codeHash;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply)
    {
        name = _name;
        symbol = _symbol;
        decimals = 18;
        totalSupply = _totalSupply * (10 ** decimals);
    }
}
