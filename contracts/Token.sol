// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

//import "hardhat/console.sol";

contract Token {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply; // 1,000,000 x 10^18

    mapping(address => uint256) public balanceOf;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value);

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _totalSupply)
    {
        name = _name;
        symbol = _symbol;
        decimals = 18;
        totalSupply = _totalSupply * (10 ** decimals);
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(
        address _to,
        uint256 _value)
        public returns (bool success)
    {
        require(balanceOf[msg.sender] >= _value,
            "Insufficient balance."); 
        require(_to != address(0));

        balanceOf[_to] += _value;
        balanceOf[msg.sender] -= _value;
        
        emit Transfer(msg.sender, _to, _value);  
        return true;
    }
}
