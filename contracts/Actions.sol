// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/ILoop.sol";

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

    mapping(uint256 => Action) public actionsByItemId;    

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

    event ActionCreated(uint256 itemId, string title, uint256 cost, address payee, address createdBy);
    event ActionValidated(uint256 itemId, address validatedBy);
    event ActionExecuted(uint256 itemId, address ExecutedBy);
    event ActionPaid(uint256 itemId, address PaidBy);

    function getAction(uint256 itemId) external view itemExists(itemId) returns (Action memory) {
        return actionsByItemId[itemId];
    }

    function createAction(uint256 itemId, string memory _title, uint256 _cost, address _payee) 
    external onlyMember isImplementing itemExists(itemId) {
        actionsByItemId[itemId] = Action(true, false, false, _cost, _payee, msg.sender, address(0), _title);
        emit ActionCreated(itemId, _title, _cost, _payee, msg.sender);
    }

    function validateAction(uint256 itemId) external onlyMember itemExists(itemId) {
        Action storage action = actionsByItemId[itemId];
        require(action.exists, "unknown action");
        require(action.createdBy != msg.sender, "can't validate your own action");
        action.validatedBy = msg.sender;
        emit ActionValidated(itemId, msg.sender);
    }

    function executeAction(uint256 itemId) external onlyMember itemExists(itemId) {
        Action storage action = actionsByItemId[itemId];
        require(action.exists, "unknown action");
        action.executed = true;
        emit ActionExecuted(itemId, msg.sender);
    }

    function payAction(uint256 itemId, address payer) external onlyOwner itemExists(itemId) {
        Action storage action = actionsByItemId[itemId];
        require(action.exists, "unknown action");
        require(action.paid == false, "already paid");
        require(action.validatedBy != address(0), "action must be validated");
        action.paid = true;
        emit ActionPaid(itemId, payer);
    }

}