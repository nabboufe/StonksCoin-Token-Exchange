// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.17;

import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;
    uint256 public ordersCount = 0;
    mapping(address => mapping(address => uint256)) public deposit;
    mapping(uint256 => _Order) public orders;
    mapping(uint256 => bool) public orderCancelled;
    mapping(uint256 => bool) public orderFilled;

    struct _Order {
        address orderingUser;
        uint256 timestamp;
        uint256 id;
        address _tokenGive; uint256 _amountGive;
        address _tokenGet; uint256 _amountGet;
    }

    event Trade(
        address orderingUser,
        address fulfillingUser,
        uint256 timestamp,
        uint256 id,
        address _tokenGive, uint256 _amountGive,
        address _tokenGet, uint256 _amountGet
    );

    event Order(
        address orderingUser,
        uint256 timestamp,
        uint256 id,
        address _tokenGive, uint256 _amountGive,
        address _tokenGet, uint256 _amountGet
    );

    event Cancel(
        address orderingUser,
        uint256 timestamp,
        uint256 id,
        address _tokenGive, uint256 _amountGive,
        address _tokenGet, uint256 _amountGet
    );

    event Deposit(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _balance
    );

    event Withdraw(
        address _token,
        address _user,
        uint256 _amount,
        uint256 _balance
    );

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    function withdrawToken(address _token, uint256 _amount) public {
        require(deposit[_token][msg.sender] >= _amount,
            "f/ withdrawToken() : Amount must be equal or less than deposit");

        Token(_token).transfer(msg.sender, _amount);
        deposit[_token][msg.sender] -= _amount;
        emit Withdraw(_token, msg.sender, _amount, deposit[_token][msg.sender]);
    }

    function depositToken(address _token, uint256 _amount) public {
        Token(_token).transferFrom(msg.sender, address(this), _amount);
        deposit[_token][msg.sender] += _amount;
        emit Deposit(_token, msg.sender, _amount, deposit[_token][msg.sender]);
    }

    function makeOrder(
        address _tokenGive, uint256 _amountGive,
        address _tokenGet, uint256 _amountGet) 
        public
    {
        require(_tokenGet != address(0),
            "f/ makeOrder() : Address(0) not allowed");
        require(_tokenGive != address(0),
            "f/ makeOrder() : Address(0) not allowed");
        require(deposit[_tokenGive][msg.sender] >= _amountGive,
            "f/ makeOrder() : Amount must be equal or less than deposit");

        orders[ordersCount] =   _Order(
                                    msg.sender,
                                    block.timestamp,
                                    ordersCount,
                                    _tokenGive, _amountGive,
                                    _tokenGet, _amountGet
                                );

        emit Order(
            msg.sender,
            block.timestamp,
            ordersCount,
            _tokenGive, _amountGive,
            _tokenGet, _amountGet
        );
        ordersCount += 1;
    }

    function cancelOrder(uint256 _id) public {
        _Order storage _order = orders[_id];
        require(msg.sender == _order.orderingUser,
            "f/ cancelOrder() : Only the ordering user can cancel the order");
        require(_order.timestamp != 0,
            "f/ cancelOrder() : Non-existant order can't be cancelled");
        orderCancelled[_id] = true;

        emit Cancel(
            msg.sender,
            block.timestamp,
            _order.id,
            _order._tokenGive, _order._amountGive,
            _order._tokenGet, _order._amountGet
        );
    }

    function fillOrder(uint256 _id) public {
        _Order storage order = orders[_id];

        uint256 _feeAmount = (order._amountGet * feePercent) / 100;
        require(orders[_id].timestamp != 0,
            "f/ fillOrder() : Non-existant order can't be fulfilled");
        require(orderCancelled[_id] == false,
            "f/ fillOrder() : Cancelled order cannot be fulfilled");
        require(orderFilled[_id] == false, 
            "f/ fillOrder() : Order has already been fulfilled");
        require(order.orderingUser != msg.sender,
            "f/ fillOrder() : Ordering user and fulfilling user can't be the same");
        require(deposit[order._tokenGet][msg.sender] >= (order._amountGet + _feeAmount),
            "f/ fillOrder() : No enought fund to fulfill order and pay fees");

        _trade(
            order.orderingUser,
            order._tokenGive, order._amountGive,
            order._tokenGet, order._amountGet
        );

        emit Trade(
            order.orderingUser,
            msg.sender,
            block.timestamp,
            order.id,
            order._tokenGive, order._amountGive,
            order._tokenGet, order._amountGet
        );

        orderFilled[_id] = true;
    }

    function _trade(
        address _user,
        address _tokenGive,
        uint _amountGive,
        address _tokenGet,
        uint256 _amountGet)
        internal 
    {
        uint256 _feeAmount = (_amountGet * feePercent) / 100;

        deposit[_tokenGet][msg.sender] =
            deposit[_tokenGet][msg.sender] - (_amountGet + _feeAmount);
        deposit[_tokenGet][_user] = deposit[_tokenGet][_user] + _amountGet;

        deposit[_tokenGet][feeAccount] =
            deposit[_tokenGet][feeAccount] + _feeAmount;

        deposit[_tokenGive][_user] = deposit[_tokenGive][_user] - _amountGive;
        deposit[_tokenGive][msg.sender] =
            deposit[_tokenGive][msg.sender] + _amountGive;
    }
}
