// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockPriceFeed {
    uint private price;

    // 设置模拟价格
    function setPrice(uint _price) public {
        price = _price;
    }

    // 获取模拟价格
    function getPrice() public view returns (uint) {
        return price;
    }
}
