function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}

function getFields(table) {
    const fields = [];
    for (let i = 0; i < table.length; i++) {
        // addField(SKB_table[i].header);

        if (table[i].sub_heading.length > 0) {
            for (let j = 0; j < table[i].sub_heading.length; j++) {
                // addSubField(SKB_table[i].sub_heading[j], SKB_table[i].header);
                fields.push(camelize((table[i].header + table[i].sub_heading[j]).toString()));
            }
        } else {
            fields.push(camelize(table[i].header));
        }
    }

    return fields;
}

var settingsJson = {};


//Node connections

function addConnection(startNode, endNode) {
    settingsJson.connections.push(
        {
            startNode: startNode.title,
            endNode: endNode.title
        }
    );
    // console.log(settingsJson.connections);
}

function removeConnection(startNode) {
    for (let i = 0; i < settingsJson.connections.length; i++) {
        if (settingsJson.connections[i].startNode == startNode.title) {
            settingsJson.connections.splice(i, 1);
            break;
        }
    }
    // console.log(settingsJson.connections);
}

$("#saveConnections").click(function () {
    $("#saveConnections").prop("disabled", true);
    $(".loading_connection").removeClass("hide");
    $(".alert_connection").addClass("hide");

    const data = { config: settingsJson };
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/settings/saveSettings");
    xhttp.onload = function () {
        // clearInterval(idInterval);

        // loadSettings();

        $("#saveConnections").prop("disabled", false);
        $(".loading_connection").addClass("hide");
        $(".alert_connection").removeClass("hide");
        setTimeout(function () { $(".alert_connection").addClass("hide"); }, 10000);
    }
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(data));
    // idInterval = setInterval(getStatus, 2000);
});

class NodeThunder {
    constructor(x, y, title = 'Node', type = 'default') {
        this.x = x;
        this.y = y;
        this.width = 150;
        this.height = 40;
        this.title = title;
        this.type = type;

        // Set inputs and outputs based on node type
        switch (type) {
            case 'input-only':
                this.inputs = [{ name: 'in' }];
                this.outputs = [];
                break;
            case 'output-only':
                this.inputs = [];
                this.outputs = [{ name: 'out' }];
                break;
            default:
                this.inputs = [{ name: 'in' }];
                this.outputs = [{ name: 'out' }];
        }
    }

    getInputPortPosition(index) {
        return {
            x: this.x,
            y: this.y + this.height / 2 // Center the single port vertically
        };
    }

    getOutputPortPosition(index) {
        return {
            x: this.x + this.width,
            y: this.y + this.height / 2 // Center the single port vertically
        };
    }
}

