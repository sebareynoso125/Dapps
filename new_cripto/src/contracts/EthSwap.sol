pragma solidity ^0.5.0;

import "./Token.sol";

contract EthSwap{
    string public name = "EthSwap Instant Exchange";
    Token public token;
    uint public rate = 100; //Este es el valor pija que yo decido ponerle a mi cripto. 1 eth = 100 DApp
    
    event TokensPurchased(
        address account,
        address token,
        uint amount,
        uint rate
    );

    event TokensSold(
        address account,
        address token,
        uint amount,
        uint rate
    );

    constructor(Token _token) public{
        
        token = _token;
    } 

    //buy tokens
    function buyTokens() public payable{
        //redemption rate = numbre of tokens they recive for 1 eth
        //amount of eth * redemption rate
        //calculate the number or tokens to buy
        uint tokenAmount = msg.value * rate;

        //require that ethSwap has enough tokens to buy
        require(token.balanceOf(address(this)) >= tokenAmount);

        //Transfer tokens to the users
        token.transfer(msg.sender, tokenAmount);

        //trigger an event = purchase
        emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);

    }

    function sellTokens(uint _amount) public{

        //user can't sell more tokens than they have
        require(token.balanceOf(msg.sender) >= _amount);

        //calculate the amount of ether to redeem
        uint etherAmount = _amount/rate;

        //Require that EthSwap has enough Ether
        require(address(this).balance >= etherAmount);

        //perform a sell
        token.transferFrom(msg.sender, address(this), _amount);
        msg.sender.transfer(etherAmount);

        emit TokensSold(msg.sender, address(token), _amount, rate);
    }
}


