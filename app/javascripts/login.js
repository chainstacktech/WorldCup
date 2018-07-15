import "../stylesheets/login.css";

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
});

window.login = function () {
    let address = $(".address-input").val();
    $.cookie('address', address);

    playerAlreadyExist(address)
        .then(alreadyExist => {
            if (alreadyExist) {
                window.location.href = "team.html";
            } else {
                $("#login-box").hide();
                $("#init-box").css("display", "flex");
            }
        });
}

//获取玩家的球员列表
function playerAlreadyExist(address) {
    return Game.deployed().then(contractInstance => {
        return contractInstance.getOwnerOwnedPlayers.call(address)
            .then(res => {
                return res.length > 0;
            })
    })
}

window.createMyTeam = function() {
    let country = $("#country-selector").val();
    Game.deployed().then(contractInstance => {
        contractInstance.setCountry(country, {gas: 4700000, from: $.cookie("address")});
        return contractInstance;
    })
    .then((contractInstance) => {
        return contractInstance.initPlayers({gas: 4700000, from: $.cookie("address")});
    })
    .then(() => {
        alert("success");
        window.location.href = "team.html";
    })
}