class NodeEditorThunder {
    constructor() {
        this.canvas = document.getElementById('nodeCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.selectedNode = null;
        this.connections = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.clickConnection = null;

        this.setupCanvas();
        this.addEventListeners();
        this.createInitialNodes();
        this.draw(); // Initial draw
    }

    setupCanvas() {
        this.resizeCanvas();
        this.resizeObserver = new ResizeObserver(() => this.resizeCanvas());
        this.resizeObserver.observe(this.canvas);
    }

    resizeCanvas() {
        // Get the actual dimensions of the container
        const rect = this.canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio;

        // Set the canvas display size
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';

        // Set canvas buffer size
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;

        // Scale the context to account for the device pixel ratio
        this.ctx.scale(dpr, dpr);

        // Store the canvas bounds for coordinate conversions
        this.canvasBounds = {
            width: rect.width,
            height: rect.height,
            dpr: dpr
        };

        // Request a redraw
        this.draw();
    }

    addEventListeners() {
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        // window.addEventListener('mousemove', this.onMouseMove.bind(this));
        // window.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    // onKeyDown(e) {
    //     if (e.key === 'Escape' && this.clickConnection) {
    //         this.clickConnection = null;
    //         this.selectedNode = null;
    //         requestAnimationFrame(() => this.draw());
    //     }
    // }

    showNotification(message, type = 'addition') {
        // Log with color based on type
        const color = type === 'addition' ? '#4CAF50' : '#f44336';
        console.log(`%c${message}`, `color: ${color}`);
    }

    createInitialNodes() {
        const fieldsSKB = getFields(settingsJson.SKB_table);
        const fieldsSapphire = getFields(settingsJson.Sapphire_table);


        for (let i = 0; i < fieldsSKB.length; i++) {
            this.addNode(100, 100 + i * 50, fieldsSKB[i], 'output-only');
        }

        for (let i = 0; i < fieldsSapphire.length; i++) {
            this.addNode(500, 100 + i * 50, fieldsSapphire[i], 'input-only');
        }

        // console.log(settingsJson.connections);

        for (let i = 0; i < settingsJson.connections.length; i++) {
            const startNode = this.nodes.find(node => node.title === settingsJson.connections[i].startNode);
            const endNode = this.nodes.find(node => node.title === settingsJson.connections[i].endNode && node.type === 'input-only');
            if (startNode && endNode) {
                this.connections.push({
                    startNode: startNode,
                    startPortIndex: 0,
                    endNode: endNode,
                    endPortIndex: 0
                });
                // Show notification for initial connection
                this.showNotification(`Connected "${startNode.title}" to "${endNode.title}"`, 'addition');
            }
        }

    }

    addNode(x, y, title, type = 'default') {
        const node = new NodeThunder(x, y, title, type);
        this.nodes.push(node);
        return node;
    }

    findConnectionForPort(node, portIndex, isOutput) {
        return this.connections.findIndex(conn => {
            if (isOutput) {
                return conn.startNode === node && conn.startPortIndex === portIndex;
            } else {
                return conn.endNode === node && conn.endPortIndex === portIndex;
            }
        });
    }

    onMouseDown(e) {
        if (e.button !== 0) return; // Only handle left clicks

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Find clicked node first
        const clickedNode = this.findNodeUnderMouse(x, y);
        if (clickedNode) {
            // If we already have a click connection started
            if (this.clickConnection) {
                // Only allow output to input node connections
                if (clickedNode.type === 'input-only' && this.clickConnection.type === 'output-only') {
                    // Check if the input node already has a connection and remove it
                    const existingConnection = this.connections.find(conn => conn.endNode === clickedNode);
                    if (existingConnection) {
                        const index = this.connections.indexOf(existingConnection);
                        this.showNotification(`Removed connection from "${existingConnection.startNode.title}"`, 'removal');
                        this.connections.splice(index, 1);
                        removeConnection(existingConnection.startNode);
                    }

                    // Create new connection
                    this.connections.push({
                        startNode: this.clickConnection,
                        startPortIndex: 0,
                        endNode: clickedNode,
                        endPortIndex: 0
                    });
                    this.showNotification(`Connected "${this.clickConnection.title}" to "${clickedNode.title}"`, 'addition');
                    addConnection(this.clickConnection, clickedNode);
                }
                this.clickConnection = null;
                this.selectedNode = null;
            } else {
                // Check if clicked node is connected and delete connection if it is
                const isInput = clickedNode.type === 'input-only';
                const existingConnection = this.connections.find(conn =>
                    isInput ? conn.endNode === clickedNode : conn.startNode === clickedNode
                );

                if (existingConnection) {
                    // Remove the connection
                    const index = this.connections.indexOf(existingConnection);
                    this.showNotification(`Removed connection between "${existingConnection.startNode.title}" and "${existingConnection.endNode.title}"`, 'removal');
                    this.connections.splice(index, 1);
                    removeConnection(existingConnection.startNode);
                } else if (clickedNode.type === 'output-only') {
                    // Start new connection if it's an output node
                    this.clickConnection = clickedNode;
                    this.selectedNode = clickedNode;
                    this.showNotification(`Started connection from "${clickedNode.title}"`, 'addition');
                }
            }
            requestAnimationFrame(() => this.draw());
            return;
        }

        // If clicked outside nodes, cancel any pending click connection
        if (this.clickConnection) {
            this.clickConnection = null;
            this.selectedNode = null;
            requestAnimationFrame(() => this.draw());
        }
    }

    // onMouseMove(e) {
    //     this.mouseX = (e.clientX - this.canvas.getBoundingClientRect().left);
    //     this.mouseY = (e.clientY - this.canvas.getBoundingClientRect().top);
    //     requestAnimationFrame(() => this.draw());
    // }

    findPortUnderMouse(x, y) {
        const portRadius = 8; // Slightly larger than visual size for easier clicking

        for (const node of this.nodes) {
            // Check output ports
            for (let i = 0; i < node.outputs.length; i++) {
                const pos = node.getOutputPortPosition(i);
                if (Math.hypot(x - pos.x, y - pos.y) < portRadius) {
                    return { node, portIndex: i, isOutput: true };
                }
            }

            // Check input ports
            for (let i = 0; i < node.inputs.length; i++) {
                const pos = node.getInputPortPosition(i);
                if (Math.hypot(x - pos.x, y - pos.y) < portRadius) {
                    return { node, portIndex: i, isOutput: false };
                }
            }
        }
        return null;
    }

    isPortConnected(node, portIndex, isOutput) {
        return this.connections.some(conn => {
            if (isOutput) {
                return conn.startNode === node && conn.startPortIndex === portIndex;
            } else {
                return conn.endNode === node && conn.endPortIndex === portIndex;
            }
        });
    }

    drawNode(node) {
        // Check if node has any connections
        const hasConnection = this.connections.some(conn =>
            conn.startNode === node || conn.endNode === node
        );

        // Draw main node body with highlight
        this.ctx.fillStyle = '#3a3a3a';
        this.ctx.strokeStyle = this.selectedNode === node ? '#90EE90' : (hasConnection ? '#90EE90' : '#555');
        this.ctx.lineWidth = 1.5;

        this.ctx.beginPath();
        this.ctx.roundRect(node.x, node.y, node.width, node.height, 5);
        this.ctx.fill();
        this.ctx.stroke();

        // Draw node title
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(node.title, node.x + node.width / 2, node.y + node.height / 2);

        // Draw input ports
        node.inputs.forEach((input, index) => {
            const pos = node.getInputPortPosition(index);
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
            this.ctx.fillStyle = this.isPortConnected(node, index, false) ? '#90ee90' : '#666';
            this.ctx.fill();
            this.ctx.stroke();
        });

        // Draw output ports
        node.outputs.forEach((output, index) => {
            const pos = node.getOutputPortPosition(index);
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
            this.ctx.fillStyle = this.isPortConnected(node, index, true) ? '#90ee90' : '#666';
            this.ctx.fill();
            this.ctx.stroke();
        });
    }

    findNodeUnderMouse(x, y) {
        return this.nodes.find(node =>
            x >= node.x && x <= node.x + node.width &&
            y >= node.y && y <= node.y + node.height
        );
    }

    drawConnections() {
        this.ctx.strokeStyle = '#90ee90';
        this.ctx.lineWidth = 2;

        this.connections.forEach(conn => {
            const startPos = conn.startNode.getOutputPortPosition(conn.startPortIndex);
            const endPos = conn.endNode.getInputPortPosition(conn.endPortIndex);

            this.ctx.beginPath();
            this.ctx.moveTo(startPos.x, startPos.y);

            // Calculate control points for the bezier curve
            const dx = endPos.x - startPos.x;
            const controlOffset = Math.min(Math.abs(dx) * 0.5, 150);

            this.ctx.bezierCurveTo(
                startPos.x + controlOffset, startPos.y,
                endPos.x - controlOffset, endPos.y,
                endPos.x, endPos.y
            );
            this.ctx.stroke();
        });
    }

    draw() {
        // Clear with proper transform handling
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply device pixel ratio scaling
        const dpr = this.canvasBounds.dpr;
        this.ctx.scale(dpr, dpr);

        // Draw output nodes group border and heading
        const outputNodes = this.nodes.filter(node => node.type === 'output-only');
        if (outputNodes.length > 0) {
            // Calculate group bounds
            const padding = 20;
            const headerHeight = 50;
            const minX = Math.min(...outputNodes.map(n => n.x)) - padding;
            const maxX = Math.max(...outputNodes.map(n => n.x + n.width)) + padding;
            const minY = Math.min(...outputNodes.map(n => n.y)) - padding - headerHeight;
            const maxY = Math.max(...outputNodes.map(n => n.y + n.height)) + padding;

            // Draw solid border
            this.ctx.strokeStyle = '#666';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);

            // Draw centered heading
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('SKB', minX + (maxX - minX) / 2, minY + headerHeight / 2);
        }

        // Draw input nodes group border and heading
        const inputNodes = this.nodes.filter(node => node.type === 'input-only');
        if (inputNodes.length > 0) {
            // Calculate group bounds
            const padding = 20;
            const headerHeight = 50;
            const minX = Math.min(...inputNodes.map(n => n.x)) - padding;
            const maxX = Math.max(...inputNodes.map(n => n.x + n.width)) + padding;
            const minY = Math.min(...inputNodes.map(n => n.y)) - padding - headerHeight;
            const maxY = Math.max(...inputNodes.map(n => n.y + n.height)) + padding;

            // Draw solid border
            this.ctx.strokeStyle = '#666';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);

            // Draw centered heading
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText('Sapphire', minX + (maxX - minX) / 2, minY + headerHeight / 2);
        }

        // Draw connections with proper timing
        this.drawConnections();

        // Draw nodes on top
        this.nodes.forEach(node => this.drawNode(node));
    }
}



