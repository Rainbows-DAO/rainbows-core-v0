// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface ILoop {
    function join() external;
    function leave() external;
    function isMember(address account) external view returns (bool);
}