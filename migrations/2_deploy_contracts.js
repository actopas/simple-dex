/*
 * @Describle:
 * @Author: actopas <fishmooger@gmail.com>
 * @Date: 2024-08-12 22:20:45
 * @LastEditors: actopas
 * @LastEditTime: 2024-08-15 00:53:55
 */
const TokenA = artifacts.require("TokenA");
const TokenB = artifacts.require("TokenB");
const Dex = artifacts.require("Dex");

module.exports = async function (deployer) {
  const initialSupply = 1000000;
  await deployer.deploy(TokenA, initialSupply);
  const tokenA = await TokenA.deployed();
  await deployer.deploy(TokenB, initialSupply);
  const tokenB = await TokenB.deployed();
  await deployer.deploy(Dex, tokenA.address, tokenB.address);
};