//SKB methods

$("#addFieldBtn").click(function () {
    $("#addFieldBtn").prop("disabled", true);
    $("#table_header").append(`
        <li id="add_li">
        <div class="input-group">
                                <input type="text" class="form-control" placeholder="Add Field Name" id="textFieldName">
                                
                                <button type="button" class="btn btn-danger" onclick="cancelAddField()"><i class="fa-solid fa-xmark"></i></button>
                                &nbsp;
                                <button type="button" class="btn btn-success" onclick="addField()"><i class="fa-solid fa-check"></i></button>
                              </div>
        </li>
        `);
    document.getElementById("textFieldName").focus();
});

function cancelAddField() {
    $("#addFieldBtn").prop("disabled", false);
    $('#add_li').remove();
}

function addField(fieldName = "") {
    if (fieldName == "") {
        fieldName = $("#textFieldName").val();
        settingsJson.SKB_table.push({
            header: fieldName,
            sub_heading: [],
            isEdited: false,
            prev: "",
            isAdded: true
        });
        // console.log(settingsJson.SKB_table);
        $("#settingsJsonTextSKB").val(JSON.stringify(settingsJson.SKB_table, null, 2));
        generateSKBTable(settingsJson.SKB_table);
    }
    $("#table_header").append(`
        <li draggable="true" id="` + fieldName.replaceAll(/\s/g, '') + `" ondragstart="dragstartHandlerSKB(event)" ondrop="dropHandlerSKB(event)" ondragover="dragoverHandlerSKB(event)" class="th">
                                  <span class="badge rounded-pill bg-secondary">` + fieldName + `</span>
                                    <div class="edit_heading input-group hide">
                                        <input type="text" class="form-control" placeholder="Add Field Name">
                                
                                        <button type="button" class="btn btn-danger" onclick="cancelEditField(this)"><i class="fa-solid fa-xmark"></i></button>
                                        &nbsp;
                                        <button type="button" class="btn btn-success" onclick="updateField(this)"><i class="fa-solid fa-check"></i></button>
                                    </div>
                                  <div class="btn-group">
                                    <button type="button" class="btn dropdown-toggle btn-sm"
                                      data-bs-toggle="dropdown" aria-expanded="false">
                                      <i class="fa-solid fa-ellipsis-vertical"></i>
                                    </button>
                                    <ul class="dropdown-menu">
                                      <li><button class="btn dropdown-item" onclick="add_sub_heading(this)" >Add Sub-heading</button></li>
                                      <li><button class="btn dropdown-item" onclick="edit_heading(this)" >Edit</button></li>
                                      <li><button class="btn dropdown-item" onclick="delete_heading(this)">Delete</button></li>
                                    </ul>
                                  </div>
                                  <ul class="sub_heading sub_heading_` + fieldName.replaceAll(/\s/g, '') + `">
                                  </ul>
                                </li>
        
        `);

    $("#addFieldBtn").prop("disabled", false);
    $('#add_li').remove();

}

function edit_heading(elem) {
    $(elem).parent().parent().parent().parent().children(".edit_heading").toggleClass("hide");
    $(elem).parent().parent().parent().parent().children("span").toggleClass("hide");
    $(elem).parent().parent().parent().parent().children(".btn-group").toggleClass("hide");
    $(elem).parent().parent().parent().parent().prop("draggable", false);

    const headingVal = $(elem).parent().parent().parent().parent().children("span").html();

    $(elem).parent().parent().parent().parent().children(".edit_heading").children("input").val(headingVal);
}

function cancelEditField(elem) {
    $(elem).parent().toggleClass("hide");
    $(elem).parent().parent().children("span").toggleClass("hide");
    $(elem).parent().parent().children(".btn-group").toggleClass("hide");
    $(elem).parent().parent().prop("draggable", true);
}

