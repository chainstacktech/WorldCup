pragma solidity ^0.4.23;

import "./TeamSetting.sol";

contract Match is TeamSetting {

    event NewMatch(address player1, address player2, uint matchId, string player1Result, string player2Result);

    enum MatchStatus {
        WAITING, FINISHED
    }

    enum MatchResult {
        WIN, TIE, LOSE
    }

    struct MatchInfo {
        address player1;
        address player2;
        MatchStatus status;
        mapping (address => MatchResult) player1Result;
        mapping (address => MatchResult) player2Result;
    }

    MatchInfo[] public matchArray;

    mapping (address => uint[]) public ownerMatches;

    function attendMatch() public returns (uint) {
        require(ownerOwnedTokens[msg.sender] >= 10);
        if (matchArray.length == 0 || uint(matchArray[matchArray.length - 1].status) == 1) {
            uint matchId = matchArray.push(MatchInfo(msg.sender, 0, MatchStatus.WAITING)) - 1;
            ownerMatches[msg.sender].push(matchId);
        } else {
            require(matchArray[matchArray.length - 1].player1 != msg.sender);
            matchArray[matchArray.length - 1].player2 = msg.sender;
            matchId = matchArray.length - 1;
            ownerMatches[msg.sender].push(matchId);

            address curPlayer1 = matchArray[matchArray.length - 1].player1;
            address curPlayer2 = matchArray[matchArray.length - 1].player2;
            int matchResult = teamCompete(curPlayer1, curPlayer2);
            matchArray[matchArray.length - 1].status = MatchStatus.FINISHED;

            if (matchResult > 50) {
                matchArray[matchArray.length - 1].player1Result[curPlayer1] = MatchResult.WIN;
                matchArray[matchArray.length - 1].player2Result[curPlayer2] = MatchResult.LOSE;
                ownerOwnedTokens[curPlayer1] += 10;
                ownerOwnedTokens[curPlayer2] -= 10;
                emit NewMatch(curPlayer1, curPlayer2, matchId, "WIN", "LOSE");
            } else if (matchResult >= -50 && matchResult <= 50) {
                matchArray[matchArray.length - 1].player1Result[curPlayer1] = MatchResult.TIE;
                matchArray[matchArray.length - 1].player2Result[curPlayer2] = MatchResult.TIE;
                emit NewMatch(curPlayer1, curPlayer2, matchId, "WIN", "LOSE");
            } else {
                matchArray[matchArray.length - 1].player1Result[curPlayer1] = MatchResult.LOSE;
                matchArray[matchArray.length - 1].player2Result[curPlayer2] = MatchResult.WIN;
                ownerOwnedTokens[curPlayer1] -= 10;
                ownerOwnedTokens[curPlayer2] += 10;
                emit NewMatch(curPlayer1, curPlayer2, matchId, "WIN", "LOSE");
            }
        }
    }

    function teamCompete(address _player1, address _player2) private returns (int) {
        int team1Power = getTeamStarterPower(_player1);
        int team2Power = getTeamStarterPower(_player2);

        return team1Power - team2Power + getFortune(_player1, _player2);
    }

    function getTeamStarterPower(address _owner) view private returns (int) {
        uint[] memory teamStarters = ownerOwnedPlayers[_owner];
        int teamPower = 0;

        for (uint i = 0 ; i < teamStarters.length; i++) {
            if (players[teamStarters[i]].isStarter) {
                teamPower += int(players[teamStarters[i]].power);
            }
        }

        return teamPower;
    }

    function getFortune(address _player1, address _player2) private returns (int) {
        uint rand = uint(keccak256(_player1, _player2, now, nonce++)) % 400;
        int fortune = int(rand - 200);
        return fortune;
    }

    function getOtherWaitingPlayerAddress() view public returns (address) {
        return matchArray[matchArray.length - 1].player1;
    }

    function getTeamStarters(address _owner) view public returns (uint[]) {
        uint[] memory teamStarters = new uint[](11);
        uint[] memory ownerTeamPlayers = ownerOwnedPlayers[_owner];
        uint index = 0;
        for (uint i = 0; i < ownerTeamPlayers.length; i++) {
            if (players[ownerTeamPlayers[i]].isStarter) {
                teamStarters[index] = ownerTeamPlayers[i];
            }
        }

        return teamStarters;
    }

    function queryCurrentMatch(address _owner) view public returns (string) {
        if (matchArray.length == 0 || matchArray[matchArray.length - 1].status == MatchStatus.FINISHED) {
            return "NO_MATCH";
        } else if (matchArray[matchArray.length - 1].player1 == _owner) {
            return "ME_WAITING";
        } else {
            return "OTHER_WAITING";
        }
    }

    function queryMyLatestMatchResult(address _owner) view public returns (address, string) {
        MatchInfo storage latestMatch = matchArray[matchArray.length - 1];
        if (uint(latestMatch.status) == 1) {
            if (latestMatch.player1Result[_owner] == MatchResult.WIN) {
                return (latestMatch.player2, "LOSE");
            } else if (latestMatch.player1Result[_owner] == MatchResult.TIE) {
                return (latestMatch.player2, "TIE");
            } else {
                return (latestMatch.player2, "WIN");
            }
        } else {
            return (address(0), "WAITING");
        }
    }

}