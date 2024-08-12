/*
 * @Describle:
 * @Author: actopas <fishmooger@gmail.com>
 * @Date: 2024-08-12 22:44:32
 * @LastEditors: actopas
 * @LastEditTime: 2024-08-12 23:18:39
 */
import React, { useState } from "react";
import { Input, Select, Button } from "antd";
import { DownCircleOutlined } from "@ant-design/icons";
const { Option } = Select;
const Home: React.FC = () => {
  const [sourceValue, setSourceValue] = useState<number>();
  const [targetValue, setTargetValue] = useState<number>();
  const [sourceCurrency, setSourceCurrency] = useState<string>("ETH");
  const [targetCurrency, setTargetCurrency] = useState<string>("ETH");

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
  return (
    <div className="w-screen h-screen flex justify-center items-center font-mono">
      <div className="h-1/2 w-full flex justify-around items-center flex-col">
        <div className="font-bold text-3xl">
          A Decentralized Exchange Platform
        </div>
        <div className="w-full h-1/2 flex justify-around items-center flex-col">
          <div>
            <Input
              size="large"
              value={sourceValue}
              onChange={handleSourceValueChange}
              addonAfter={selectSource}
              defaultValue=""
            />
          </div>
          <div>
            <DownCircleOutlined className="text-3xl" onClick={handleSwap} />
          </div>
          <div>
            <Input
              size="large"
              value={targetValue}
              onChange={handleTargetValueChange}
              addonAfter={selectTarget}
              defaultValue=""
            />
          </div>
          <Button className="w-[271px]" onClick={handleExchange}>
            EXCHANGE
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
