

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ChatToken{
    //USERS
    struct user{
        string name;
        friend[] friends;
    }

    struct friend{
        address publicKey;
        string name;
    }

    struct message{
        address sender;
        string content;
        uint256 timestamp;
    }

    struct AllUsers{
        address accountAddress;
        string name;
    }

    AllUsers[] public getallUsers;

    //Stores all the users in a list
    mapping(address => user) userList;

    event MessageSent(address indexed from, address indexed to, string message, uint256 timestamp);

    //Stores all the messages in a list
    mapping(bytes32 => message[]) allMsgs;

    //Checking if user exists
    function  checkUserExist(address publicKey) public view returns (bool) {
        /*
        Returns=>bool
        true => user exists
        false => user does not exist 
        */
        return bytes(userList[publicKey].name).length > 0;
    }

    //Create Account
    function createAcc(string calldata name) external {
        /*
        Creates a new account
        Returns=>None
        */

        //Checks if the user already exists if ture returns an error
        require(!checkUserExist(msg.sender), "User already exists");
        //Checks if the name is empty
        require(bytes(name).length > 0, "Name cannot be empty");

        //Adds the user to the list
        userList[msg.sender].name = name;
        getallUsers.push(AllUsers(msg.sender, name));
    }

    //Get users Name
    function getUserName(address publicKey) external view returns (string memory){
        //Checks if the user exists
        require(checkUserExist(publicKey), "User does not exist");
        //returns the name of the user
        return userList[publicKey].name;
    }

    function addChat(address friendKey) external {
        /*
        Adds a friend to the user
        Returns=>None
        */

        //Checks if the user exists
        require(checkUserExist(msg.sender), "Create an account");
        //Checks if the friend exists
        require(checkUserExist(friendKey), "Friend does not exist");
        //Checks if the user is trying to add themselves
        require(msg.sender != friendKey, "Cannot add yourself as a friend");
        //Checks if the friend has already been added
        require(checkFriendExist(msg.sender,friendKey) == false, "Friend has already been added");

        //Adds the friend to the user's friend list and vice versa
        _addFriend(msg.sender, friendKey, userList[friendKey].name);
        _addFriend(friendKey, msg.sender, userList[msg.sender].name);

    }

    //checks if the users are friends
    function checkFriendExist(address publicKey, address friendKey) internal view returns (bool) {
        /*
        Returns=>bool
        true => friend exists
        false => friend does not exist 
        */

        //checks the shorter friend list since it will takes less time
        if(userList[publicKey].friends.length > userList[friendKey].friends.length){
            address temp = publicKey;
            publicKey = friendKey;
            friendKey = temp;
        }

        for(uint256 i = 0;i<userList[publicKey].friends.length;i++){
            if(userList[publicKey].friends[i].publicKey == friendKey){
                //returns true if the friend exists
                return true;
            }
        }
        
        //returns false if the friend does not exist
        return false;
    }

    function _addFriend(address publicKey, address friendKey, string memory name) internal {
        /*
        Adds a friend to the user
        Returns=>None
        */

        //Adds the friend to the user's friend list
        friend memory newFriend = friend(friendKey, name);
        userList[publicKey].friends.push(newFriend);
    }

    //Returns all friends of the user
    function getFriends() external view returns (friend[] memory){
        /*
        Returns=>friend[]
        */
        return userList[msg.sender].friends;
    }

    function _chatCode(address publicKey, address friendKey) internal pure returns (bytes32){
        /*
        Returns=>bytes32
        */
        if(publicKey < friendKey){
            return keccak256(abi.encodePacked(publicKey, friendKey));
        }
        else{
            return keccak256(abi.encodePacked(friendKey,publicKey));
        }
    }

    function sendMsg(address friendKey, string calldata _msg) external {
    require(checkUserExist(msg.sender), "Create an account");
    require(checkUserExist(friendKey), "Friend does not exist");
    require(checkFriendExist(msg.sender, friendKey), "Friend does not exist");

    // Generate a chat code for the conversation
    bytes32 chatCode = _chatCode(msg.sender, friendKey);

    // Create the message and store it
    message memory newMsg = message(msg.sender, _msg, block.timestamp);
    allMsgs[chatCode].push(newMsg);

    // Emit the event so frontend can detect new messages
    emit MessageSent(msg.sender, friendKey, _msg, block.timestamp);
}

    function readMsg(address friendKey) external view returns (message[] memory){
        bytes32 chatCode = _chatCode(msg.sender, friendKey);
        return allMsgs[chatCode];
    }

    function getallAppUsers() public view returns (AllUsers[] memory){
        return getallUsers;
    }
}