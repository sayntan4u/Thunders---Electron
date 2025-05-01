// Add Member functionality
$('#saveMember').on('click', function () {
    addPerson();
});

var userJson = [];
var sapphireJson = [];

function addPerson() {
    const nm = $('#memberName').val();
    const grp = $("#memberGroup").val();

    const data = { name: nm, group: grp };

    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {

        const response = this.responseText;
        if(response == "success"){
            
            // loadNames();
            addName(nm);
            $("#newPersonName").html(nm);
            $('#memberName').val("");
            $('.add_alert').removeClass("hide").addClass("show");
            setTimeout(function () { $('.add_alert').removeClass("show").addClass("hide"); }, 6000);
        }
    }
    xhttp.open("POST", "/add/addUser");
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(data));
    $(".names").html("");
    $(".loading").removeClass("hide");

}

function addName(name) {
    if ($("#memberGroup").val() == "SKB") {
        // userJson.push({ name: name, namelist: ""});
        // generateNamesTable(userJson);
        $("#groupSelect").val("SKB").change();
    }
    else {
        // sapphireJson.push({ name: name});
        // generateNamesTable(sapphireJson, "Sapphire");
        $("#groupSelect").val("Sapphire").change();
    }

}

function loadNames() {
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/add/getNames");
    xhttp.onload = function () {

        const response = JSON.parse(this.responseText);
        userJson = response;
        if (userJson.length > 0) {
            generateNamesTable(response);
        } else {
            $(".loading").addClass("hide");
        }


    }
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send();
}

function loadSapphire() {
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/add/getNamesSapphire");
    xhttp.onload = function () {
        const response = JSON.parse(this.responseText);
        sapphireJson = response;
        if (sapphireJson.length > 0) {
            generateNamesTable(response, "Sapphire");
        } else {
            $(".loading").addClass("hide");
        }


    }
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send();
}

function changeGroup() {
    const grp = $("#groupSelect").val();
    $(".loading").removeClass("hide");
    $(".names").html("");
    if (grp == "SKB") {
        loadNames();
    } else {
        loadSapphire();
    }
}

function generateNamesTable(response, group = "SKB") {
    $(".names").html("");
    for (let i = 0; i < response.length; i++) {

        if (group == "SKB") {
            $(".names").append(`
                <tr class="align-middle">
                    <th scope="row">${i + 1}</th>
                    <td>${response[i].name}</td>
                    <td class="namelist_container">
                    
                    <div class="row g-3 align-items-center">
                        <div class="col-auto">
                        <a href="${response[i].namelist == "" ? "#" : response[i].namelist}" id="${response[i].name}-link" target="_blank" class=${response[i].namelist == "" ? "text-danger" : "text-success"}>${response[i].name}'s Namelist</a>
                           <input class="form-control hide" type="text" id="${response[i].name}-text"/> 
                        </div>
                        <div class="col-auto">
                            <button id="${response[i].name}-btnCancel" class="btn bg-info-subtle text-info-emphasis btn-sm hide" onclick="cancel_edit('${response[i].name}')"><i class="fa-solid fa-xmark"></i></button>
                        </div>
                        <div class="col-auto">
                            <button id="${response[i].name}-btn" class="btn bg-info-subtle text-info-emphasis btn-sm" onclick="show_editText('${response[i].name}')"><i class="fa-solid fa-pen"></i></button>
                        </div>
                    </div>
                    </td>
                    <td><b>${group}</b></td>
                    <td>
                        <button class="btn bg-danger-subtle text-danger-emphasis" data-bs-toggle="modal" data-bs-target="#deleteMemberModal" data-bs-name='${response[i].name}' data-bs-group = "SKB">Delete Person</button>
                    </td>
                </tr>
                    `);
        } else {
            $(".names").append(`
                <tr class="align-middle">
                    <th scope="row">${i + 1}</th>
                    <td>${response[i].name}</td>
                    <td>
                    </td>
                    <td><b>${group}</b></td>
                    <td>
                        <button class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deleteMemberModal" data-bs-name='${response[i].name}' data-bs-group = "Sapphire">Delete Person</button>
                    </td>
                </tr>
                    `);
        }


        $(".loading").addClass("hide");
    }
}

