/*
 * @Describle:
 * @Author: actopas <fishmooger@gmail.com>
 * @Date: 2024-08-14 14:33:38
 * @LastEditors: actopas
 * @LastEditTime: 2024-08-14 14:56:33
 */
const TokenA = artifacts.require("TokenA");
const TokenB = artifacts.require("TokenB");
const Dex = artifacts.require("Dex");

module.exports = async function (callback) {
  try {
    const accounts = await web3.eth.getAccounts();
    const tokenA = await TokenA.deployed();
    const tokenB = await TokenB.deployed();
    const dex = await Dex.deployed();
    // add token
    await dex.addToken(tokenA.address);
    await dex.addToken(tokenB.address);
    // 铸造代币
    await tokenA.mint(accounts[0], web3.utils.toWei("1000"));
    await tokenB.mint(accounts[0], web3.utils.toWei("1000"));

    // 批准代币
    await tokenA.approve(dex.address, web3.utils.toWei("500"));
    await tokenB.approve(dex.address, web3.utils.toWei("500"));

    // 添加流动性
    await dex.addLiquidity(
      tokenA.address,
      tokenB.address,
      web3.utils.toWei("500"),
      web3.utils.toWei("500")
    );

    console.log("流动性已添加");
  } catch (error) {
    console.error("脚本执行出错:", error);
  }

  callback();
};
