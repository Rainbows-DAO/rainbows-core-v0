async function deployGovernanceToken({ getNamedAccounts, deployments: { deploy, log }, network }) {
    const { deployer } = await getNamedAccounts()
    const token = await deploy("GovernanceToken", { from: deployer, args: [], log: true })
    await delegate(token.address, deployer, log)
}

async function delegate(address, toAccount, log) {
    const token = await ethers.getContractAt("GovernanceToken", address)
    const tx = await token.delegate(toAccount)
    await tx.wait(1)
    log(`Checkpoints ${ await token.numCheckpoints(toAccount) }`)
}

module.exports = deployGovernanceToken  