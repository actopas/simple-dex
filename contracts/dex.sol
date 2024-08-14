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
    uint public constant FEE_DENOMINATOR = 10000;
    uint public constant FEE = 30; // 0.3%

    constructor(address _tokenAAddress, address _tokenBAddress) {
        tokenA = IERC20(_tokenAAddress);
        tokenB = IERC20(_tokenBAddress);
    }
    function addToken(address token) public {
        tokenInfo[token] = TokenInfo(0, true);
    }
    // Liquidity
    function calculateLiquidityToAdd(
        address token1,
        address token2,
        uint amountA
    ) public view returns (uint amountB) {
        require(
            tokenInfo[token1].isListed && tokenInfo[token2].isListed,
            "Token not supported"
        );
        uint reserveA = tokenInfo[token1].reserve;
        uint reserveB = tokenInfo[token2].reserve;
        require(reserveA > 0, "No liquidity for token A");
        require(reserveB > 0, "No liquidity for token B");
        amountB = (reserveB * amountA) / reserveA;
    }

    function addLiquidity(
        address token1,
        address token2,
        uint256 amountA,
        uint256 amountB
    ) public {
        require(
            tokenInfo[token1].isListed && tokenInfo[token2].isListed,
            "Token not supported"
        );
        IERC20(token1).transferFrom(msg.sender, address(this), amountA);
        IERC20(token2).transferFrom(msg.sender, address(this), amountB);

        tokenInfo[token1].reserve += amountA;
        tokenInfo[token2].reserve += amountB;

        // LP token
    }
    function getReserves()
        public
        view
        returns (uint256 reserveA, uint256 reserveB)
    {
        return (tokenInfo[tokenA].reserve, tokenInfo[tokenB].reserve);
    }
    function getAmountOut(
        uint amountIn,
        address tokenIn,
        address tokenOut
    ) public view returns (uint amountOut) {
        require(
            tokenInfo[tokenIn].isListed && tokenInfo[tokenOut].isListed,
            "Token not supported"
        );

        uint reserveIn = tokenInfo[tokenIn].reserve;
        uint reserveOut = tokenInfo[tokenOut].reserve;

        require(amountIn > 0, "Invalid input amount");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");

        // 示例计算方法，忽略交易费用
        uint amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE);
        amountOut =
            (amountInWithFee * reserveOut) /
            (reserveIn * FEE_DENOMINATOR + amountInWithFee);
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

        uint256 amountInWithFee = (amountIn * (FEE_DENOMINATOR - FEE)) /
            FEE_DENOMINATOR;
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
