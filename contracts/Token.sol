// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

import "hardhat/console.sol";

contract Token {
    string public name;
    mapping (uint256 => Account) accounts;

    struct Account {
        uint256 nonce;
        uint256 balance;
        uint256 storageRoot;
        address codeHash;
    }

    constructor() {
        name = "StonksCoin";
    }

    function get() public view returns(string memory) {
        console.log("travail termine");
        return name;
    }
}
