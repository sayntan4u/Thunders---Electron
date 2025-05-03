$("#addClosing").click(function () {
    addClosing();
});

var settingsJson = [];


function addClosing() {
    var irName = $("#irNameAdd").val();
    var prosName = $("#prospectNameAdd").val();
    var uv = $("#uvAdd").val();
    var status = $("#statusAdd").val();
    var node = $("#sapphireUplineAdd").val();

    $(".loading").toggleClass("hide");

    // console.log(irName)
    // console.log(prosName)
    // console.log(uv)
    // console.log(status)
    // console.log(node)

    var data = {
        irName: irName,
        prosName: prosName,
        uv: uv,
        status: status,
        node: node
    };

    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        const response = this.responseText;
        console.log(response);
        loadClosings();
    }
    xhttp.open("POST", "/closing/addClosing");
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(data));

    $("#addClosingForm")[0].reset();


}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

function generateClosingTable(response) {
    $(".closings").html("");


    for (let i = 0; i < response.length; i++) {

        const uv = parseFloat(response[i].uv);
        const chq = parseInt(uv / 3);
        const money = chq * 15000;

        $(".closings").append(`
                <tr>
                    <th class="align-middle" scope="row">${i + 1}</th>
                    <td class="align-middle">${response[i].irName}</td>
                    <td class="align-middle">${response[i].prosName}</td>
                    <td class="align-middle">
                     <select class="form-select uv" onchange="closingUVChanged('${response[i].id}', this)">
                                    <option ${(response[i].uv == "1 UV") ? "selected" : ""}>1 UV</option>
                                    <option ${(response[i].uv == "1.5 UV") ? "selected" : ""}>1.5 UV</option>
                                    <option ${(response[i].uv == "2 UV") ? "selected" : ""}>2 UV</option>
                                    <option ${(response[i].uv == "2.5 UV") ? "selected" : ""}>2.5 UV</option>
                                    <option ${(response[i].uv == "3 UV") ? "selected" : ""}>3 UV</option>
                                    <option ${(response[i].uv == "3.5 UV") ? "selected" : ""}>3.5 UV</option>
                                    <option ${(response[i].uv == "4 UV") ? "selected" : ""}>4 UV</option>
                                    <option ${(response[i].uv == "4.5 UV") ? "selected" : ""}>4.5 UV</option>
                                    <option ${(response[i].uv == "5 UV") ? "selected" : ""}>5 UV</option>
                                    <option ${(response[i].uv == "5.5 UV") ? "selected" : ""}>5.5 UV</option>
                                    <option ${(response[i].uv == "6 UV") ? "selected" : ""}>6 UV</option>
                                    <option ${(response[i].uv == "6.5 UV") ? "selected" : ""}>6.5 UV</option>
                                    <option ${(response[i].uv == "7 UV") ? "selected" : ""}>7 UV</option>
                                    <option ${(response[i].uv == "7.5 UV") ? "selected" : ""}>7.5 UV</option>
                                    <option ${(response[i].uv == "8 UV") ? "selected" : ""}>8 UV</option>
                                    <option ${(response[i].uv == "8.5 UV") ? "selected" : ""}>8.5 UV</option>
                                    <option ${(response[i].uv == "9 UV") ? "selected" : ""}>9 UV</option>
                                    <option ${(response[i].uv == "9.5 UV") ? "selected" : ""}>9.5 UV</option>
                                    <option ${(response[i].uv == "10 UV") ? "selected" : ""}>10 UV</option>
  
                                  </select>
                    </td>
                    <td class="align-middle">
                    <select class="form-select" onchange="closingStatusChanged('${response[i].id}', this)">
                                    <option ${(response[i].status == "CIP") ? "selected" : ""}>CIP</option>
                                    <option ${(response[i].status == "LA") ? "selected" : ""}>LA</option>
                                    <option ${(response[i].status == "LA2") ? "selected" : ""}>LA2</option>
                                    <option ${(response[i].status == "AOS") ? "selected" : ""}>AOS</option>
                                    <option ${(response[i].status == "MIA") ? "selected" : ""}>MIA</option>
                                    <option ${(response[i].status == "2nd Meeting Done") ? "selected" : ""}>2nd Meeting Done</option>
                                    <option ${(response[i].status == "Purchase Done") ? "selected" : ""}>Purchase Done</option>
  
                                  </select>
                    
                    </td>
                    <td class="align-middle">
                    
                    ${response[i].node}
                    
                    </td>
                    <td class="text-success align-middle profit_td ${settingsJson.showProfit ? '' : 'hide'}">
                    <b>
                    +
                    <i class="material-icons" style="font-size:20px">currency_rupee</i>
                    <span class="profit">
                    ${numberWithCommas(money)}
                    </span>
                    </b>
                    </td>
                    <td>
                        <button class="btn btn-outline-danger" data-bs-toggle="modal" data-bs-target="#deleteClosingModal" data-bs-id='${response[i].id}'><i class="fa-solid fa-xmark"></i></button>
                    </td>
                </tr>
                    `);

        $(".loading").addClass("hide");
    }

    addTotalRow();

}

