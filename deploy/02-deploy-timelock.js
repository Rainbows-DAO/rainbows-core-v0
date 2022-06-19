const minDelay = 3600 
const proposers = []
const executers = []

async function deployTimelock({ getNamedAccounts, deployments: { deploy, log }, network }) {
    const { deployer } = await getNamedAccounts()
    const token = await deploy("TimeLock", { from: deployer, args: [ minDelay, proposers, executers ], log: true })
}

module.exports = deployTimelock 