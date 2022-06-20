// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./CrowdFund.sol";

contract Treasury is Ownable {

    IERC20 unit;

    CrowdFund public fundraiser;

    constructor(address _unit) {
        unit = IERC20(_unit);
        fundraiser = new CrowdFund(_unit);
    }

    function startFundraising(uint256 totalBudget) public onlyOwner {
        fundraiser.launch(totalBudget, uint32(block.timestamp + 1), uint32(block.timestamp + 100));
    }

    function claimFunds() public onlyOwner {
        fundraiser.claim(1);
    }

}