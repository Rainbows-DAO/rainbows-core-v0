// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ILoop.sol";
import "./Plan.sol";

contract Actions is Ownable {

    struct Action {
        bool exists;
        bool paid;
        bool executed;
        uint256 cost;
        address payee;
        address createdBy;
        address validatedBy;
        string title;
    }
    
    uint public count = 0;

    mapping(uint256 => mapping(uint => Action)) public actionsByItemId;    

    modifier onlyMember {
        ILoop loop = ILoop(owner());
        require(loop.isMember(msg.sender), "must be a member");
        _;
    }

    modifier itemExists(uint256 itemId) {
        ILoop loop = ILoop(owner());
        require(loop.itemExists(itemId), "unknown plan item");
        _;
    }

    modifier isImplementing {
        ILoop loop = ILoop(owner());
        require(loop.isImplementing(), "must be implementing");
        _;
    }

    event ActionCreated(uint256 itemId, uint id, string title, uint256 cost, address payee, address createdBy);
    event ActionValidated(uint256 itemId, address validatedBy);
    event ActionExecuted(uint256 itemId, address ExecutedBy);
    event ActionPaid(uint256 itemId, address PaidBy);

    function getAction(uint256 itemId, uint id) external view itemExists(itemId) returns (Action memory) {
        return actionsByItemId[itemId][id];
    }

    function createAction(uint256 itemId, string memory _title, uint256 _cost, address _payee) 
    external onlyMember isImplementing itemExists(itemId) {
        count += 1;
        actionsByItemId[itemId][count] = Action(true, false, false, _cost, _payee, msg.sender, address(0), _title);
        emit ActionCreated(itemId, count, _title, _cost, _payee, msg.sender);
    }

    function validateAction(uint256 itemId, uint id) external onlyMember itemExists(itemId) {
        Action storage action = actionsByItemId[itemId][id];
        require(action.exists, "unknown action");
        require(action.createdBy != msg.sender, "can't validate your own action");
        ILoop loop = ILoop(owner());
        require(loop.withinBudget(itemId, action.cost), "action cost over budget");
        action.validatedBy = msg.sender;
        emit ActionValidated(itemId, msg.sender);
    }

    function executeAction(uint256 itemId, uint id) external onlyMember itemExists(itemId) {
        Action storage action = actionsByItemId[itemId][id];
        require(action.exists, "unknown action");
        action.executed = true;
        emit ActionExecuted(itemId, msg.sender);
    }

    function payAction(uint256 itemId, uint id, address payer) external onlyOwner itemExists(itemId) {
        Action storage action = actionsByItemId[itemId][id];
        require(action.exists, "unknown action");
        require(action.paid == false, "already paid");
        require(action.validatedBy != address(0), "action must be validated");
        action.paid = true;
        emit ActionPaid(itemId, payer);
    }

}
