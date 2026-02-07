# panoplia backend demo

demo for the backend infrastructure of the panoplia wallet: a react app that uses the following submodules
* panoplia.mpc -> used for wallet management, creation, operation
* panoplia.defi -> lifi based library for defi operations
* panoplia.peer -> on ramping and off ramping using the peer (aka zkp2p) protocol

these are all stored under the "submodules" directory

these all have the purpose of creating web3 wallet app, and before building the app, I'd like to showcase an minimal react app (that by itself it is a wallet app) that aggregates all these libraries.
