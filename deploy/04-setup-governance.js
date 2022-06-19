async function setupGovernance({ getNamedAccounts, deployments: { deploy, log, get }, network }) {
    const { deployer } = await getNamedAccounts()
    
    const timeLock = await ethers.getContract("TimeLock", deployer)
    const governer = await ethers.getContract("GovernorContract", deployer)
    
    const proposer = await timeLock.PROPOSER_ROLE()
    const executer = await timeLock.EXECUTOR_ROLE()
    const admin = await timeLock.TIMELOCK_ADMIN_ROLE()
    
    const proposerTx = await timeLock.grantRole(proposer, governer.address)
    await proposerTx.wait(1)

    const executerTx = await timeLock.grantRole(executer, ethers.constants.AddressZero)
    await executerTx.wait(1)

    const adminTx = await timeLock.grantRole(admin, governer.address)
    await adminTx.wait(1)

    const revokeTx = await timeLock.revokeRole(admin, deployer)
    await revokeTx.wait(1)
}

module.exports = setupGovernance 