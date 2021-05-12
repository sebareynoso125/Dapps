import React, { Component } from 'react'
import Web3 from 'web3'
import Token from '../abis/Token.json'
import EthSwap from '../abis/EthSwap.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'


class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    //console.log(window.web3)
    await this.loadBlockchainData()
  }  

  async loadBlockchainData(){
    const web3 = window.web3

    //obtener datos de las cuenta que estamos usando
    const accounts = await web3.eth.getAccounts()
    //con esto puedo acceder a la direccion de la cuenta en cualquier parte de la aplicación
    this.setState({account: accounts[0]})

    const ethBalance = await web3.eth.getBalance(this.state.account)
    //this.setState({ethBalance: ethBalance})
    this.setState({ethBalance})

    //console.log(this.state.account) 
    //console.log(this.state.ethBalance) 

    //create a javascript version of smart contract
    //Load Token
    const networkId = await web3.eth.net.getId() //al estar metamask conectado a ganache nos da el adress 577
    const tokenData = Token.networks[networkId]
    if(tokenData){
      const token = new web3.eth.Contract(Token.abi, tokenData.address)//1er arg: dice como funciona el smart contract 2do arrg: donde esta el contrato en la blockchain
      this.setState({token})
      let tokenBalance = await token.methods.balanceOf(this.state.account).call()
      //this.setState({tokenBalance: tokenBalance.toString()})//: tokenBalance.toString()
      //console.log(tokenBalance.toString())
    } else{
      window.alert('Token network not deployed to detected network')
    }

    //Load ethSwap
    const ethSwapData = EthSwap.networks[networkId]
    if(ethSwapData){
      const ethSwap = new web3.eth.Contract(EthSwap.abi, tokenData.address)//1er arg: dice como funciona el smart contract 2do arrg: donde esta el contrato en la blockchain
      this.setState({ethSwap})
    } else{
      window.alert('EthSwap contract not deployed to detected network')
    }
    //termino de cargar todo
    this.setState({loading: false})
  }

  //connect app to blockchain
  async loadWeb3(){
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }

  }

  buyTokens =(etherAmount) =>{
    this.setState({loading: true})
    this.state.ethSwap.methods.buyTokens().send({value: etherAmount, from: this.state.account}).on('transactionHash', (hash) => {
      this.setState({loading: false})
    })
  }

  sellTokens =(tokenAmount) =>{
    this.setState({loading: true})
    this.state.token.methods.approve(this.state.ethSwap.address, tokenAmount).send({from: this.state.account}).on('transactionHash', (hash) => {
      this.state.ethSwap.methods.sellTokens(tokenAmount).send({from: this.state.account}).on('transactionHash', (hash) => {
        this.setState({loading: false})
      })
    })
  }

  constructor(props){
    super(props)
    this.state = {
      account: '',
      token: {},
      ethSwap: {},
      ethBalance: '0',
      tokenBalance: '0',
      loading: true
    }
  }

  render() {

    let content
    let loading = true
    if(this.state.loading){
      content = <p id= "loader" className= "text-center"> Loading...</p>
    } else{
      content = <Main 
                  ethBalance = {this.state.ethBalance} 
                  tokenBalance={this.state.tokenBalance}
                  buyTokens={this.buyTokens}
                  sellTokens={this.sellTokens}
                />
    }

    return (
      <div>
        <Navbar account = {this.state.account}/>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{maxWidth: '600px'}}>
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                </a>
                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
