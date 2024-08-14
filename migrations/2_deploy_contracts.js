/*
 * @Describle:
 * @Author: actopas <fishmooger@gmail.com>
 * @Date: 2024-08-12 22:20:45
 * @LastEditors: actopas
 * @LastEditTime: 2024-08-15 06:24:12
 */
import { deployProxy } from "@openzeppelin/hardhat-upgrades";
const TokenA = artifacts.require("TokenA");
const TokenB = artifacts.require("TokenB");
const LPToken = artifacts.require("LPToken");
const Dex = artifacts.require("Dex");

module.exports = async function (deployer) {
  const initialSupply = 1000000;
  await deployer.deploy(LPToken);
  const lpToken = await LPToken.deployed();
  await deployer.deploy(TokenA, initialSupply);
  const tokenA = await TokenA.deployed();
  await deployer.deploy(TokenB, initialSupply);
  const tokenB = await TokenB.deployed();
  const dex = await deployProxy(Dex, [
    tokenA.address,
    tokenB.address,
    lpToken.address,
  ]);
  await lpToken.setAdmin(dex.address);
};
