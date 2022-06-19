// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GovernanceToken is ERC20Votes, Ownable {

  constructor() ERC20("GovernanceToken", "GT") ERC20Permit("GovernanceToken") {}

  function _afterTokenTransfer(address from, address to, uint256 amount) internal override(ERC20Votes) {
    super._afterTokenTransfer(from, to, amount);
  }

  function _mint(address to, uint256 amount) internal override(ERC20Votes) {
    super._mint(to, amount);
  }

  function _burn(address account, uint256 amount) internal override(ERC20Votes) {
    super._burn(account, amount);
  }

  function mint(address account) external onlyOwner {
    _mint(account, 1);
  }

  function burn(address account) external onlyOwner {
    _burn(account, 1);
  }

}
