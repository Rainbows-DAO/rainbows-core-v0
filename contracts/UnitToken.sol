// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract UnitToken is ERC20 {
    constructor() ERC20("Unit", "UNT") {}

    function mint(uint256 amount) external {
        _mint(msg.sender, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}