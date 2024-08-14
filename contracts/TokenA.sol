// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenA is ERC20, Ownable {
    constructor(
        uint256 initialSupply
    ) ERC20("TokenA", "TKA") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * (10 ** uint256(decimals())));
    }
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
