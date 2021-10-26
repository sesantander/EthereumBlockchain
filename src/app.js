App = {
  loading: false,
  contracts: {},
  
  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
  },

  // https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */})
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */})
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async () => {
    // Set the current blockchain account
    App.account = web3.eth.accounts[0]
  },
  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    const todoList = await $.getJSON('TodoList.json')
    App.contracts.TodoList = TruffleContract(todoList)
   
    console.log(web3.eth.networks)
    web3.eth.defaultAccount = web3.eth.accounts[0];
    App.contracts.TodoList.setProvider(App.web3Provider)
    // Hydrate the smart contract with values from the blockchain
    App.todoList = await App.contracts.TodoList.deployed()
  },
  
  render: async () => {
    // Prevent double render
    if (App.loading) {
      return
    }

    // Update app loading state
    App.setLoading(true)
    // Render Account
    $('#account').html(App.account)
    // Render Smart Contract Balance
    let balance = await App.todoList.showBalance()
    $('#balance').html( `Smart Contract Balance : ${balance?.c[0]/10000}.00 ETH`)
    // Render Tasks
    await App.renderTasks()

    // Update loading state
    App.setLoading(false)
  },

  renderTasks: async () => {
    // Load the total task count from the blockchain
    const taskCount = await App.todoList.taskCount()
    const $taskTemplate = $('.taskTemplate')

    // Render out each task with a new task template
    for (var i = 1; i <= taskCount; i++) {
      // Fetch the task data from the blockchain
      const task = await App.todoList.tasks(i)
      const taskId = task[0].toNumber()
      const taskContent = task[1]
      const taskCompleted = task[2]
      const taskReward = task[3]

      // Create the html for the task
      const $newTaskTemplate = $taskTemplate.clone()
      $newTaskTemplate.find('.content').html(taskContent + ' - ' + taskReward)
      $newTaskTemplate.find('input')
                      .prop('name', taskId)
                      .prop('checked', taskCompleted)
                      .on('click', App.marked)

      // Put the task in the correct list
      if (taskCompleted) {
        $('#completedTaskList').append($newTaskTemplate)
      } else {
        $('#taskList').append($newTaskTemplate)
      }

      // Show the task
      $newTaskTemplate.show()
    }
  },
  depositEth: async () => {
    
    await web3.eth.sendTransaction({
      from: '0xc8Df9C0bF5A503FB1E0eE982f52403CDeA30f1E5',
      to: '0xe7ca6742E9584fCF4C779A0e3Bb0ACe21116f5a7', 
      value: web3.toWei(2, "ether"), 
    }, async function(err, transactionHash) {
        if (err) { 
            console.log("Error: ",err); 
        } else {
            console.log("Transaction Hash", transactionHash);
        }
    });

  },
  createTask: async () => {
    App.setLoading(true)
    const content = $('#newTask').val()
    const rewardValue = $('#reward').val()
    await App.todoList.createTask(content,rewardValue)
    window.location.reload()
  },

  marked: async (e) => {
    App.setLoading(true)
    const taskId = e.target.name
    let rewardValue = await App.todoList.getTaskReward(taskId)

    await App.todoList.toggleCompleted(taskId)
    
    await App.todoList.sendEther('0xc8Df9C0bF5A503FB1E0eE982f52403CDeA30f1E5',rewardValue)
    
    window.location.reload()
  },

  setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {
      loader.show()
      content.hide()
    } else {
      loader.hide()
      content.show()
    }
  }
}

$(() => {
  $(window).load(() => {
    App.load()
  })
})