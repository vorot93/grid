const HOME = require('os').homedir()
let BASE
switch (process.platform) {
  case 'win32': {
    BASE = `${process.env.USERPROFILE}/AppData/Roaming/OpenEthereum`
    break
  }
  case 'linux': {
    BASE = '~/.local/share/openethereum'
    break
  }
  case 'darwin': {
    // WARNING don't just use ~/Library/.. here
    BASE = `${HOME}/Library/Application Support/OpenEthereum`
    break
  }
  default: {
  }
}

const IPC_PATH = `${BASE}/jsonrpc.ipc`

module.exports = {
  type: 'client',
  order: 2,
  displayName: 'OpenEthereum',
  name: 'openethereum',
  repository: 'https://github.com/openethereum/openethereum',
  prefix: `${process.platform}`, // filter github assets
  binaryName: process.platform === 'win32' ? 'openethereum.exe' : 'openethereum',
  resolveIpc: logs => IPC_PATH,
  settings: [
    {
      id: 'network',
      label: 'Network',
      default: 'mainnet',
      options: [
        { value: 'mainnet', label: 'Main', flag: '--chain mainnet' },
        {
          value: 'ropsten',
          label: 'Ropsten (testnet)',
          flag: '--chain ropsten'
        },
        { value: 'kovan', label: 'Kovan (testnet)', flag: '--chain kovan' },
        { value: 'goerli', label: 'Görli (testnet)', flag: '--chain goerli' },
        { value: 'classic', label: 'Ethereum Classic', flag: '--chain classic' }
      ]
    },
    {
      id: 'syncMode',
      label: 'Sync Mode',
      default: 'warp',
      options: [
        { value: 'warp', label: 'Warp', flag: '' },
        { value: 'light', label: 'Light', flag: '--light' },
        { value: 'nowarp', label: 'Full', flag: '--no-warp' }
      ]
    },
    {
      id: 'ipcPath',
      type: 'directory',
      label: 'IPC Path',
      default: IPC_PATH,
      flag: '--ipc-path %s'
    },
    {
      required: true,
      id: 'noDownload',
      default: 'required',
      options: [{ value: 'required', flag: '--no-download' }]
    },
    {
      required: true,
      id: 'forceDirect',
      default: 'required',
      options: [{ value: 'required', flag: '--force-direct' }]
    }
  ],
  about: {
    description: 'OpenEthereum is a fast and feature-rich multi-network client implemented in Rust.',
    apps: [
      {
        name: 'RPC Tester App',
        url: 'package://github.com/ryanio/grid-rpc-app',
        dependencies: [
          {
            name: 'openethereum',
            settings: []
          }
        ]
      }
    ],
    links: [
      {
        name: 'GitHub Repository',
        url: 'https://github.com/openethereum/openethereum'
      }
    ],
    docs: [
      {
        name: 'OpenEthereum Docs',
        url: 'https://wiki.parity.io'
      },
      {
        name: 'JSON RPC API Reference',
        url: 'https://wiki.parity.io/JSONRPC'
      }
    ],
    community: [
      {
        name: 'Discord Chat',
        url: 'https://discord.io/openethereum'
      },
      {
        name: 'Twitter (@OpenEthereumOrg)',
        url: 'https://twitter.com/OpenEthereumOrg'
      }
    ]
  }
}