function updateField(elem) {
    const newVal = $(elem).parent().children("input").val();
    const oldVal = $(elem).parent().parent().children("span").html();

    //update UI
    $(elem).parent().parent().children("span").html(newVal);

    //Update JSON
    for (let i = 0; i < settingsJson.SKB_table.length; i++) {
        if (settingsJson.SKB_table[i].header == oldVal) {
            settingsJson.SKB_table[i].isEdited = true;
            settingsJson.SKB_table[i].prev = oldVal;
            settingsJson.SKB_table[i].header = newVal;
        }
    }

    $("#settingsJsonTextSKB").val(JSON.stringify(settingsJson.SKB_table, null, 2));
    generateSKBTable(settingsJson.SKB_table);


    $(elem).parent().toggleClass("hide");
    $(elem).parent().parent().children("span").toggleClass("hide");
    $(elem).parent().parent().children(".btn-group").toggleClass("hide");
    $(elem).parent().parent().prop("draggable", true);
}

function delete_heading(elem) {
    const heading_name = $(elem).parent().parent().parent().parent().children("span").html();
    // console.log(heading_name);

    for (let i = 0; i < settingsJson.SKB_table.length; i++) {
        if (settingsJson.SKB_table[i].header == heading_name) {
            settingsJson.SKB_table.splice(i, 1);
            break;
        }
    }
    // console.log(settingsJson.SKB_table);
    $("#settingsJsonTextSKB").val(JSON.stringify(settingsJson.SKB_table, null, 2));
    generateSKBTable(settingsJson.SKB_table);
    elem.parentNode.parentNode.parentNode.parentNode.remove();
}

function add_sub_heading(elem) {
    // const sub_heading_ul = elem.parentNode.parentNode.parentNode.parentNode.children[2];
    // alert($(elem).parent().parent().parent().parent());
    $(elem).parent().parent().parent().parent().children(".sub_heading").append(`
        <li class="add_li">
       <div class="input-group">
                               <input type="text" class="form-control" placeholder="Add Sub Field Name" id="textSubFieldName">
                               
                               <button type="button" class="btn btn-danger" onclick="cancelAddSubField()"><i class="fa-solid fa-xmark"></i></button>
                               &nbsp;
                               <button type="button" class="btn btn-success" onclick="addSubField()"><i class="fa-solid fa-check"></i></button>
                             </div>
       </li>
       `);
    document.getElementById("textSubFieldName").focus();

}

function cancelAddSubField() {
    $('.add_li').remove();
}

function addSubField(sub_field_name = "", heading = "") {

    if (heading == "") {
        sub_field_name = $("#textSubFieldName").val();

        const heading_name = $('.add_li').parent().parent().children("span").html();
        // console.log(heading_name);

        for (let i = 0; i < settingsJson.SKB_table.length; i++) {
            if (settingsJson.SKB_table[i].header == heading_name) {
                settingsJson.SKB_table[i].sub_heading.push(sub_field_name);
                break;
            }
        }
        // console.log(settingsJson.SKB_table);
        $("#settingsJsonTextSKB").val(JSON.stringify(settingsJson.SKB_table, null, 2));
        generateSKBTable(settingsJson.SKB_table);

        $('.add_li').parent().append(`
            <li>
                                          <span class="badge rounded-pill bg-warning">` + sub_field_name + `</span>
                                          <button type="button" class="btn btn-sm" onclick="delete_sub_heading(this)"><i class="fa-solid fa-xmark text-danger"></i></button>
            </li>
            `);
        $('.add_li').remove();
    } else {
        $('.sub_heading_' + heading.replaceAll(/\s/g, '')).append(`
            <li>
                                          <span class="badge rounded-pill bg-warning">` + sub_field_name + `</span>
                                          <button type="button" class="btn btn-sm" onclick="delete_sub_heading(this)"><i class="fa-solid fa-xmark text-danger"></i></button>
            </li>
            `);
    }


}

function delete_sub_heading(elem) {
    const heading_name = $(elem).parent().parent().parent().children("span").html();
    const sub_heading_name = $(elem).parent().children("span").html();

    // console.log(heading_name);
    // console.log(sub_heading_name);

    for (let i = 0; i < settingsJson.SKB_table.length; i++) {
        if (settingsJson.SKB_table[i].header == heading_name) {
            for (let j = 0; j < settingsJson.SKB_table[i].sub_heading.length; j++) {
                if (settingsJson.SKB_table[i].sub_heading[j] == sub_heading_name) {
                    settingsJson.SKB_table[i].sub_heading.splice(j, 1);
                    break;
                }
            }
            break;
        }
    }
    // console.log(settingsJson.SKB_table);
    $("#settingsJsonTextSKB").val(JSON.stringify(settingsJson.SKB_table, null, 2));
    generateSKBTable(settingsJson.SKB_table);
    $(elem).parent().remove();
}


function generateSKBTableTree(SKB_table) {
    $("#table_header").html("");
    for (let i = 0; i < SKB_table.length; i++) {
        addField(SKB_table[i].header);
        if (SKB_table[i].sub_heading.length > 0) {
            for (let j = 0; j < SKB_table[i].sub_heading.length; j++) {
                addSubField(SKB_table[i].sub_heading[j], SKB_table[i].header);
            }
        }
    }
}

