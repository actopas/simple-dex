/*
 * @Describle:
 * @Author: actopas <fishmooger@gmail.com>
 * @Date: 2024-08-12 22:20:45
 * @LastEditors: actopas
 * @LastEditTime: 2024-08-12 22:21:06
 */
const Dex = artifacts.require("Dex");

module.exports = function (deployer) {
  deployer.deploy(Dex);
};
