/*
 * @Describle:
 * @Author: actopas <fishmooger@gmail.com>
 * @Date: 2024-08-12 22:44:32
 * @LastEditors: actopas
 * @LastEditTime: 2024-08-15 00:47:46
 */
import React, { useState, useEffect } from "react";
import { Input, Select, Button, Tabs, Dropdown } from "antd";
import { DownCircleOutlined } from "@ant-design/icons";
import Dex from "../contracts/Dex.json";
import TokenA from "../contracts/TokenA.json";
import TokenB from "../contracts/TokenB.json";
import Web3 from "web3";

interface Token {
  name: string;
  address: string;
}
const { Option } = Select;
const web3 = new Web3(window.ethereum);
const tokenDecimals = 18;
const dexAddress = "0x4B4Eea2bc7f623B6F468c29a12E14c6D7DD3CBFA";
const tokenAAddress = "0x23376399E6C1a177EC283332DC7ec79F7be34526";
const tokenBAddress = "0xb0d461B4FDb0Efac94A5d13B36FBdf9e6Bdd7d90";
const tokenList: Token[] = [
  { name: "tokenA", address: "0x23376399E6C1a177EC283332DC7ec79F7be34526" },
  {
    name: "tokenB",
    address: "0xb0d461B4FDb0Efac94A5d13B36FBdf9e6Bdd7d90",
  },
];
const contractDex = new web3.eth.Contract(Dex.abi, dexAddress);
const contractTokenA = new web3.eth.Contract(TokenA.abi, tokenAAddress);
const contractTokenB = new web3.eth.Contract(TokenB.abi, tokenBAddress);
const Home: React.FC = () => {
  const [account, setAccount] = useState<string>("");
  const [sourceValue, setSourceValue] = useState<number>();
  const [targetValue, setTargetValue] = useState<number>();
  const [sourceCurrency, setSourceCurrency] = useState<string>(
    tokenList[0].address
  );
  const [targetCurrency, setTargetCurrency] = useState<string>(
    tokenList[1].address
  );
  const [activeKey, setActiveKey] = useState("1");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");

  const handleValueChange = async (
    scene: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSourceValue(Number(event.target.value));
    try {
      const amountInWei = web3.utils.toWei(
        event.target.value.toString(),
        "ether"
      );
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
          : await contractDex.methods.calculateLiquidityToAdd(
              targetCurrency,
              sourceCurrency,
              amountInWei
            );
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
  const handleSwap = () => {
    // 交换 source 和 target 的值
    const tempValue = sourceValue;
    const tempCurrency = sourceCurrency;

    setSourceValue(targetValue);
    setSourceCurrency(targetCurrency);

    setTargetValue(tempValue);
    setTargetCurrency(tempCurrency);
  };
  const handleExchange = async () => {
    if (!sourceValue) return;
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
      console.log("交换成功", exchange);
    } catch (error) {
      console.error("交换失败", error);
    }
  };
  const handleApplyLiquidity = async () => {
    if (!sourceCurrency || !targetCurrency) return;

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
        .calculateLiquidityToAdd(
          sourceCurrency,
          targetCurrency,
          amountAInWei,
          amountBInWei
        )
        .send({ from: account });

      console.log("流动性添加成功", liquidityResult);
    } catch (error) {
      console.error("添加流动性失败", error);
    }
  };
  function toTokenUnit(amount: number, decimals: number) {
    return amount * Math.pow(10, decimals);
  }
  const onChange = (key: string) => {
    setActiveKey(key);
  };
  const handleSetMinValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMinValue(event.target.value);
  };
  const handleSetMaxValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaxValue(event.target.value);
  };
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
        value={sourceValue}
        onChange={handleSourceValueChange}
        onBlur={(event) => handleValueChange("source", event)}
        addonAfter={selectSource}
      />
      <DownCircleOutlined className="text-3xl my-4" onClick={handleSwap} />
      <Input
        size="large"
        value={targetValue}
        onChange={handleTargetValueChange}
        onBlur={(event) => handleValueChange("target", event)}
        addonAfter={selectTarget}
      />
      {activeKey === "2" ? (
        <>
          <Input
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
          />
        </>
      ) : (
        ""
      )}
      <Button
        className="w-[301px] mt-4"
        onClick={activeKey === "1" ? handleExchange : handleApplyLiquidity}
      >
        {activeKey === "1" ? "SWAP" : "APPLY"}
      </Button>
    </div>
  );
  const tabItems = [
    {
      label: "Exchange",
      key: "1",
      children: activeKey === "1" ? tabContent : "",
    },
    {
      label: "Liquidity",
      key: "2",
      children: activeKey === "2" ? tabContent : "",
    },
  ];
  return (
    <div className="w-screen h-screen flex items-center flex-col font-mono">
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
      <div className="h-1/2 w-full flex justify-around items-center flex-col">
        <div className="font-bold text-3xl">
          A Decentralized Exchange Platform
        </div>
        <div className="w-full h-1/2 flex justify-around items-center flex-col">
          <Tabs onChange={onChange} type="card" items={tabItems} />
        </div>
      </div>
    </div>
  );
};

export default Home;
