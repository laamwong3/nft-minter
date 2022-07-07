// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./Minter.sol";

contract MockContract {
    address private minterContract;

    constructor(address _minterContract) {
        minterContract = _minterContract;
    }

    function mintALot(uint256 _amount) external payable {
        Minter minter = Minter(minterContract);
        minter.mintNfts{value: msg.value}(_amount);
        // .mintNfts(_amount);
    }
}
