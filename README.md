# WorldCup

该项目是基于以太坊实现的加密世界杯。

通过Solidity编写智能合约，前端通过Html,CSS,Jquery实现。

玩家在游戏中可以创建球队，生成球员，交易球员，与其他玩家进行比赛，购买Token等功能。


# 环境配置
1、安装Geth<br>
    Mac系统下:<br>
    brew tap ethereum/ethereum<br>
    brew install ethereum<br><br>
2、在以太坊测试网络中运行Geth<br>
    在rinkeby网络下运行<br>
    geth --rinkeby --syncmode "fast" --rpc --rpcapi db,eth,net,web3,personal --cache=1024 --rpcport 8545 --rpcaddr 127.0.0.1 --rpccorsdomain "*"<br><br>
3、安装Truffle<br>
    npm install -g truffle<br>
    npm install -g webpack<br><br>
4、使用Truffle初始化一个项目<br>
    truffle unbox webpack<br><br>
5、修改配置文件<br>
    Truffle.js 文件里的接口改成 8545<br>
    添加   gas: 6700000<br><br>
6、创建账户<br>
    web3.personal.newAccount(‘your_password’)<br>
    web3.eth.getBalance(‘your_address’)<br>
    web3.personal.unlockAccount(‘your_address’, ‘your_password’, duration)<br><br>
7、购买以太坊<br>
    https://faucet.rinkeby.io/<br><br>



#游戏的后期改进
1、引入ERC20，实现代币；或者引入REC721，将每一位球员都作为一个代币<br>
2、根据现有的DNA对球员生成个性化皮肤及其他属性<br>
3、球队PK算法的进一步优化<br>
4、查询玩家的历史战绩<br>
