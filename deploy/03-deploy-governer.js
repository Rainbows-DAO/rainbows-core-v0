const votingDelay = 1 
const votingPeriod = 5
const quorumPercentage = 10 

async function deployGoverner({ getNamedAccounts, deployments: { deploy, log, get }, network }) {
    const { deployer } = await getNamedAccounts()
    const token = await get("GovernanceToken")
    const timeLock = await get("TimeLock")
    await deploy("GovernorContract", { 
        from: deployer, args: [ token.address, timeLock.address, quorumPercentage, votingPeriod, votingDelay ], log: true 
    })
}

module.exports = deployGoverner   