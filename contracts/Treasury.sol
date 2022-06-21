// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./CrowdFund.sol";

contract Treasury is Ownable {

    IERC20 unit;

    CrowdFund public fundraiser;

    event UnitTransfer(address to, uint256 amount);

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

    function transfer(uint256 amount, address payee) public onlyOwner {
        require(payee != address(0), "can't transfer to address 0");
        unit.transfer(payee, amount);
        emit UnitTransfer(payee, amount);
    }

}