function generateSKBTable(SKB_table) {

    $(".skb_table").html("");
    $(".skb_table").append(`
        <thead class="thead-dark">
            <tr class="header">

            </tr>
            <tr class="sub_heading">

            </tr>
        </thead>
        `);

    var isSubHeading = false;

    for (let i = 0; i < SKB_table.length; i++) {

        if (SKB_table[i].sub_heading.length > 0) {
            isSubHeading = true;
            $(".skb_table thead .header").append(`
                <th scope="col" class="txt-align-center text-light bg-dark" colspan="` + SKB_table[i].sub_heading.length + `">` + SKB_table[i].header + `</th>
                `);
        } else {
            $(".skb_table thead .header").append(`
                <th scope="col" class="txt-align-center text-light bg-dark">` + SKB_table[i].header + `</th>
                `);
        }
    }

    if (isSubHeading) {
        for (let i = 0; i < SKB_table.length; i++) {
            if (SKB_table[i].sub_heading.length > 0) {
                for (let j = 0; j < SKB_table[i].sub_heading.length; j++) {
                    $(".skb_table thead .sub_heading").append(`
                        <th scope="col" class="txt-align-center text-light bg-dark">` + SKB_table[i].sub_heading[j] + `</th>
                        `);
                }
            } else {
                $(".skb_table thead .sub_heading").append(`
                    <th scope="col" class="txt-align-center text-light bg-dark"></th>
                    `);
            }

        }
    }
}

$("#saveConfigSKB").click(function () {
    var idInterval = null;
    $("#saveConfigSKB").prop("disabled", true);
    $(".loading").removeClass("hide");
    $(".alert_skb").addClass("hide");

    $(".status").html();
    $(".progress_percentage").html();
    $(".progress-bar").css("width", "0%");

    const data = { config: settingsJson };
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/settings/saveSettings");
    xhttp.onload = function () {
        clearInterval(idInterval);
        loadSettings();
        $("#saveConfigSKB").prop("disabled", false);
        $(".loading").addClass("hide");

        $(".alert_skb").removeClass("hide");
        setTimeout(function () { $(".alert_skb").addClass("hide"); }, 10000);

    }
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(data));
    idInterval = setInterval(getStatus, 2000);
});



function dragstartHandlerSKB(ev) {
    ev.dataTransfer.setData("text", $(ev.target).children("span").html());
}

function dropHandlerSKB(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    $("#drag_drop").html(data + " -> " + $(ev.target).html());

    swapElements(data, $(ev.target).html(), settingsJson.SKB_table);

    $("#settingsJsonTextSKB").val(JSON.stringify(settingsJson.SKB_table, null, 2));
    generateSKBTableTree(settingsJson.SKB_table);
    generateSKBTable(settingsJson.SKB_table);
}

function dragoverHandlerSKB(ev) {
    ev.preventDefault();
}

//Sapphire Methods
$("#addFieldBtnSapphire").click(function () {
    $("#addFieldBtnSapphire").prop("disabled", true);
    $("#table_header_sapphire").append(`
        <li id="add_li_sapphire">
        <div class="input-group">
                                <input type="text" class="form-control" placeholder="Add Field Name" id="textFieldNameSapphire">
                                
                                <button type="button" class="btn btn-danger" onclick="cancelAddFieldSapphire()"><i class="fa-solid fa-xmark"></i></button>
                                &nbsp;
                                <button type="button" class="btn btn-success" onclick="addFieldSapphire()"><i class="fa-solid fa-check"></i></button>
                              </div>
        </li>
        `);
    document.getElementById("textFieldNameSapphire").focus();
});

function cancelAddFieldSapphire() {
    $("#addFieldBtnSapphire").prop("disabled", false);
    $('#add_li_sapphire').remove();
}

function addFieldSapphire(fieldName = "") {
    if (fieldName == "") {
        fieldName = $("#textFieldNameSapphire").val();
        settingsJson.Sapphire_table.push({
            header: fieldName,
            sub_heading: [],
            isEdited: false,
            prev: "",
            isAdded: true
        });
        // console.log(settingsJson.SKB_table);
        $("#settingsJsonTextSapphire").val(JSON.stringify(settingsJson.Sapphire_table, null, 2));
        generateSapphireTable(settingsJson.Sapphire_table);
    }
    $("#table_header_sapphire").append(`
        <li draggable="true" id="` + fieldName.replaceAll(/\s/g, '') + `_Sapphire" ondragstart="dragstartHandlerSapphire(event)" ondrop="dropHandlerSapphire(event)" ondragover="dragoverHandlerSapphire(event)" class="th">
                                  <span class="badge rounded-pill bg-secondary">` + fieldName + `</span>
                                   <div class="edit_heading input-group hide">
                                        <input type="text" class="form-control" placeholder="Add Field Name">
                                
                                        <button type="button" class="btn btn-danger" onclick="cancelEditFieldSapphire(this)"><i class="fa-solid fa-xmark"></i></button>
                                        &nbsp;
                                        <button type="button" class="btn btn-success" onclick="updateFieldSapphire(this)"><i class="fa-solid fa-check"></i></button>
                                    </div>
                                  <div class="btn-group">
                                    <button type="button" class="btn dropdown-toggle btn-sm"
                                      data-bs-toggle="dropdown" aria-expanded="false">
                                      <i class="fa-solid fa-ellipsis-vertical"></i>
                                    </button>
                                    <ul class="dropdown-menu">
                                      <li><button class="btn dropdown-item" onclick="add_sub_heading_sapphire(this)" >Add Sub-heading</button></li>
                                      <li><button class="btn dropdown-item" onclick="edit_heading_sapphire(this)" >Edit</button></li>
                                      <li><button class="btn dropdown-item" onclick="delete_heading_sapphire(this)">Delete</button></li>
                                    </ul>
                                  </div>
                                  <ul class="sub_heading sub_heading_sapphire_` + fieldName.replaceAll(/\s/g, '') + `">
                                  </ul>
                                </li>
        
        `);

    $("#addFieldBtnSapphire").prop("disabled", false);
    $('#add_li_sapphire').remove();

}

