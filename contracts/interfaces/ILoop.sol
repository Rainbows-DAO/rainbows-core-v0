// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface ILoop {
    function join() external;
    function leave() external;
    function isMember(address account) external view returns (bool);
    function itemExists(uint256 itemId) external view returns (bool);
    function isImplementing() external view returns (bool);
    function withinBudget(uint256 itemId, uint256 cost) external view returns (bool);
}