const { ethers, network } = require("hardhat");
const fs = require("fs");

const frontend = "../interface/src/constants/";

module.exports = async function () {
	const unit = await ethers.getContract("UnitToken");
	const loop = await ethers.getContractFactory("Loop");
	const rainbows = await ethers.getContract("Rainbows");
	const chainId = "0x" + network.config.chainId.toString(16);
	const addresses = {
		[chainId]: {
			unit: unit.address,
			// loop: loop.address,
			rainbows: rainbows.address,
		},
	};
	fs.writeFileSync(
		frontend + "contractAddresses.json",
		JSON.stringify(addresses, null, 4),
		"utf8"
	);
	const abi = {
		unit: JSON.parse(unit.interface.format(ethers.utils.FormatTypes.json)),
		loop: JSON.parse(loop.interface.format(ethers.utils.FormatTypes.json)),
		rainbows: JSON.parse(
			rainbows.interface.format(ethers.utils.FormatTypes.json)
		),
	};
	fs.writeFileSync(frontend + "abi.json", JSON.stringify(abi, null, 4), "utf8");
};
