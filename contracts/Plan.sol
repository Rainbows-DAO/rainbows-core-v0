// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ILoop.sol";


contract Plan is Ownable {
    
    struct Item {
        bool exists;
        string title;
        string description;
        uint256 budget;
        uint256 spent;
    }

    mapping(uint256 => Item) public items;

    uint256 public count = 0;

    bytes32 constant OPEN = keccak256("OPEN_STATE");
    bytes32 constant CLOSED = keccak256("CLOSED_STATE");

    bytes32 state;

    uint256 public totalBudget;

    event ItemAdded(uint256 itemId, string title, string description, uint256 budget);
    event ItemRemoved(uint256 itemId);

    modifier onlyMember {
        ILoop loop = ILoop(owner());
        require(loop.isMember(msg.sender), "must be a member");
        _;
    }

    constructor() {
        transferOwnership(msg.sender);
        state = OPEN;
        totalBudget = 0;
    }

    function close() public onlyOwner { 
        state = CLOSED;
    }

    function addItem(string memory title, string memory description, uint256 budget) external onlyMember { 
        uint256 id = itemHash(title, description, budget);
        items[id] = Item(true, title, description, budget, 0);
        totalBudget += budget;
        count += 1;
        emit ItemAdded(id, title, description, budget);
    }

    function removeItem(uint256 id) external onlyMember {
        Item memory item = items[id];
        require(item.exists, "item not found");
        totalBudget -= item.budget;
        delete items[id];
        count -= 1;
        emit ItemRemoved(id);
    }

    function hasItem(uint256 hash) external view returns (bool) {
        return items[hash].exists;
    }

    function isOpen() public view returns (bool) {
        return state == OPEN;
    }

    function itemHash(string memory title, string memory description,uint256 budget) 
    public pure virtual returns (uint256) {
        return uint256(keccak256(abi.encode(title, description, budget)));
    }

    function spend(uint256 itemId, uint256 amount) public onlyOwner {
        Item storage item = items[itemId];
        require(item.spent + amount <= item.budget, "not enough budget");
        item.spent += amount;
    }

    function costIsWithinBudget(uint256 itemId, uint256 cost) external view returns (bool) {
        Item memory item = items[itemId];
        return (item.budget - item.spent) >= cost;
    }

}