function closingStatusChanged(id, elem) {

    const statusValue = $(elem).val();
    var data = {
        id: id,
        status: statusValue
    };

    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/closing/updateClosingStatus");
    // xhttp.onload = function () {
    //     const response = JSON.parse(this.responseText);
    //     // console.log(response);
    //     if (response.length > 0) {
    //         generateClosingTable(response);
    //     } else {
    //         $(".loading").addClass("hide");
    //     }
    // }
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(data));
}

function closingUVChanged(id, elem) {

    const uv = $(elem).val();
    const chq = parseInt(parseFloat(uv) / 3);
    const money = chq * 15000;

    console.log(money);

    $(elem).parent().siblings(".profit_td").children("b").children(".profit").html(numberWithCommas(money));
    updateTotal();

    var data = {
        id: id,
        uv: uv
    };

    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/closing/updateClosingUV");
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(data));
}

function loadClosings() {
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/closing/getClosings");
    xhttp.onload = function () {
        const response = JSON.parse(this.responseText);
        // console.log(response);
        if (response.length > 0) {
            generateClosingTable(response);
        } else {
            $(".loading").addClass("hide");
        }
    }
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send();
}

function generateNodeDropDown() {
    $("#sapphireUplineAdd").append("<option>-select-</option>");
    var data = { group: "Sapphire" };
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        const response = JSON.parse(this.responseText);
        for (let i = 0; i < response.length; i++) {
            $("#sapphireUplineAdd").append("<option>" + response[i].name + "</option>");
        }
    }
    xhttp.open("POST", "getUserName");
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(data));
}

function generateUVDropDown() {
    for (let i = 1; i <= 10; i = i + 0.5) {
        if (i == 6) {
            $("#uvAdd").append("<option selected>" + i + " UV</option>");
        } else {
            $("#uvAdd").append("<option>" + i + " UV</option>");
        }

    }
}

function deleteClosing() {
    $(".loading").toggleClass("hide");

    const id = $("#userName").html();

    var data = {
        id: id
    };

    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/closing/deleteClosing");
    xhttp.onload = function () {
        loadClosings();

    }
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(data));
}

function addTotalRow() {
    $(".closings").append(`
        <tr class="table-warning">
            <th class="align-middle" scope="row"></th>
            <td class="align-middle"></td>
            <td class="align-middle txt-align-center">Total UV :</td>
            <td class="align-middle ">
            <b>
            <span class="total_uv"></span>
            </b>
            </td>
            <td class="align-middle"></td>
            <td class="align-middle txt-align-center"> ${settingsJson.showProfit ? 'Total Profit :' : ''}</td>
            <td class="align-middle ${settingsJson.showProfit ? '' : 'hide'}">
            <b>
            <i class="material-icons" style="font-size:20px">currency_rupee</i>
                <span class="total_profit">    
                </span>
            </b>
            </td>
            <td class="align-middle"></td>
        </tr>
            `);

    updateTotal();
}

function generateTableHeader(){
    $(".closings-header").append(`
        <tr>
                            <th scope="col">#</th>
                            <th scope="col">IR</th>
                            <th scope="col">Prospect</th>
                            <th scope="col">UV</th>
                            <th scope="col">Status</th>
                            <th scope="col">Node Upline</th>
                            <th scope="col" class="${settingsJson.showProfit ? '' : 'hide'}">Profit</th>
                            <th scope="col">Action</th>
                          </tr>
        `);
}

function updateTotal() {
    var totalUV = 0;
    var totalProfit = 0;

    $(".uv").each(function () {
        totalUV += parseFloat($(this).val());
    });

    $(".total_uv").html(totalUV + " UV");

    const chq = parseInt(totalUV/3);
    totalProfit = chq * 15000;

    $(".total_profit").html(numberWithCommas(totalProfit));
}

var deleteModal = document.getElementById('deleteClosingModal');
deleteModal.addEventListener('show.bs.modal', function (event) {

    var button = event.relatedTarget;
    // Extract info from data-bs-* attributes
    var id = button.getAttribute('data-bs-id');
    // var group = button.getAttribute('data-bs-group');
    // If necessary, you could initiate an AJAX request here
    // and then do the updating in a callback.
    //
    // Update the modal's content.
    $("#userName").html(id);
    // $("#groupDeleteModal").html(group);
})

function loadSettings() {
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/settings/getSettings");
    xhttp.onload = function () {
        const response = JSON.parse(this.responseText);
        settingsJson = response;
        generateTableHeader();
        loadClosings();
    }
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send();
}

loadSettings();

generateUVDropDown();
generateNodeDropDown();