function edit_heading_sapphire(elem) {
    $(elem).parent().parent().parent().parent().children(".edit_heading").toggleClass("hide");
    $(elem).parent().parent().parent().parent().children("span").toggleClass("hide");
    $(elem).parent().parent().parent().parent().children(".btn-group").toggleClass("hide");
    $(elem).parent().parent().parent().parent().prop("draggable", false);

    const headingVal = $(elem).parent().parent().parent().parent().children("span").html();

    $(elem).parent().parent().parent().parent().children(".edit_heading").children("input").val(headingVal);
}

function cancelEditFieldSapphire(elem) {
    $(elem).parent().toggleClass("hide");
    $(elem).parent().parent().children("span").toggleClass("hide");
    $(elem).parent().parent().children(".btn-group").toggleClass("hide");
    $(elem).parent().parent().prop("draggable", true);
}

function updateFieldSapphire(elem) {
    const newVal = $(elem).parent().children("input").val();
    const oldVal = $(elem).parent().parent().children("span").html();

    //update UI
    $(elem).parent().parent().children("span").html(newVal);

    //Update JSON
    for (let i = 0; i < settingsJson.Sapphire_table.length; i++) {
        if (settingsJson.Sapphire_table[i].header == oldVal) {

            settingsJson.Sapphire_table[i].isEdited = true;
            settingsJson.Sapphire_table[i].prev = oldVal;
            settingsJson.Sapphire_table[i].header = newVal;
        }
    }

    $("#settingsJsonTextSapphire").val(JSON.stringify(settingsJson.Sapphire_table, null, 2));
    generateSapphireTable(settingsJson.Sapphire_table);


    $(elem).parent().toggleClass("hide");
    $(elem).parent().parent().children("span").toggleClass("hide");
    $(elem).parent().parent().children(".btn-group").toggleClass("hide");
    $(elem).parent().parent().prop("draggable", true);
}

function delete_heading_sapphire(elem) {
    const heading_name = $(elem).parent().parent().parent().parent().children("span").html();
    // console.log(heading_name);

    for (let i = 0; i < settingsJson.Sapphire_table.length; i++) {
        if (settingsJson.Sapphire_table[i].header == heading_name) {
            settingsJson.Sapphire_table.splice(i, 1);
            break;
        }
    }
    // console.log(settingsJson.SKB_table);
    $("#settingsJsonTextSapphire").val(JSON.stringify(settingsJson.Sapphire_table, null, 2));
    generateSapphireTable(settingsJson.Sapphire_table);
    elem.parentNode.parentNode.parentNode.parentNode.remove();
}

function add_sub_heading_sapphire(elem) {
    // const sub_heading_ul = elem.parentNode.parentNode.parentNode.parentNode.children[2];
    // alert($(elem).parent().parent().parent().parent());
    $(elem).parent().parent().parent().parent().children(".sub_heading").append(`
        <li class="add_li_sapphire">
       <div class="input-group">
                               <input type="text" class="form-control" placeholder="Add Sub Field Name" id="textSubFieldNameSapphire">
                               
                               <button type="button" class="btn btn-danger" onclick="cancelAddSubFieldSapphire()"><i class="fa-solid fa-xmark"></i></button>
                               &nbsp;
                               <button type="button" class="btn btn-success" onclick="addSubFieldSapphire()"><i class="fa-solid fa-check"></i></button>
                             </div>
       </li>
       `);
    document.getElementById("textSubFieldNameSapphire").focus();

}

function cancelAddSubFieldSapphire() {
    $('.add_li_sapphire').remove();
}

function addSubFieldSapphire(sub_field_name = "", heading = "") {

    if (heading == "") {
        sub_field_name = $("#textSubFieldNameSapphire").val();

        const heading_name = $('.add_li_sapphire').parent().parent().children("span").html();
        // console.log(heading_name);

        for (let i = 0; i < settingsJson.Sapphire_table.length; i++) {
            if (settingsJson.Sapphire_table[i].header == heading_name) {
                settingsJson.Sapphire_table[i].sub_heading.push(sub_field_name);
                break;
            }
        }
        // console.log(settingsJson.SKB_table);
        $("#settingsJsonTextSapphire").val(JSON.stringify(settingsJson.Sapphire_table, null, 2));
        generateSapphireTable(settingsJson.Sapphire_table);

        $('.add_li_sapphire').parent().append(`
            <li>
                                          <span class="badge rounded-pill bg-warning">` + sub_field_name + `</span>
                                          <button type="button" class="btn btn-sm" onclick="delete_sub_heading_sapphire(this)"><i class="fa-solid fa-xmark text-danger"></i></button>
            </li>
            `);
        $('.add_li').remove();
    } else {
        $('.sub_heading_sapphire_' + heading.replaceAll(/\s/g, '')).append(`
            <li>
                                          <span class="badge rounded-pill bg-warning">` + sub_field_name + `</span>
                                          <button type="button" class="btn btn-sm" onclick="delete_sub_heading_sapphire(this)"><i class="fa-solid fa-xmark text-danger"></i></button>
            </li>
            `);
    }


}

function delete_sub_heading_sapphire(elem) {
    const heading_name = $(elem).parent().parent().parent().children("span").html();
    const sub_heading_name = $(elem).parent().children("span").html();

    // console.log(heading_name);
    // console.log(sub_heading_name);

    for (let i = 0; i < settingsJson.Sapphire_table.length; i++) {
        if (settingsJson.Sapphire_table[i].header == heading_name) {
            for (let j = 0; j < settingsJson.Sapphire_table[i].sub_heading.length; j++) {
                if (settingsJson.Sapphire_table[i].sub_heading[j] == sub_heading_name) {
                    settingsJson.Sapphire_table[i].sub_heading.splice(j, 1);
                    break;
                }
            }
            break;
        }
    }
    // console.log(settingsJson.SKB_table);
    $("#settingsJsonTextSapphire").val(JSON.stringify(settingsJson.Sapphire_table, null, 2));
    generateSapphireTable(settingsJson.Sapphire_table);
    $(elem).parent().remove();
}

