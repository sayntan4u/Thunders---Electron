function generateLegalDoc(){

    var prospectName = document.getElementById("prospectName").value;
    var prospectAddress = document.getElementById("prospectAddress").value;
    var irID = document.getElementById("irID").value;
    var amt = document.getElementById("amt").value;
    var amtWords = document.getElementById("amtWords").value;
    var bankName = document.getElementById("bankName").value;
    var bankAcc = document.getElementById("bankAcc").value;
    var irName = document.getElementById("irName").value;
    var irAddress = document.getElementById("irAddress").value;
    var product1 = document.getElementById("product1").value;
    var product2 = document.getElementById("product2").value;
    var product3 = document.getElementById("product3").value;
    var product4 = document.getElementById("product4").value;

    const data = { 
        prospectName: prospectName, 
        prospectAddress: prospectAddress,
        irID: irID,
        amt: amt,
        amtWords: amtWords,
        bankName: bankName,
        bankAcc: bankAcc,
        irName: irName,
        irAddress: irAddress,
        product1: product1,
        product2: product2,
        product3: product3,
        product4: product4,
    };


    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        const response = JSON.parse(this.responseText);
        $(".legal").attr("href","legal/LEGAL DOCUMENT - " + prospectName +".docx");
        $(".declaration").attr("href","legal/DECLARATION - " + prospectName +".docx");
        $("#legalDocResult").removeClass("hide");

      }
    xhttp.open("POST", "/utilities/generateLegalDoc");
    xhttp.setRequestHeader('Content-Type', 'application/json'); 
    xhttp.send(JSON.stringify(data));
}