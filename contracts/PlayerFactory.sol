pragma solidity ^0.4.23;

contract PlayerFactory {

    event NewPlayer(uint playerId, string name, uint dna, uint power);

    uint dnaDigits = 8;
    uint dnaModulus = 10 ** dnaDigits;

    struct Player {
        string name;
        uint dna;
        uint power;
        bool isStarter;
        bool onSale;
    }

    Player[] public players;

    mapping (uint => address) public playerToOwner;
    mapping (address => uint[]) public ownerOwnedPlayers;
    mapping (address => string) public ownerCountry;

    uint nonce = 0;

    string[] initialPlayerNames = ["Pickford", "Kane", "Rashford", "Welbeck", "Cheek", "Jones", "Young", "Cahill", "Rose", "Sterling", "Lingard"];

    uint public totalTokenSupply;
    uint public balanceTokens;
    uint public tokenPrice;

    mapping (address => uint) public ownerOwnedTokens;

    function _generateRandomDnaAndPower(string _name) private returns (uint, uint) {
        uint rand = uint(keccak256(_name, now, nonce++));
        rand = rand % dnaModulus;
        uint power = (rand / 100) % 100;
        if (power <= 20) {
            power += 60;
        } else if (power <= 50) {
            power += 30;
        }

        return (rand, power);
    }

    function createRandomPlayer(string _name, bool _isStarter) public {
        (uint dna, uint power) = _generateRandomDnaAndPower(_name);
        uint id = players.push(Player(_name, dna, power, _isStarter, false)) - 1;
        playerToOwner[id] = msg.sender;
        ownerOwnedPlayers[msg.sender].push(id);

        emit NewPlayer(id, _name, dna, power);
    }

    function createPlayerByToken(string _name, bool _isStarter) public {
        require(ownerOwnedTokens[msg.sender] >= 10);
        createRandomPlayer(_name, _isStarter);
        ownerOwnedTokens[msg.sender] -= 10;
        balanceTokens += 10;
    }

    function initPlayers() public {
        require(ownerOwnedPlayers[msg.sender].length == 0);
        for (uint i = 0; i < 11; i++) {
            createRandomPlayer(initialPlayerNames[i], true);
        }
    }

    function setCountry(string _country) public {
        require(keccak256(ownerCountry[msg.sender]) == keccak256(""));
        ownerCountry[msg.sender] = _country;
    }

    function getCountry(address _owner) view public returns (string) {
        return ownerCountry[_owner];
    }

    function getOwnerOwnedPlayers(address _owner) view public returns (uint[]) {
        return ownerOwnedPlayers[_owner];
    }

    function getPlayerByPlayerId(uint _playerId) view public returns (string, uint, uint, bool, bool) {
        Player memory player = players[_playerId];
        return (player.name, player.dna, player.power, player.isStarter, player.onSale);
    }
}