function generateSapphireTableTree(Sapphire_table) {
    $("#table_header_sapphire").html("");
    // console.log(Sapphire_table);
    for (let i = 0; i < Sapphire_table.length; i++) {
        addFieldSapphire(Sapphire_table[i].header);
        if (Sapphire_table[i].sub_heading.length > 0) {
            for (let j = 0; j < Sapphire_table[i].sub_heading.length; j++) {
                addSubFieldSapphire(Sapphire_table[i].sub_heading[j], Sapphire_table[i].header);
            }
        }
    }
}

function generateSapphireTable(Sapphire_table) {

    $(".sapphire_table").html("");
    $(".sapphire_table").append(`
        <thead class="thead-dark">
            <tr class="header">

            </tr>
            <tr class="sub_heading">

            </tr>
        </thead>
        `);

    var isSubHeading = false;

    for (let i = 0; i < Sapphire_table.length; i++) {

        if (Sapphire_table[i].sub_heading.length > 0) {
            isSubHeading = true;
            $(".sapphire_table thead .header").append(`
                <th scope="col" class="txt-align-center text-light bg-dark" colspan="` + Sapphire_table[i].sub_heading.length + `">` + Sapphire_table[i].header + `</th>
                `);
        } else {
            $(".sapphire_table thead .header").append(`
                <th scope="col" class="txt-align-center text-light bg-dark">` + Sapphire_table[i].header + `</th>
                `);
        }
    }

    if (isSubHeading) {
        for (let i = 0; i < Sapphire_table.length; i++) {
            if (Sapphire_table[i].sub_heading.length > 0) {
                for (let j = 0; j < Sapphire_table[i].sub_heading.length; j++) {
                    $(".sapphire_table thead .sub_heading").append(`
                        <th scope="col" class="txt-align-center text-light bg-dark">` + Sapphire_table[i].sub_heading[j] + `</th>
                        `);
                }
            } else {
                $(".sapphire_table thead .sub_heading").append(`
                    <th scope="col" class="txt-align-center text-light bg-dark"></th>
                    `);
            }

        }
    }
}

$("#saveConfigSapphire").click(function () {
    var idInterval = null;
    $("#saveConfigSapphire").prop("disabled", true);
    $(".loading_sapphire").removeClass("hide");
    $(".alert_sapphire").addClass("hide");

    $(".status").html();
    $(".progress_percentage").html();
    $(".progress-bar").css("width", "0%");

    const data = { config: settingsJson };
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/settings/saveSettings");
    xhttp.onload = function () {
        clearInterval(idInterval);

        loadSettings();

        $("#saveConfigSapphire").prop("disabled", false);
        $(".loading_sapphire").addClass("hide");

        $(".alert_sapphire").removeClass("hide");
        setTimeout(function () { $(".alert_sapphire").addClass("hide"); }, 10000);
    }
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(data));
    idInterval = setInterval(getStatus, 2000);
});

function dragstartHandlerSapphire(ev) {
    ev.dataTransfer.setData("textSapphire", $(ev.target).children("span").html());
}

function dropHandlerSapphire(ev) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("textSapphire");
    $("#drag_drop_sapphire").html(data + " -> " + $(ev.target).html());

    swapElements(data, $(ev.target).html(), settingsJson.Sapphire_table);

    $("#settingsJsonTextSapphire").val(JSON.stringify(settingsJson.Sapphire_table, null, 2));
    generateSapphireTableTree(settingsJson.Sapphire_table);
    generateSapphireTable(settingsJson.Sapphire_table);
}

function dragoverHandlerSapphire(ev) {
    ev.preventDefault();
}

//Common Methods

function editColSpan(elem) {
    $(elem).toggleClass("hide");
    $(elem).parent().children(".btn_controls").toggleClass("hide");
    $(elem).parent().children("input").prop("disabled", false);

}

function cancelColSpan(elem) {
    $(elem).parent().toggleClass("hide");
    $(elem).parent().parent().children("button").toggleClass("hide");
    $(elem).parent().parent().children("input").prop("disabled", true);
}

function saveColSpan(elem, page, group) {
    $(elem).parent().toggleClass("hide");
    $(elem).parent().parent().children("button").toggleClass("hide");
    $(elem).parent().parent().children("input").prop("disabled", true);

    settingsJson["total" + page + group + "ColSpan"] = parseInt($(elem).parent().parent().children("input").val());

    console.log(settingsJson);


}

//Import/Export methods

function importExportDropDownOnChanged(elem) {
    const dropDownVal = $(elem).val();
    if (dropDownVal == "Import Data") {
        $(elem).parent().siblings(".browse_container").removeClass("hide");
        $(elem).parent().siblings(".selectCollection_container").addClass("hide");
    } else {
        $(elem).parent().siblings(".browse_container").addClass("hide");
        $(elem).parent().siblings(".selectCollection_container").removeClass("hide");
    }
}

