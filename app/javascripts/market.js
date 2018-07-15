import "../stylesheets/market.css";

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
    initMarket();
});

function initMarket() {
    Game.deployed().then(contractInstance => {
        return contractInstance.onSalePlayers.call().then(res => {
            let promArr = [];
            for (let i = 0; i < res.length; i++) {
                if (res[i] != -1) {
                    promArr.push(getPlayerInfo(res[i]));
                }
            }

            Promise.all(promArr)
                .then(playersList => {
                    for (let i = 0; i < playersList.length; i++) {
                        let playerBoard = generatePlayerBoard(playersList[i]);
                        $(".players-container").append(playerBoard);
                    }
                });
        })
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

function generatePlayerBoard(playerInfo) {
    return (
        `<div class="player-board">
            <img class="player-cover" src="./images/face/people_face_` + generatePlayerFacePath(playerInfo.dna)+ `.png" />
            <div>` + playerInfo.name + `</div>
            <div>能力: `+ playerInfo.power +`</div>
            <button class="buy-player-btn" onclick="buyPlayer(`+ playerInfo.id +`)">购买</button>
        </div>`
    )
}

window.buyPlayer = function (playerId) {
    Game.deployed().then(contractInstance => {
        return contractInstance.buyPlayer(playerId, {from: $.cookie("address"), gas: 6700000});
    })
        .then(res => {
            alert("buy success");
        })
}