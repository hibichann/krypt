require("@nomiclabs/hardhat-waffle")

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	solidity: "0.8.17",
	networks: {
		goerli: {
			url: "https://eth-goerli.g.alchemy.com/v2/49QbSn-c8D5Z2taBfRd02ZtQ4L0i0ylu",
			accounts: [
				"c104db66b85d5c9a599750462b3f5718ccdb41a005a2ae585a8f4409fcfe3025",
			],
		},
	},
}
// https://eth-goerli.g.alchemy.com/v2/49QbSn-c8D5Z2taBfRd02ZtQ4L0i0ylu
