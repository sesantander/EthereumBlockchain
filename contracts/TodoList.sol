// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract TodoList {
    // el keyword public lo que hace es que nos deja leer taskCount como si fuera el llamado de una funcion
    uint256 public taskCount = 0;
    // address payable owner = msg.sender;

    struct Task {
        uint256 id;
        string content;
        bool completed;  
    }

    event TaskCompleted(
        uint id,
        bool completed
    );

    // creamos la estructura de datos para guardar nuestros tasks, este funciona como hash map
    mapping(uint256 => Task) public tasks;

    event TaskCreated(uint256 id, string content, bool completed);

    constructor() public {
        //owner = payable(msg.sender);
        createTask("First task");
    }

    // funcion para guardar tasks dentro del mapping
     function createTask(string memory _content) public {
    taskCount ++;
    tasks[taskCount] = Task(taskCount, _content, false);
    emit TaskCreated(taskCount, _content, false);
  }

  function toggleCompleted(uint _id) public {
    Task memory _task = tasks[_id];
    _task.completed = !_task.completed;
    tasks[_id] = _task;
    emit TaskCompleted(_id, _task.completed);
  }

  // function earnForTask() public payable {
  //     //address payable x = payable(address(msg.sender));
  //     uint256 amount = 1;
  //     msg.sender.transfer(amount);  

  // }
  function sendEther(address payable recipient) external {
    recipient.transfer(1 ether);
    // transfer 1 ether from this smart contract to recipient
  }
  // function sendViaTransfer(address payable _to) public payable {
  //       // This function is no longer recommended for sending Ether.
  //       _to.transfer(msg.value);
  //   }
  
  //function recieveEther() payable public{}
  // function recieveEther() external payable {
  //   functionCalled = 'recieveEther';
  // }

  function () external payable {
  }
  function showBalance() external view returns(uint){
    return address(this).balance;
  }
  
}