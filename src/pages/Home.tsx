/*
 * @Describle:
 * @Author: actopas <fishmooger@gmail.com>
 * @Date: 2024-08-12 22:44:32
 * @LastEditors: actopas
 * @LastEditTime: 2024-08-15 17:16:45
 */
import React, { useState, useEffect } from "react";
import {
  Input,
  Select,
  Button,
  Tabs,
  Dropdown,
  Alert,
  notification,
} from "antd";
import { DownOutlined } from "@ant-design/icons";
import backgroundImage from "../assets/bcg-img.jpg";
import Dex from "../contracts/Dex.json";
import TokenA from "../contracts/TokenA.json";
import TokenB from "../contracts/TokenB.json";
import Web3 from "web3";

interface Token {
  name: string;
  address: string;
}
type NotificationType = "success" | "info" | "warning" | "error";

const { Option } = Select;
const web3 = new Web3(window.ethereum);
const tokenDecimals = 18;
const dexAddress = "0xe3ac6dC1cab8B20f362c4299bB8A9f6c5De88A6F";
const tokenAAddress = "0x8D53EC07411aeb9A61A9d92f0e72A0ADC59Ae833";
const tokenBAddress = "0x7c60DB5C067F3eAf5f3618D39736c00D8071c153";
const tokenList: Token[] = [
  { name: "tokenA", address: "0x8D53EC07411aeb9A61A9d92f0e72A0ADC59Ae833" },
  {
    name: "tokenB",
    address: "0x7c60DB5C067F3eAf5f3618D39736c00D8071c153",
  },
];
const contractDex = new web3.eth.Contract(Dex.abi, dexAddress);
const contractTokenA = new web3.eth.Contract(TokenA.abi, tokenAAddress);
const contractTokenB = new web3.eth.Contract(TokenB.abi, tokenBAddress);
const Home: React.FC = () => {
  const [api, contextHolder] = notification.useNotification();
  const [account, setAccount] = useState<string>("");
  const [sourceValue, setSourceValue] = useState<number>();
  const [targetValue, setTargetValue] = useState<number>();
  const [sourceCurrency, setSourceCurrency] = useState<string>(
    tokenList[0].address
  );
  const [targetCurrency, setTargetCurrency] = useState<string>(
    tokenList[1].address
  );
  const [activeKey, setActiveKey] = useState<string>("1");
  const [lpToken, setLpToken] = useState<number>();
  // const [minValue, setMinValue] = useState("");
  // const [maxValue, setMaxValue] = useState("");

  const handleValueChange = async (
    scene: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (sourceCurrency === targetCurrency) return;
    if (
      (scene === "source" && !sourceValue) ||
      (scene === "target" && !targetValue)
    )
      return;
    try {
      const amountInWei = web3.utils.toWei(
        event.target.value.toString(),
        "ether"
      );
      console.log(sourceCurrency, targetCurrency, amountInWei, "seecurrency");
      const amountOut =
        activeKey === "1"
          ? scene === "source"
            ? await contractDex.methods
                .getAmountOut(amountInWei, sourceCurrency, targetCurrency)
                .call()
            : await contractDex.methods
                .getAmountOut(amountInWei, targetCurrency, sourceCurrency)
                .call()
          : scene === "source"
          ? await contractDex.methods
              .calculateLiquidityToAdd(
                sourceCurrency,
                targetCurrency,
                amountInWei
              )
              .call()
          : await contractDex.methods
              .calculateLiquidityToAdd(
                targetCurrency,
                sourceCurrency,
                amountInWei
              )
              .call();
      if (amountOut) {
        const amountOutFixed = parseFloat(
          Number(web3.utils.fromWei(amountOut.toString(), "ether")).toFixed(2)
        );
        console.log(amountOut, amountOutFixed);
        scene === "source"
          ? setTargetValue(amountOutFixed)
          : setSourceValue(amountOutFixed);
      }
    } catch (error) {
      console.log(error, "error");
    }
  };
  const handleSourceValueChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSourceValue(Number(event.target.value));
  };
  const handleTargetValueChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTargetValue(Number(event.target.value));
  };
  const handleSourceCurrencyChange = (value: string) => {
    setSourceCurrency(value);
  };

  const handleTargetCurrencyChange = (value: string) => {
    setTargetCurrency(value);
  };
  // const handleSwap = () => {
  //   // 交换 source 和 target 的值
  //   const tempValue = sourceValue;
  //   const tempCurrency = sourceCurrency;

  //   setSourceValue(targetValue);
  //   setSourceCurrency(targetCurrency);

  //   setTargetValue(tempValue);
  //   setTargetCurrency(tempCurrency);
  // };
  const handleSwap = async () => {
    if (!sourceValue) return;
    if (sourceCurrency === targetCurrency) return;
    if (!account) {
      return openNotification("warning", "Please Connect Wallet first", "");
    }
    const amountInWei = web3.utils.toWei(sourceValue.toString(), "ether");
    sourceCurrency === tokenAAddress
      ? await contractTokenA.methods
          .approve(dexAddress, amountInWei)
          .send({ from: account })
      : await contractTokenB.methods
          .approve(dexAddress, amountInWei)
          .send({ from: account });
    try {
      console.log(sourceCurrency, targetCurrency, amountInWei);
      const exchange = await contractDex.methods
        .swap(sourceCurrency, targetCurrency, amountInWei)
        .send({ from: account });
      openNotification("success", "Swap success", "");
      console.log("交换成功", exchange);
    } catch (error) {
      openNotification("error", "Swap failed", error);
      console.error("交换失败", error);
    }
  };
  const handleAddLiquidity = async () => {
    if (!sourceCurrency || !targetCurrency) return;
    if (!account) {
      return openNotification("warning", "Please Connect Wallet first", "");
    }
    // 将代币数量从以太转换为Wei
    const amountAInWei = toTokenUnit(sourceValue || 0, tokenDecimals);
    const amountBInWei = toTokenUnit(targetValue || 0, tokenDecimals);

    // 首先，需要为两种代币授权DEX合约操作这些代币
    try {
      console.log(sourceCurrency, targetCurrency, amountAInWei, amountBInWei);
      await contractTokenA.methods
        .approve(dexAddress, amountAInWei)
        .send({ from: account });
      await contractTokenB.methods
        .approve(dexAddress, amountBInWei)
        .send({ from: account });

      // 调用DEX合约的addLiquidity方法
      const liquidityResult = await contractDex.methods
        .addLiquidity(
          sourceCurrency,
          targetCurrency,
          amountAInWei,
          amountBInWei
        )
        .send({ from: account });
      openNotification("success", "Add liquidity success", "");
      console.log("流动性添加成功", liquidityResult);
    } catch (error) {
      openNotification("error", "Add liquidity failed", error);
      console.error("Add liquidity failed", error);
    }
  };
  const handleRemoveLiquidity = async () => {
    if (!sourceCurrency || !targetCurrency) return;
    if (!account) {
      return openNotification("warning", "Please Connect Wallet first", "");
    }
    const LpInWei = toTokenUnit(lpToken || 0, tokenDecimals);
    try {
      const removeLiquidityResult = await contractDex.methods
        .removeLiquidity(sourceCurrency, targetCurrency, LpInWei)
        .send({ from: account });
      openNotification("success", "Remove liquidity success", "");
      console.log(removeLiquidityResult, "result");
    } catch (error) {
      openNotification("error", "Remove liquidity failed", error);
      console.log("移除流动性失败", error);
    }
  };
  function toTokenUnit(amount: number, decimals: number) {
    return amount * Math.pow(10, decimals);
  }
  const handleTabChange = (key: string) => {
    setActiveKey(key);
    setSourceValue(undefined);
    setTargetValue(undefined);
  };
  // const handleSetMinValue = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setMinValue(event.target.value);
  // };
  // const handleSetMaxValue = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   setMaxValue(event.target.value);
  // };
  const linkMetaMask = async () => {
    // 检查 MetaMask 是否已安装
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
        // 请求用户连接 MetaMask
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        // 保存地址并更新UI
        setAccount(account);
        localStorage.setItem("userAddress", account);
      } catch (error) {
        openNotification("error", "User denied account access", error);
        console.error(error, "User denied account access");
      }
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.log(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  };
  const shortenAddress = (address: any, length = 4) => {
    if (!address) return "";
    const start = address.substring(0, length + 2); // 加2是因为包括 "0x"
    const end = address.substring(address.length - length);
    return `${start}...${end}`;
  };
  const disconnectAccount = () => {
    setAccount("");
    localStorage.removeItem("userAccount");
  };
  const openNotification = (
    type: NotificationType,
    message: string,
    description: any
  ) => {
    api[type]({
      message,
      description,
    });
  };
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          localStorage.setItem("userAccount", accounts[0]);
        } else {
          setAccount("");
          localStorage.removeItem("userAccount");
        }
      };

      // 监听账户变更
      if (window.ethereum.on) {
        window.ethereum.on("accountsChanged", handleAccountsChanged);
      }

      // 清除监听器
      return () => {
        if (window.ethereum && window.ethereum.removeListener) {
          window.ethereum.removeListener(
            "accountsChanged",
            handleAccountsChanged
          );
        }
      };
    }
  }, []);
  const selectSource = (
    <Select
      defaultValue={tokenList[0].address}
      value={sourceCurrency}
      onChange={handleSourceCurrencyChange}
    >
      {tokenList.map((item) => {
        return (
          <>
            <Option value={item.address}>{item.name}</Option>
          </>
        );
      })}
    </Select>
  );

  const selectTarget = (
    <Select
      defaultValue={tokenList[1].address}
      value={targetCurrency}
      onChange={handleTargetCurrencyChange}
    >
      {tokenList.map((item) => {
        return (
          <>
            <Option value={item.address}>{item.name}</Option>
          </>
        );
      })}
    </Select>
  );
  const tabContent = (
    <div className="flex flex-col items-center w-full">
      <Input
        size="large"
        type="number"
        step="any"
        value={sourceValue}
        onChange={handleSourceValueChange}
        onBlur={(event) => handleValueChange("source", event)}
        addonAfter={selectSource}
      />
      {activeKey === "1" ? (
        <DownOutlined className="text-3xl my-4" />
      ) : (
        <div className="mb-6"></div>
      )}

      <Input
        size="large"
        type="number"
        step="any"
        value={targetValue}
        onChange={handleTargetValueChange}
        onBlur={(event) => handleValueChange("target", event)}
        addonAfter={selectTarget}
      />
      {sourceCurrency === targetCurrency ? (
        <Alert
          className="mt-3"
          message="Source Token can not same with Target Token"
          type="error"
        />
      ) : (
        ""
      )}
      {activeKey === "2" ? (
        <>
          {/* <Input
            className="mt-3"
            size="large"
            addonBefore={"Min"}
            value={minValue}
            onChange={handleSetMinValue}
          />
          <Input
            className="mt-3"
            size="large"
            addonBefore={"Max"}
            value={maxValue}
            onChange={handleSetMaxValue}
          /> */}
        </>
      ) : (
        ""
      )}
      <Button
        className="w-[300px] mt-4"
        onClick={activeKey === "1" ? handleSwap : handleAddLiquidity}
      >
        {activeKey === "1" ? "SWAP" : "ADD LIQUIDITY"}
      </Button>
      {activeKey === "2" ? (
        <>
          <Input
            className="mt-3"
            size="large"
            type="number"
            step="any"
            addonBefore={"LP"}
            addonAfter={
              <p className="cursor-pointer" onClick={handleRemoveLiquidity}>
                Extract
              </p>
            }
            value={lpToken}
            onChange={(e) => {
              setLpToken(Number(e.target.value));
            }}
          />
        </>
      ) : (
        ""
      )}
    </div>
  );
  const tabItems = [
    {
      label: "Swap",
      key: "1",
      children: activeKey === "1" ? tabContent : "",
    },
    {
      label: "Pool",
      key: "2",
      children: activeKey === "2" ? tabContent : "",
    },
  ];
  return (
    <div
      className="w-screen h-screen flex items-center flex-col font-mono bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {contextHolder}
      <div className="w-screen h-14 flex justify-end items-center pl-4 pr-4">
        {!account ? (
          <Button className="" onClick={linkMetaMask}>
            Connect Wallet
          </Button>
        ) : (
          <div>
            <span>Connect as </span>
            <Dropdown
              overlay={<Button onClick={disconnectAccount}>Disconnect</Button>}
              placement="bottom"
              arrow
            >
              <Button>{shortenAddress(account)}</Button>
            </Dropdown>
          </div>
        )}
      </div>
      <div className="h-2/3 w-full flex justify-around items-center flex-col">
        <div className="h-full font-bold text-3xl flex justify-center items-center">
          A Decentralized Swap Platform
        </div>
        <div className="w-full h-full flex justify-around items-center flex-col">
          <Tabs
            className="w-[350px] min-h-[300px] bg-white p-[20px] rounded-3xl"
            onChange={handleTabChange}
            type="card"
            items={tabItems}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
