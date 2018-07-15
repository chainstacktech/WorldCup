import "../stylesheets/match.css";

import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract';

import game_artifacts from '../../build/contracts/WorldCup.json';

var Game = contract(game_artifacts);

$(document).ready(function () {

    if (typeof web3 !== 'undefined') {
        console.warn("Using web3 detected from external source like Metamask")
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    Game.setProvider(web3.currentProvider);

    initMatchPage();
});

function initMatchPage() {
    Game.deployed().then(contractInstance => {
        contractInstance.queryCurrentMatch.call($.cookie("address"))
            .then(matchStatus => {
                if (matchStatus == "NO_MATCH") {
                    let attendBtn = '<button class="create-match-btn" onclick="createMatch()">发起比赛</button>';
                    $(".bar-mid").append(attendBtn);
                } else if (matchStatus == "ME_WAITING") {
                    initTeam($.cookie("address"), "left");
                    let waitingBtn = '<button class="waiting-match-btn">等待其他对手</button>';
                    $(".bar-mid").append(waitingBtn);
                    addMatchResultListener();
                } else if (matchStatus == "OTHER_WAITING") {
                    getWaitingPlayerAddress($.cookie("address"))
                        .then(otherAddress => {
                            initTeam(otherAddress, "left");
                            let matchCurrentPlayerBtn = '<button class="create-match-btn" onclick="matchCurrentPlayer()">加入比赛</button>';
                            $(".bar-mid").append(matchCurrentPlayerBtn);
                        })
                }
            })
    })
}

function attendMatch() {
    return Game.deployed().then(contractInstance => {
        return contractInstance.attendMatch({ from: $.cookie("address"), gas: 4700000 });
    })
        .then(res => {
            $("#result-text-1").empty();
            $("#result-text-2").empty();
            $("#matching-result-container").css("display", "flex");
            let result = res.logs[0].args;
            if ($.cookie("address") == result.player1) {
                if (result.player1Result == "WIN") {
                    $("#result-text-1").append("恭喜您!");
                    $("#result-text-2").append("赢下了本次比赛");
                } else if (result.player1Result == "TIE") {
                    $("#result-text-1").append("本次比赛结果为平局");
                } else {
                    $("#result-text-1").append("很遗憾");
                    $("#result-text-2").append("您在本次比赛中落败");
                }
            } else {
                if (result.player2Result == "WIN") {
                    $("#result-text-1").append("恭喜您!");
                    $("#result-text-2").append("赢下了本次比赛");
                } else if (result.player2Result == "TIE") {
                    $("#result-text-1").append("本次比赛结果为平局");
                } else {
                    $("#result-text-1").append("很遗憾");
                    $("#result-text-2").append("您在本次比赛中落败");
                }
            }

            setTimeout(() => {
                $("#matching-result-container").hide();
            }, 5000);
        })
}

window.createMatch = function () {
    return Game.deployed().then(contractInstance => {
        return contractInstance.attendMatch({ from: $.cookie("address"), gas: 4700000 });
    });
}

function initTeam(address, side) {
    getOwnerOwnedPlayers(address).then(res => {
        //玩家已经初始化了一支球队
        if (res.length > 0) {
            let promArr = [];
            for (let i = 0; i < res.length; i++) {
                promArr.push(getPlayerInfo(res[i]));
            }

            Promise.all(promArr)
                .then(playerList => {
                    insertTeamToContainer(playerList, side);
                });
        }
    });

    getOwnerCountry(address).then(res => {
        let countryUrl = "./images/country/" + res + ".jpg";
        let headerId = "#" + side + "-team-header";
        $(headerId).append('<img class="country-icon" src="' + countryUrl + '" />');
    });
}

function insertTeamToContainer(playerList, side) {
    let starterList = playerList.filter(playerInfo => {
        return playerInfo.isStarter;
    });

    let backupList = playerList.filter(playerInfo => {
        return !playerInfo.isStarter;
    });

    let count = 1;
    for (let i = 0; i < starterList.length; i++) {
        let row = generatePlayerRow(starterList[i], count);
        let playerListId = "#" + side + "-starter-player-list";
        $(playerListId).append(row);
        count++;
    }

    for (let i = 0; i < backupList.length; i++) {
        let row = generatePlayerRow(backupList[i], count);
        let playerListId = "#" + side + "-backup-player-list";
        $(playerListId).append(row);
        count++;
    }
}

function getOwnerCountry(address) {
    return Game.deployed().then(contractInstance => {
        return contractInstance.getCountry(address);
    })
}

//获取玩家的球员列表
function getOwnerOwnedPlayers(address) {
    return Game.deployed().then(contractInstance => {
        return contractInstance.getOwnerOwnedPlayers.call(address);
    })
}

//获取玩家的单个球员的详细信息
function getPlayerInfo(playerId) {
    return Game.deployed().then(contractInstance => {
        return contractInstance.getPlayerByPlayerId.call(playerId);
    })
        .then((res) => {
            return {
                "id": playerId,
                "name": res[0],
                "dna": Number(res[1]),
                "power": Number(res[2]),
                "isStarter": res[3]
            };
        })
}

function generatePlayerFacePath(dna) {
    let faceFeature = dna % 100;
    let facePath = parseInt((faceFeature / 2));
    facePath = facePath < 10 ? "0" + facePath : facePath;
    return facePath;
}

function generatePlayerRow(playerInfo, index) {
    return (
        `<li>
            <span class="number">`+ index + `</span>
            <img class="face-img" src="./images/face/people_face_`+ generatePlayerFacePath(playerInfo.dna) + `.png" />
            <span class="personal">`+ playerInfo.name + `</span>
            <span class="power">`+ playerInfo.power + `</span>
        </li>`
    );
}

function generateNewGeneratedPlayer(playerInfo) {
    return (
        `<div class="new-player-row">
            <img class="face-img" src="./images/face/people_face_`+ generatePlayerFacePath(playerInfo.dna) + `.png" />
            <div>`+ playerInfo.name + `</div>
            <div>`+ playerInfo.power + `</div>
        </div>`
    );
}

window.togglePlayerStarterStatus = function (playerId, isStarter) {
    Game.deployed().then(contractInstance => {
        if (!isStarter) {
            return contractInstance.setPlayerAsStarter($.cookie("address"), playerId, { from: $.cookie("address"), gas: 4700000 });
        } else {
            return contractInstance.removePlayerFromStarter($.cookie("address"), playerId, { from: $.cookie("address"), gas: 4700000 });
        }
    })
        .then(() => {
            alert("success");
        })
}

window.createRandomPlayer = function () {
    let playerName = $(".create-player-name").val();

    Game.deployed().then(contractInstance => {
        return contractInstance.createRandomPlayer(playerName, false, { from: $.cookie("address"), gas: 4700000 });
    })
        .then(res => {
            JSON.stringify(res, null, 4);
            if (res.receipt.status == "0x1") {
                let playerInfo = generateNewGeneratedPlayer(res.logs[0].args);
                $(".create-player-container").append(playerInfo);
            }
        })
}

function getWaitingPlayerAddress(address) {
    return Game.deployed().then(contractInstance => {
        return contractInstance.getOtherWaitingPlayerAddress.call(address);
    })
}

window.matchCurrentPlayer = function () {
    initTeam($.cookie("address"), "right");
    $("#matching-animation-container").show();
    attendMatch().then(() => {
        $("#matching-animation-container").hide();
    });
}

function addMatchResultListener() {
    let intervalId = setInterval(() => {
        Game.deployed().then(contractInstance => {
            return contractInstance.queryMyLatestMatchResult($.cookie("address"));
        })
            .then(res => {
                if (res != null && res.length == 2 && res[1] != "WAITING") {
                    clearInterval(intervalId);
                    initTeam(res[0], "right");

                    alert(res[1]);
                }
            });
    }, 2000)
}