// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

contract Token {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply; // 1,000,000 x 10^18

    mapping(address => uint256) public balanceOf; 
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value);
    event Approval(
        address indexed _owner,
        address indexed spender,
        uint256
    );

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
        require(balanceOf[msg.sender] >= _value, "f/ transfer() : Insufficient balance"); 
        require(_to != address(0), "f/ transfer() : Address(0) not allowed");

        balanceOf[_to] += _value;
        balanceOf[msg.sender] -= _value;

        emit Transfer(msg.sender, _to, _value);  
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value)
        public returns (bool succss)
    {
        require(_from != address(0), "f/ transferFrom() : Address(0) not allowed");
        require(_to != address(0), "f/ transferFrom() : Address(0) not allowed");

        require(balanceOf[_from] >= _value, "f/ transferFrom() : Insufficient balance");
        require(allowance[_from][_to] >= _value,
            "f/ transferFrom() : Token transfer not allowed by owner");

        balanceOf[_to] += _value;
        balanceOf[_from] -= _value;
        allowance[_from][_to] -= _value;

        emit Transfer(_from, _to, _value);
        return true;
    }

    function approve(
        address _spender,
        uint256 _value)
        public returns (bool succeess)
    {
        require(_spender != address(0), "f/ Approve() : Address(0) not allowed");

        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);

        return true;
    }
}
