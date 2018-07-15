var PlayerFactory = artifacts.require("./PlayerFactory.sol");
var TeamSetting = artifacts.require("./TeamSetting.sol");
var Match = artifacts.require("./Match.sol");
var WorldCup = artifacts.require("./WorldCup.sol");

module.exports = function (deployer) {
  deployer.deploy(WorldCup, 10000, web3.toWei('0.000000001', 'ether'), { gas: 6700000 });
};