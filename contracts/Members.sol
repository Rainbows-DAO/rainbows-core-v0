// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9; 

import "@openzeppelin/contracts/access/Ownable.sol";

contract Members is Ownable {

    struct Membership {
        bool exists;
    }

    mapping(address => Membership) memberships;

    function add(address member) public onlyOwner {
        require(member != address(0), "member cannot be the zero address");
        memberships[member] = Membership(true);
    }

    function remove(address member) public onlyOwner {
        delete memberships[member];
    }

    function isMember(address account) public view returns (bool) {
        return memberships[account].exists;
    }

}