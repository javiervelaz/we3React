require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/wrRUL-6RGWIOc0m0lnPYfbBX5sdNJemx',
      accounts: ['2f1ea7b5740b2f19e212d4f2273ab7ab34ca0e0a0523f807039f7dc4f262c435'],
    },
  },
};