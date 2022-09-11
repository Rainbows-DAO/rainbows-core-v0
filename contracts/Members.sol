// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9; 

import "@openzeppelin/contracts/access/Ownable.sol";

contract Members is Ownable {

    uint256 public count = 0;

    struct Membership {
        bool exists;
    }

    mapping(address => Membership) memberships;

    function add(address member) public onlyOwner {
        require(member != address(0), "member cannot be the zero address");
        count += 1;
        memberships[member] = Membership(true);
    }

    function remove(address member) public onlyOwner {
        require(isMember(member), "must be a member to remove");
        count -= 1;
        delete memberships[member];
    }

    function isMember(address account) public view returns (bool) {
        return memberships[account].exists;
    }

}
