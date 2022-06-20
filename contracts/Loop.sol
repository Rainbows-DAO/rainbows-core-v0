// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./Members.sol";
import "./Plan.sol";
import "./GovernanceToken.sol";
import "./TimeLock.sol";
import "./GovernorContract.sol";
import "./Treasury.sol";

contract Loop is Ownable {

    string public title;
    string public description;
    
    Members members;
    Plan public plan;
    GovernanceToken public token;
    TimeLock lock;
    GovernorContract public governor;
    Treasury public treasury;

    uint256 proposePlanId;

    bytes32 constant public PLANNING = keccak256("PLANNING_STATE");
    bytes32 constant public FUNDRAISING = keccak256("FUNDRAISING_STATE");
    bytes32 constant public IMPLEMENTING = keccak256("IMPLEMENTING_STATE");

    bytes32 public state;

    event MemberAdded(address account);
    event MemberRemoved(address account);
    
    event PlanProposed(uint256 proposalId);
    event PlanQueued(uint256 proposalId);
    event PlanClosed(uint256 proposalId);
    
    modifier onlyMember {
        require(members.isMember(msg.sender), "must be a member");
        _;
    }

    constructor(string memory _title, string memory _description, address _unit) {
        title = _title;
        description = _description;
        members = new Members();
        plan = new Plan();
        token = new GovernanceToken();
        treasury = new Treasury(_unit);
        _join(msg.sender);
        address[] memory proposers;
        address[] memory executors;
        uint minDelay = 10;
        lock = new TimeLock(minDelay, proposers, executors);
        uint votingDelay = 1;
        uint votingPeriod = 10;
        uint quorumPercentage = 100;
        governor = new GovernorContract(token, lock, quorumPercentage, votingPeriod, votingDelay);
        lock.grantRole(lock.PROPOSER_ROLE(), address(governor));
        lock.grantRole(lock.EXECUTOR_ROLE(), address(0));
        lock.grantRole(lock.TIMELOCK_ADMIN_ROLE(), address(governor));
        lock.revokeRole(lock.TIMELOCK_ADMIN_ROLE(), address(this));
        state = PLANNING;
        transferOwnership(address(lock));
    }

    function _join(address account) private {
        members.add(account);
        emit MemberAdded(account);
        token.mint(account);
    }

    function join() external {
        _join(msg.sender);
    }

    function leave() external {
        members.remove(msg.sender);
        emit MemberRemoved(msg.sender);
        token.burn(msg.sender);
    }

    function isMember(address account) external view returns (bool) {
        return members.isMember(account);
    }

    function proposePlanData() private view returns (address[] memory, uint256[] memory, bytes[] memory)  {
        bytes memory encoded = abi.encodeWithSelector(bytes4(keccak256("closePlan()")));
        address[] memory targets = new address[](1);
        uint256[] memory values = new uint256[](1);
        bytes[] memory calldatas = new bytes[](1);
        targets[0] = address(this);
        values[0] = 0;
        calldatas[0] = encoded;
        return (targets, values, calldatas);
    }

    function proposePlan() external onlyMember {
        (address[] memory targets, uint256[] memory values, bytes[] memory calldatas) = proposePlanData();
        proposePlanId = governor.propose(targets, values, calldatas, "Adopt the plan");
        emit PlanProposed(proposePlanId);
    }

    function queueApprovePlan() external onlyMember {
        (address[] memory targets, uint256[] memory values, bytes[] memory calldatas) = proposePlanData();
        governor.queue(targets, values, calldatas, keccak256(bytes("Adopt the plan")));
        emit PlanQueued(proposePlanId);
    }

    function executeApprovePlan() external {
        (address[] memory targets, uint256[] memory values, bytes[] memory calldatas) = proposePlanData();
        governor.execute(targets, values, calldatas, keccak256(bytes("Adopt the plan")));
        emit PlanClosed(proposePlanId);
    }

    function closePlan() external onlyOwner {
        plan.close();
        treasury.startFundraising(plan.totalBudget());
        state = FUNDRAISING;
    }

    function claimFunds() external {
        treasury.claimFunds();
        state = IMPLEMENTING;
    }

}