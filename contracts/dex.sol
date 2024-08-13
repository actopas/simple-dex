// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DEX {
    IERC20 public tokenA;
    IERC20 public tokenB;
    struct TokenInfo {
        uint256 reserve; // 代币的储备量
        bool isListed; // 代币是否已列入支持
    }
    mapping(address => TokenInfo) public tokenInfo;
    uint public constantFee = 30;

    constructor(address _tokenAAddress, address _tokenBAddress) {
        tokenA = IERC20(_tokenAAddress);
        tokenB = IERC20(_tokenBAddress);
    }
    function addToken(address token) public {
        tokenInfo[token] = TokenInfo(0, true);
    }
    // Liquidity
    function addLiquidity(address token, uint256 amount) public {
        require(tokenInfo[token].isListed, "Token not supported");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        tokenInfo[token].reserve += amount;
    }

    // function removeLiquidity() {}
    // swap
    function swap(address tokenIn, address tokenOut, uint256 amountIn) public {
        require(
            tokenInfo[tokenIn].isListed && tokenInfo[tokenOut].isListed,
            "One or both tokens not supported"
        );

        TokenInfo storage inInfo = tokenInfo[tokenIn];
        TokenInfo storage outInfo = tokenInfo[tokenOut];

        uint256 inBalance = inInfo.reserve;
        uint256 outBalance = outInfo.reserve;

        uint256 amountInWithFee = (amountIn * (10000 - constantFee)) / 10000;
        uint256 amountOut = (amountInWithFee * outBalance) /
            (inBalance + amountInWithFee);

        inInfo.reserve += amountIn;
        outInfo.reserve -= amountOut;

        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        IERC20(tokenOut).transfer(msg.sender, amountOut);
    }
    function getReserve(address token) public view returns (uint256) {
        require(tokenInfo[token].isListed, "Token not supported");
        return tokenInfo[token].reserve;
    }
}
