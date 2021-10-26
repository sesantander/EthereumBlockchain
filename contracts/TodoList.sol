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
        uint reward;
    }

    event TaskCompleted(uint256 id, bool completed);

    // creamos la estructura de datos para guardar nuestros tasks, este funciona como hash map
    mapping(uint256 => Task) public tasks;

    event TaskCreated(uint256 id, string content, bool completed, uint reward);

    constructor() public {
      createTask("First task",1);
    }

    // funcion para guardar tasks dentro del mapping
    function createTask(string memory _content, uint _reward) public {
      taskCount++;
      tasks[taskCount] = Task(taskCount, _content, false, _reward);
      emit TaskCreated(taskCount, _content, false, _reward);
    }

    function toggleCompleted(uint256 _id) public {
      Task memory _task = tasks[_id];
      _task.completed = !_task.completed;
      tasks[_id] = _task;
      emit TaskCompleted(_id, _task.completed);
    }

    function sendEther(address payable recipient, uint reward) external {
      uint money = reward * 1 ether;
      recipient.transfer(money);
    }

    function getTaskReward(uint256 _id) external view returns(uint){
      Task memory _task = tasks[_id];
      return _task.reward;
    }

    //function recieveEther() payable public{}
    // function recieveEther() external payable {
    //   functionCalled = 'recieveEther';
    // }

    function() external payable {}

    function showBalance() external view returns (uint256) {
      return address(this).balance;
    }
}