function generateNameDropDown() {
    $("#selectCollection").prop('disabled', true);
    $("#name").html("");
    $("#name").addClass("text-success");
    $("#name").append("<option > Loading ... </option>");
    const group = $("#selectCollection").val();

    // console.log(group);
    var data = {};

    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {
        // alert(JSON.parse(this.responseText).length);

        const response = JSON.parse(this.responseText);
        $("#name").html("");
        $("#name").removeClass("text-success");
        $("#name").append("<option>All</option>");

        for (let i = 0; i < response.length; i++) {
            $("#name").append("<option>" + response[i] + "</option>");
        }
        $("#selectCollection").prop('disabled', false);


    }
    xhttp.open("POST", "/getUserName/onlyNames");
    xhttp.setRequestHeader('Content-Type', 'application/json');
    if (group == "SKB") {
        data = { group: "SKB" };
    }
    else {
        data = { group: "Sapphire" }
    }
    xhttp.send(JSON.stringify(data));
}

var idInterval = null;
function processRequest() {

    $("#processBtn").prop("disabled", true);
    $(".loading_import").removeClass("hide");
    $(".alert_import").addClass("hide");

    $(".status").html();
    $(".progress_percentage").html();
    $(".progress-bar").css("width", "0%");

    const reqType = $("#reqType").val();
    const group = $("#selectCollection").val();
    const field = $("#name").val();

    if (reqType == "Export Data") {
        const data = { group: group, field: field };
        const xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/settings/export");
        xhttp.onload = function () {
            clearInterval(idInterval);
            $("#processBtn").prop("disabled", false);
            $(".loading_import").addClass("hide");
            $(".alert_import").removeClass("hide");
            setTimeout(function () { $(".alert_import").addClass("hide"); }, 10000);
        }
        xhttp.setRequestHeader('Content-Type', 'application/json');
        xhttp.send(JSON.stringify(data));
        idInterval = setInterval(getStatusExport, 2000);

    } else {
        const importDb = importFile.files[0];
        let formData = new FormData();
        formData.append("file", importDb);
        fetch('/settings/upload', {
            method: "POST",
            body: formData
        });
        // console.log("hello");
        idInterval = setInterval(getStatusImport, 2000);
    }
}

//Helper
function swapElements(itemA, itemB, jsonData) {
    var indexA = null;
    var indexB = null;
    for (let i = 0; i < jsonData.length; i++) {
        if (jsonData[i].header == itemA) {
            indexA = i;
        }
        if (jsonData[i].header == itemB) {
            indexB = i;
        }
    }
    if (indexA != null && indexB != null) {
        var c = jsonData[indexA];
        jsonData[indexA] = jsonData[indexB];
        jsonData[indexB] = c;
    }

}

function loadSettings() {
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/settings/getSettings");
    xhttp.onload = function () {
        const response = JSON.parse(this.responseText);
        settingsJson = response;

        //set show Profit switch
        $("#showProfitSwitch").prop("checked", settingsJson.showProfit);

        //Load SKB Settings
        $("#settingsJsonTextSKB").val(JSON.stringify(settingsJson.SKB_table, null, 2));

        $("#viewColSpanSKB").val(settingsJson.totalViewSKBColSpan);
        $("#analyzeColSpanSKB").val(settingsJson.totalAnalyzeSKBColSpan);
        $("#viewColSpanSapphire").val(settingsJson.totalViewSapphireColSpan);
        $("#analyzeColSpanSapphire").val(settingsJson.totalAnalyzeSapphireColSpan);

        generateSKBTableTree(settingsJson.SKB_table);
        generateSKBTable(settingsJson.SKB_table);

        //Load Sapphire settings
        $("#settingsJsonTextSapphire").val(JSON.stringify(settingsJson.Sapphire_table, null, 2));
        generateSapphireTableTree(settingsJson.Sapphire_table);
        generateSapphireTable(settingsJson.Sapphire_table);

        console.log("Node Editor Loaded");
        const editor = new NodeEditorThunder();
    }
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send();
}

//status functions

function getStatus() {
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/settings/getStatus");
    xhttp.onload = function () {
        const response = JSON.parse(this.responseText);
        console.log(response);
        $(".status").html("<span class='badge rounded-pill text-bg-success'>" + response.procName + "</span> &nbsp; <b>" + response.docName + "</b> => " + response.status);
        $(".progress_percentage").html(parseInt(response.progress).toString() + "%");
        $(".progress-bar").css("width", parseInt(response.progress).toString() + "%");
    }
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send();
}

function getStatusExport() {

    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/settings/getStatus");
    xhttp.onload = function () {
        const response = JSON.parse(this.responseText);
        // console.log(response);
        $(".status").html("<span class='badge rounded-pill text-bg-success'>" + response.procName + "</span> &nbsp; <b>" + response.docName + "</b> => " + response.status + "   <b>Week " + response.week + ", " + response.year + "</b>");
        $(".progress_percentage").html(parseInt(response.progress).toString() + "%");
        $(".progress-bar").css("width", parseInt(response.progress).toString() + "%");
    }
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send();
}

function getStatusImport() {
    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/settings/getStatus");
    xhttp.onload = function () {
        const response = JSON.parse(this.responseText);
        if (response.status == "done") {
            clearInterval(idInterval);
            $("#processBtn").prop("disabled", false);
            $(".loading_import").addClass("hide");
            $(".alert_import").removeClass("hide");
            setTimeout(function () { $(".alert_import").addClass("hide"); }, 10000);
        }
        // console.log(response);
        $(".status").html("<span class='badge rounded-pill text-bg-success'>" + response.procName + "</span> &nbsp; <b>" + response.docName + "</b> => " + response.status + "   <b>Week " + response.week + ", " + response.year + "</b>");
        $(".progress_percentage").html(parseInt(response.progress).toString() + "%");
        $(".progress-bar").css("width", parseInt(response.progress).toString() + "%");
    }
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send();
}

function toggleShowProfit() {
   settingsJson.showProfit = $("#showProfitSwitch").prop("checked");
   const data = { config: settingsJson };
    const xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/settings/updateShowProfit");
    xhttp.onload = function () {
        
    }
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(data));
}

loadSettings();
generateNameDropDown();

