pragma solidity ^0.4.23;
import "./Match.sol";

contract WorldCup is Match {

    constructor(uint totalTokens, uint pricePerToken) public {
        totalTokenSupply = totalTokens;
        balanceTokens = totalTokens;
        tokenPrice = pricePerToken;
    }

    function getBalanceOf(address _owner) view public returns (uint) {
        return ownerOwnedTokens[_owner];
    }

    function buy() payable public returns (uint) {
        uint tokensToBuy = msg.value / tokenPrice;
        require(tokensToBuy <= balanceTokens);
        ownerOwnedTokens[msg.sender] += tokensToBuy;
        balanceTokens -= tokensToBuy;

        return tokensToBuy;
    }
}