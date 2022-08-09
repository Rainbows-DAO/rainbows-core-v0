async function deployUnitToken({ getNamedAccounts, deployments: { deploy, log }, network }) {
    const { deployer } = await getNamedAccounts()
    await deploy("UnitToken", { from: deployer, args: [], log: true })
}

module.exports = deployUnitToken  