function show_editText(name) {
    if ($("#" + name + "-btn").html() == '<i class="fa-solid fa-floppy-disk" aria-hidden="true"></i>') {
        //save
        const data = { name: name, link: $("#" + name + "-text").val() };

        const xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/add/updateNamelist");
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send(JSON.stringify(data));

        if ($("#" + name + "-text").val() == "") {
            $("#" + name + "-link").attr("href", "#");
            $("#" + name + "-link").removeClass("text-success").addClass("text-danger");
        } else {
            $("#" + name + "-link").attr("href", $("#" + name + "-text").val());
            $("#" + name + "-link").removeClass("text-danger").addClass("text-success");
        }

        $("#" + name + "-text").addClass("hide");
        $("#" + name + "-link").removeClass("hide");
        $("#" + name + "-btnCancel").addClass("hide");
        $("#" + name + "-btn").html('<i class="fa-solid fa-pen"></i>');

        // location.href = "/add";



    } else {
        //edit
        $("#" + name + "-text").val($("#" + name + "-link").attr("href") == "#" ? "" : $("#" + name + "-link").attr("href"));
        $("#" + name + "-link").addClass("hide");
        $("#" + name + "-text").removeClass("hide");
        $("#" + name + "-btnCancel").removeClass("hide");
        $("#" + name + "-btn").html('<i class="fa-solid fa-floppy-disk"></i>');
    }

}

function cancel_edit(name) {
    $("#" + name + "-text").addClass("hide");
    $("#" + name + "-link").removeClass("hide");
    $("#" + name + "-btnCancel").addClass("hide");
    $("#" + name + "-btn").html('<i class="fa-solid fa-pen"></i>');
}

var deleteModal = document.getElementById('deleteMemberModal');
deleteModal.addEventListener('show.bs.modal', function (event) {

    var button = event.relatedTarget;
    // Extract info from data-bs-* attributes
    var name = button.getAttribute('data-bs-name');
    var group = button.getAttribute('data-bs-group');
    // If necessary, you could initiate an AJAX request here
    // and then do the updating in a callback.
    //
    // Update the modal's content.
    $("#userName").html(name);
    $("#groupDeleteModal").html(group);
})

function deleteUser() {
    const nm = $("#userName").html();
    const group = $("#groupDeleteModal").html();

    const data = { name: nm, group: group };
    // alert(name);
    // location.href = "/delete?name=" + name;

    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/add/delete");
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(data));

    if (group == "SKB") {
        for (let i = 0; i < userJson.length; i++) {
            if (userJson[i].name == nm) {
                // delete userJson[i];
                userJson.splice(i, 1);
                break;
            }
        }
        generateNamesTable(userJson);
    } else {
        for (let i = 0; i < sapphireJson.length; i++) {
            if (sapphireJson[i].name == nm) {
                // delete userJson[i];
                sapphireJson.splice(i, 1);
                break;
            }
        }
        generateNamesTable(sapphireJson, "Sapphire");
    }

    $("#deletePersonName").html(nm);
    $('.delete_alert').removeClass("hide").addClass("show");
    setTimeout(function () { $('.delete_alert').removeClass("show").addClass("hide"); }, 6000);
}

function search() {
    const searchStr = $("#search_text").val();
    const grp = $("#groupSelect").val();

    resultJson = [];

    if (grp == "SKB") {
        if (searchStr != "") {
            for (let i = 0; i < userJson.length; i++) {
                if (userJson[i].name.toLowerCase().match(searchStr.toLowerCase())) {
                    resultJson.push(userJson[i]);
                }
            }
        } else {
            resultJson = userJson;
        }

    } else {
        if (searchStr != "") {
            for (let i = 0; i < sapphireJson.length; i++) {
                if (sapphireJson[i].name.toLowerCase().match(searchStr.toLowerCase())) {
                    resultJson.push(sapphireJson[i]);
                }
            }
        } else {
            resultJson = sapphireJson;
        }

    }

    generateNamesTable(resultJson, grp);


}

loadNames();
