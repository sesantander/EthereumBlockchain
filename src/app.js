App = {
  loading: false,
  contracts: {},
  
  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
  },

  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        await ethereum.enable()
        web3.eth.sendTransaction({/* ... */})
      } catch (error) {
      }
    }
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      web3.eth.sendTransaction({/* ... */})
    }
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async () => {
    // Cargamos la direccion conectada en metamask
    App.account = web3.eth.accounts[0]
  },
  loadContract: async () => {
    // Obtenemos una el smart contract 
    const todoList = await $.getJSON('TodoList.json')
    App.contracts.TodoList = TruffleContract(todoList)
   
    web3.eth.defaultAccount = web3.eth.accounts[0];
    App.contracts.TodoList.setProvider(App.web3Provider)
    App.todoList = await App.contracts.TodoList.deployed()
  },
  
  render: async () => {
    if (App.loading) {
      return
    }
    App.setLoading(true)
    // Renderizamos la cuenta
    $('#account').html(App.account)
    // Renderizamos el balance del smart contract
    let balance = await App.todoList.showBalance()
    $('#balance').html( `Smart Contract Balance : ${balance?.c[0]/10000}.00 ETH`)
    // Renderiuzamos las tareas
    await App.renderTasks()

    App.setLoading(false)
  },

  renderTasks: async () => {
    // Llamamos la variable taskCount del smart contract que va a tener el total de tareas
    const taskCount = await App.todoList.taskCount()
    const $taskTemplate = $('.taskTemplate')

    for (var i = 1; i <= taskCount; i++) {
      // Obtenemos el array de tareas del smart contract
      const task = await App.todoList.tasks(i)
      const taskId = task[0].toNumber()
      const taskContent = task[1]
      const taskCompleted = task[2]
      const taskReward = task[3]

      // Llenamos el html con la informacion de cada tarea
      const $newTaskTemplate = $taskTemplate.clone()
      $newTaskTemplate.find('.content').html(taskContent + ' - ' + taskReward + " ETH")
      $newTaskTemplate.find('input')
                      .prop('name', taskId)
                      .prop('checked', taskCompleted)
                      .on('click', App.marked)

      if (taskCompleted) {
        $('#completedTaskList').append($newTaskTemplate)
      } else {
        $('#taskList').append($newTaskTemplate)
      }

      $newTaskTemplate.show()
    }
  },
  depositEth: async () => {
    // Metodo para enviar ether de una cuenta a otra, en este caso enviamos ether a la direccion de el smart contract
    await web3.eth.sendTransaction({
      from: App.account,
      to: '0x0cda18B7C9952ef4DF502c8D59435B1c3226438F', 
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
    // Una vez obtenidos los valores ingresados por el usuario creamos la tarea con el metodo de el smart contract
    await App.todoList.createTask(content,rewardValue)
    window.location.reload()
  },

  marked: async (e) => {
    App.setLoading(true)
    const taskId = e.target.name
    // Obtenemos el valor del reward de la tarea con taskId
    let rewardValue = await App.todoList.getTaskReward(taskId)
    // Marcamos la tarea como completa
    await App.todoList.markCompleted(taskId)
    // Enviamos ether con el valor de la recompensa a la cuenta conectada
    await App.todoList.sendEther(App.account, rewardValue)
    
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