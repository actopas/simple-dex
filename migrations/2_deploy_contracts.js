/*
 * @Describle:
 * @Author: actopas <fishmooger@gmail.com>
 * @Date: 2024-08-12 22:20:45
 * @LastEditors: actopas
 * @LastEditTime: 2024-08-13 02:30:04
 */
const Dex = artifacts.require("Dex");
const TokenA = artifacts.require("TokenA");
const TokenB = artifacts.require("TokenB");

module.exports = async function (deployer) {
  const initialSupply = 1000000;
  await deployer.deploy(TokenA, initialSupply);
  const tokenA = await TokenA.deployed();
  await deployer.deploy(TokenB, initialSupply);
  const tokenB = await TokenB.deployed();
  await deployer.deploy(Dex);
};
