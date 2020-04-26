const { assert } = require('chai')
const fs = require('fs')
const path = require('path')
const { PluginHost } = require('../../ethereum_clients/PluginHost')

describe('Clients', function() {
  describe('OpenEthereum', function() {
    it('establishes an IPC connection', async function() {
      this.timeout(2 * 60 * 1000)
      const pluginHost = new PluginHost()
      const openethereum = pluginHost.getPluginByName('openethereum')
      assert.isDefined(openethereum, 'openethereum plugin loaded and found')
      const releases = await openethereum.getReleases()
      let latest = releases[0]
      if (latest.remote) {
        latest = await openethereum.download(latest, progress => {
          console.log('progress', progress)
        })
      }
      // console.log('exists', latest.location, latest.remote)
      assert.isTrue(
        fs.existsSync(latest.location),
        'local openethereum package exists'
      )
      // will find or extract the binary from package
      const { binaryPath } = await openethereum.getLocalBinary()
      assert.isTrue(
        fs.existsSync(binaryPath),
        'openethereum executable was extracted'
      )

      // both works: with or without specified IPC path
      const config = {} // openethereum.config

      return new Promise((resolve, reject) => {
        openethereum.on('log', log => {
          console.log('log', log)
        })
        openethereum.on('started', () => {
          console.log('started...')
        })
        openethereum.on('connected', () => {
          console.log('connected!')
          openethereum.stop()
          resolve()
        })
        openethereum.start(latest, config)
      })
    })
  })
})
