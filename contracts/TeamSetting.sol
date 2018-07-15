pragma solidity ^0.4.23;

import "./PlayerFactory.sol";

contract TeamSetting is PlayerFactory {

    modifier onlyOwner(address _owner, uint _playerId) {
        require(_owner == playerToOwner[_playerId]);
        _;
    }

    uint[] public onSellPlayerList;

    function startersCount(address _owner) view private returns (uint) {
        uint starterCount = 0;
        for (uint i = 0; i < ownerOwnedPlayers[_owner].length; i++) {
            if (players[ownerOwnedPlayers[_owner][i]].isStarter) {
                starterCount++;
            }
        }

        return starterCount;
    }

    function playerNotStarter(address _owner, uint _playerId) view private returns (bool) {
        for (uint i = 0; i < ownerOwnedPlayers[_owner].length; i++) {
            if (ownerOwnedPlayers[_owner][i] == _playerId && players[ownerOwnedPlayers[_owner][i]].isStarter) {
                return false;
            }
        }

        return true;
    }

    function setPlayerAsStarter(uint _playerId) public onlyOwner(msg.sender, _playerId) {
        require(startersCount(msg.sender) < 11 && playerNotStarter(msg.sender, _playerId));
        players[_playerId].isStarter = true;
    }

    
    function removePlayerFromStarter(uint _playerId) public onlyOwner(msg.sender, _playerId) {
        require(startersCount(msg.sender) > 0 && !playerNotStarter(msg.sender, _playerId));
        players[_playerId].isStarter = false;
    }

    function sellPlayer(uint _playerId) public {
        require(playerToOwner[_playerId] == msg.sender);
        players[_playerId].onSale = true;

        uint[] memory sellerCurrentPlayersId = new uint[](ownerOwnedPlayers[msg.sender].length - 1);
        uint index = 0;
        for (uint i = 0; i < ownerOwnedPlayers[msg.sender].length; i++) {
            if (ownerOwnedPlayers[msg.sender][i] != _playerId) {
                sellerCurrentPlayersId[index++] = ownerOwnedPlayers[msg.sender][i];
            }
        }

        ownerOwnedPlayers[msg.sender] = sellerCurrentPlayersId;

        onSellPlayerList.push(_playerId);
    }

    function buyPlayer(uint _playerId) public {
        require(playerToOwner[_playerId] != msg.sender && ownerOwnedTokens[msg.sender] >= 10);
        ownerOwnedTokens[msg.sender] -= 10;
        ownerOwnedTokens[playerToOwner[_playerId]] += 10;
        playerToOwner[_playerId] = msg.sender;
        ownerOwnedPlayers[msg.sender].push(_playerId);
        players[_playerId].onSale = false;

        uint[] memory curPlayersList = new uint[](onSellPlayerList.length - 1);
        uint index = 0;
        for (uint i = 0; i < onSellPlayerList.length; i++) {
            if (_playerId != onSellPlayerList[i]) {
                curPlayersList[index] = onSellPlayerList[i];
            }
        }
        
        onSellPlayerList = curPlayersList;
    }

    function onSalePlayers() view public returns (uint[]) {
        return onSellPlayerList;
    }
}