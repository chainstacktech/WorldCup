import "../stylesheets/team.css";

import { default as Web3 } from 'web3';
import { default as contract } from 'truffle-contract';

import game_artifacts from '../../build/contracts/WorldCup.json';

var Game = contract(game_artifacts);

var tokenPrice = null;

$(document).ready(function () {

    if (typeof web3 !== 'undefined') {
        console.warn("Using web3 detected from external source like Metamask")
        window.web3 = new Web3(web3.currentProvider);
    } else {
        console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
        window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    Game.setProvider(web3.currentProvider);

    populateTokenData();
    initSettingPage();
});

function initSettingPage() {
    getOwnerOwnedPlayers().then(res => {
        //玩家已经初始化了一支球队
        if (res.length > 0) {
            let promArr = [];
            for (let i = 0; i < res.length; i++) {
                promArr.push(getPlayerInfo(res[i]));
            }

            Promise.all(promArr)
                .then(playerList => {
                    let starterList = playerList.filter(playerInfo => {
                        return playerInfo.isStarter;
                    });

                    let backupList = playerList.filter(playerInfo => {
                        return !playerInfo.isStarter;
                    });

                    let count = 1;
                    for (let i = 0; i < starterList.length; i++) {
                        let row = generatePlayerRow(starterList[i], count);
                        $("#starter-player-list").append(row);
                        count++;
                    }

                    for (let i = 0; i < backupList.length; i++) {
                        let row = generatePlayerRow(backupList[i], count);
                        $("#backup-player-list").append(row);
                        count++;
                    }
                });
        }
    });

    getOwnerCountry().then(res => {
        let countryUrl = "./images/country/" + res + ".jpg";
        $("#team-header").append('<img class="country-icon" src="' + countryUrl + '" />');
    });

}

function getOwnerCountry() {
    return Game.deployed().then(contractInstance => {
        return contractInstance.getCountry($.cookie("address"));
    })
}

//获取玩家的球员列表
function getOwnerOwnedPlayers() {
    return Game.deployed().then(contractInstance => {
        return contractInstance.getOwnerOwnedPlayers.call($.cookie("address"));
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
    let btnText = playerInfo.isStarter ? "放到替补" : "加入首发";
    return (
        `<li class="player-row">
            <span class="number">`+ index + `</span>
            <img class="face-img" src="./images/face/people_face_`+ generatePlayerFacePath(playerInfo.dna) + `.png" />
            <span class="personal">`+ playerInfo.name + `</span>
            <span class="power">`+ playerInfo.power + `</span>
            <button class="sell-player-btn" onclick="sellPlayer(`+ playerInfo.id + `)">交易球员</button>
            <button class="toggle-player-starter-btn" onclick="togglePlayerStarterStatus(`+ playerInfo.id + `,` + playerInfo.isStarter + `)">` + btnText + `</button>
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
            return contractInstance.setPlayerAsStarter(playerId, { from: $.cookie("address"), gas: 4700000 });
        } else {
            return contractInstance.removePlayerFromStarter(playerId, { from: $.cookie("address"), gas: 4700000 });
        }
    })
        .then(() => {
            alert("success");
        })
}

window.sellPlayer = function (playerId) {
    Game.deployed().then(contractInstance => {
        return contractInstance.sellPlayer(playerId, { from: $.cookie("address"), gas: 4700000 });
    })
        .then(() => {
            alert("success");
        })
}

window.createRandomPlayer = function () {
    let playerName = $(".create-player-name").val();

    Game.deployed().then(contractInstance => {
        return contractInstance.createPlayerByToken(playerName, false, { from: $.cookie("address"), gas: 4700000 });
    })
        .then(res => {
            JSON.stringify(res, null, 4);
            if (res.receipt.status == "0x1") {
                let playerInfo = generateNewGeneratedPlayer(res.logs[0].args);
                $(".create-player-container").append(playerInfo);
            }
        })
}

function populateTokenData() {
    Game.deployed().then(contractInstance => {
        contractInstance.tokenPrice()
            .then(res => {
                tokenPrice = parseFloat(web3.fromWei(res.toString()));
                $("#token-cost").html(tokenPrice + " Ether");
            });
        contractInstance.getBalanceOf.call($.cookie("address"))
            .then(res => {
                $("#account-balance").html(res.toString());
            })
    });
}

window.buyTokens = function () {
    let tokensToBuy = $("#buy").val();
    let price = tokensToBuy * tokenPrice;
    $("#buy-msg").html("Purchase order has been submitted. Please wait.");
    Game.deployed().then(contractInstance => {
        contractInstance.buy({ value: web3.toWei(price, 'ether'), from: $.cookie("address") })
            .then(v => {
                $("#buy-msg").html("");
                populateTokenData();
            })
    });
}