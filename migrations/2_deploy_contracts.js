/*
 * @Describle:
 * @Author: actopas <fishmooger@gmail.com>
 * @Date: 2024-08-12 22:20:45
 * @LastEditors: actopas
 * @LastEditTime: 2024-08-13 23:14:19
 */
const MockPriceFeed = artifacts.require("MockPriceFeed");
const TokenA = artifacts.require("TokenA");
const TokenB = artifacts.require("TokenB");
const Dex = artifacts.require("Dex");

module.exports = async function (deployer) {
  await deployer.deploy(MockPriceFeed);
  const initialSupply = 1000000;
  await deployer.deploy(TokenA, MockPriceFeed.address, initialSupply);
  const tokenA = await TokenA.deployed();
  await deployer.deploy(TokenB, initialSupply);
  const tokenB = await TokenB.deployed();
  await deployer.deploy(Dex, tokenA.address, tokenB.address);
};
