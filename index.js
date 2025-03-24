var myaccount=localStorage.getItem("Useraddress");
window.onload=function(){
    if(myaccount!=null){
    window.location.replace('account.html');
    }
}

async function send(){
    let web3=new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
    let mycontract=new web3.eth.Contract(abi,contractAddress);
    var address=document.getElementById("address").value;
    localStorage.setItem("myaddress",address);
    await mycontract.methods.checkUserExist(address).call({ from: address},function(err,data){
        if(err){
          console.log(err);
        }
        else{
            if(data == false){
                alert("Incorrect Details Or User Does Not Exist");
            }
            else{
                window.location.replace('account.html');
            }
        }
      });
}