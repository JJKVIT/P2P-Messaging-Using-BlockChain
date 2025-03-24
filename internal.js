var myaccount=localStorage.getItem("myaddress");

// onstart
window.onload=function(){
  if(myaccount==null){
    window.location.replace('index.html');
  }     
  
  getUsername(myaccount);
 	getFriends();
  listenForMessages();
};

document.addEventListener("DOMContentLoaded", function () {
    const messageInput = document.querySelector(".message-input");

    messageInput.addEventListener("input", function () {
        this.style.height = "auto"; 
        this.style.height = this.scrollHeight + "px"; 
    });
});


function getUsername(address) {
    let web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
    let mycontract = new web3.eth.Contract(abi, contractAddress);

    return new Promise((resolve, reject) => {
        mycontract.methods.getUserName(address).call({ from: myaccount }, function (err, data) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                if (address == myaccount) {
                    document.getElementById("username").innerHTML = 'Account: ' + data;
                }
                resolve(data);
            }
        });
    });
}

function getFriends(){
	let web3=new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
    let mycontract=new web3.eth.Contract(abi,contractAddress);

	mycontract.methods.getFriends().call({from: myaccount},function(err,data){
		if(err){
			console.log(err);
		}
		else{
			data.forEach((element) => addUsertoChats(element));
		}
	});
}

function addUsertoChats(users) {
	const contacts = document.querySelector(".contacts");
	if (!contacts) {
		console.error("Contacts container not found!");
		return;
	}
  
	const contactDiv = document.createElement('div');
	contactDiv.classList.add('contact');
	contactDiv.textContent = users[0]==myaccount?"Me":users[1]; 
	contactDiv.id = users[0];
  
	contactDiv.onclick = function () {
		document.querySelectorAll(".contact").forEach(contact => {
			contact.classList.remove("active");
		});
  
		contactDiv.classList.add("active");
		getChats(contactDiv.id);
	};
  
	contacts.appendChild(contactDiv);
  }

async function addFriend(){
	let web3=new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
  let mycontract=new web3.eth.Contract(abi,contractAddress);
  let fkey_input = document.querySelector(".address-input");
	let fkey = fkey_input.value;
	console.log(myaccount);
	mycontract.methods.addChat(fkey).send({from: myaccount,gas:300000}, function(err){
		if(err){
      alert("User Does Not Exists")
		}
		else{
		  console.log("Friend Added");
		}
	});
  let fname = await getUsername(fkey);
	console.log(fname);
	await addUsertoChats([fkey,fname]); 
	fkey_input.value = "";
}

function sendMsg(){
  let web3=new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
  let mycontract=new web3.eth.Contract(abi,contractAddress);
  let msgbox = document.querySelector(".message-input");
  let msg = msgbox.value;
  let friend = document.querySelector(".contact.active");
  let fkey = friend.id;

  mycontract.methods.sendMsg(fkey,msg).send({from:myaccount,gas:300000},function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("Message Sent");
      msgbox.value = "";
	    getChats(fkey);
    }
  });

}

function getChats(friendKey){
  let web3=new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
  let mycontract=new web3.eth.Contract(abi,contractAddress);

  mycontract.methods.readMsg(friendKey).call({from:myaccount},function(err,data){
    if(err){
      console.log(err);
    }
    else{
		  const msgArea = document.querySelector(".chat-messages");
		  msgArea.innerHTML = "";
		  data.forEach((element) => loadChats(element));
    }
  });
}

function loadChats(msgData) {
    const msgArea = document.querySelector(".chat-messages");
    const chatDiv = document.createElement("div");

    if (msgData[0] == myaccount) {
        chatDiv.classList.add("sent");
    } else {
        chatDiv.classList.add("received");
    }

    const msgdiv = document.createElement("div");
    msgdiv.innerHTML = msgData[1];

    const timestamp = document.createElement("div");
    timestamp.classList.add("timestamp");
    let date = new Date(msgData[2] * 1000);
    timestamp.innerHTML = date.toLocaleString();

    chatDiv.appendChild(msgdiv);
    chatDiv.appendChild(timestamp);

    msgArea.appendChild(chatDiv);

    msgArea.appendChild(document.createElement("br"));
}

function listenForMessages() {
  let web3 = new Web3(new Web3.providers.WebsocketProvider("ws://127.0.0.1:7545"));
  let mycontract = new web3.eth.Contract(abi, contractAddress);

  mycontract.events.MessageSent().off();

  mycontract.events.MessageSent()
  .on("data", function (event) {
      console.log("New message detected:", event.returnValues);
      
      let sender = event.returnValues.from;
      let receiver = event.returnValues.to;
      
      if (sender === myaccount || receiver === myaccount) {
          let friendKey = sender === myaccount ? receiver : sender;
          getChats(friendKey);
      }
  })
  .on("error", function (error) {
      console.error("WebSocket error:", error);
  });
}


function logout(){
  localStorage.removeItem("myaddress");
  window.location.replace('index.html');
}
