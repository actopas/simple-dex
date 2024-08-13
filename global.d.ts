/*
 * @Describle:
 * @Author: actopas <fishmooger@gmail.com>
 * @Date: 2024-08-14 02:03:07
 * @LastEditors: actopas
 * @LastEditTime: 2024-08-14 02:17:42
 */
interface Window {
  ethereum?: {
    isMetaMask?: true;
    request: (...args: any[]) => Promise<any>;
    on?: (event: string, listener: (...args: any[]) => void) => void;
    removeListener?: (
      event: string,
      listener: (...args: any[]) => void
    ) => void;
  };
  web3?: Web3;
}
