async function deployLoop({ getNamedAccounts, deployments: { deploy, get }, network }) {
    const { deployer } = await getNamedAccounts()
    const unit = await get("UnitToken")
    const rainbows = await deploy("Rainbows", { from: deployer, args: [], log: true })
    // await deploy("Loop", { from: deployer, args: [
    //     "Rainbows Live", "A global event to change the world", unit.address, rainbows.address
    // ], log: true })
}

module.exports = deployLoop  
