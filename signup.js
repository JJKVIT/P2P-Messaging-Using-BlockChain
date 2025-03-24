async function register(){
    let web3=new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
    let mycontract=new web3.eth.Contract(abi,contractAddress);
    var address=document.getElementById("address").value;
    localStorage.setItem("myaddress",address);
    let name = document.getElementById("username").value;
    try {
    await mycontract.methods.createAcc(name).send({ from: address,gas:300000 })  
    .then((receipt) => {
        console.log("Transaction Receipt:", receipt);
        window.location.replace('account.html');
    })
    .catch((error) => {
        console.error("Transaction Error:", error);
    });
    } catch (error) {
    pass;
    }     
}
