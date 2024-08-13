/*
 * @Describle:
 * @Author: actopas <fishmooger@gmail.com>
 * @Date: 2024-08-12 22:44:32
 * @LastEditors: actopas
 * @LastEditTime: 2024-08-14 02:20:22
 */
import React, { useState, useEffect } from "react";
import { Input, Select, Button, Tabs, Dropdown } from "antd";
import { DownCircleOutlined } from "@ant-design/icons";
import Web3 from "web3";
const { Option } = Select;
const web3 = new Web3(window.ethereum);
const Home: React.FC = () => {
  const [account, setAccount] = useState<String>("");
  const [abi, setAbi] = useState([]);
  const [contract, setContract] = useState(null);
  const [sourceValue, setSourceValue] = useState<number>();
  const [targetValue, setTargetValue] = useState<number>();
  const [sourceCurrency, setSourceCurrency] = useState<string>("ETH");
  const [targetCurrency, setTargetCurrency] = useState<string>("ETH");
  const [activeKey, setActiveKey] = useState("1");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");

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
  const handleExchange = () => {};
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
      defaultValue="ETH"
      value={sourceCurrency}
      onChange={handleSourceCurrencyChange}
    >
      <Option value="ETH">ETH</Option>
      <Option value="BTC">BTC</Option>
    </Select>
  );

  const selectTarget = (
    <Select
      defaultValue="ETH"
      value={targetCurrency}
      onChange={handleTargetCurrencyChange}
    >
      <Option value="ETH">ETH</Option>
      <Option value="BTC">BTC</Option>
    </Select>
  );
  const tabContent = (
    <div className="flex flex-col items-center w-full">
      <Input
        size="large"
        value={sourceValue}
        onChange={handleSourceValueChange}
        addonAfter={selectSource}
      />
      <DownCircleOutlined className="text-3xl my-4" onClick={handleSwap} />
      <Input
        size="large"
        value={targetValue}
        onChange={handleTargetValueChange}
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
      <Button className="w-[271px] mt-4" onClick={handleExchange}>
        EXCHANGE
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
