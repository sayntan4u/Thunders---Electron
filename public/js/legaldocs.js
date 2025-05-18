function generateLegalDoc() {

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
    xhttp.onload = function () {
        const response = this.responseText;

        if (docType.value == "Declaration") {
            downloadLegal(response.split("THUNDER_LEGAL_DOCUMENT")[0], "DECLARATION - " + prospectName);
        } else {
            downloadLegal(response.split("THUNDER_LEGAL_DOCUMENT")[1], "LEGAL DOCUMENT - " + prospectName);
        }



    }
    xhttp.open("POST", "/utilities/generateLegalDoc");
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(data));
}

function downloadLegal(exportObj, exportName) {
    var dataStr = "data:application/octet-stream; base64," + exportObj;
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".docx");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

}

function downloadDeclaration(exportObj, exportName) {
    var dataStr = "data:application/octet-stream; base64," + exportObj;
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".docx");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}
