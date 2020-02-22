/*
    bound to a button, that let's people upload their graph file in the
    kiali json-format
*/
function upload_kiali_graph(evt) {
    console.log("upload kiali");
    // TODO: do this with a predefined object that represents the correct format
    // so the file can be rejected if it is not correct
    var file = evt.target.files[0];
    var kiali_graph_string;

    var reader = new FileReader();
    reader.onload = function() {
        kiali_graph_string = reader.result;
        // store the graph, so it does not disappear when the website is reloaded
        window.localStorage.setItem('graph', kiali_graph_string);
        window.localStorage.setItem('graph_type', 'kiali');
        var kiali_graph_obj = JSON.parse(kiali_graph_string);

        // convert kiali format into the standard format
        graph_obj = convert_kiali_to_standard(kiali_graph_obj);

        draw_graph(graph_obj);

        // convert the graph object to a json-file that can be downloaded 
        // to add missing connections
        // (the kiali graph is based on the network traffic in a certain time span,
        // so it might be incomplete)
        var button = document.getElementById("download");
        var file = new Blob([JSON.stringify(graph_obj, undefined, 2)], {type: 'text/plain'});
        button.href = URL.createObjectURL(file);
        button.download = 'kiali_standard_graph.json';

        // reset the upload button, because if the same file is uploaded again,
        // the button does not fire a change-event if this is not done, this
        // would lead to problems, if a standard-graph is uploaded between the 
        // two uploads of the same kiali-graph
        document.getElementById("graph_file_kiali").value = null;

        // the user is adviced to download the graph description
        // and add documentation links
        // because a kiali graph does not contain such information
        alert("Your kiali graph has been succesfully uploaded. If you wish to" +
            " provide links to your documentation, use the 'Download Graph' button" +
            " to get your graph in the standard format and reupload it after adding them" +
            " by using the 'Upload Own Graph' button");
    }
    reader.readAsText(file);
}

/*
    bound to a button, that let's people upload their manually written graph
    in the standard json-format defined for this website
*/
function upload_standard_graph(evt){
    console.log("upload standard");
    var file = evt.target.files[0];
    var graph_string;

    var reader = new FileReader();
    reader.onload = function() {
        graph_string = reader.result;
        // to prevent graph from disappearing when site is reloaded
        window.localStorage.setItem('graph', graph_string);
        window.localStorage.setItem('graph_type', 'standard');
        var graph_obj = JSON.parse(graph_string);
        draw_graph(graph_obj);

        // make the graph downloadable
        var button = document.getElementById("download");
        var file = new Blob([JSON.stringify(graph_obj, undefined, 2)], {type: 'text/plain'});
        button.href = URL.createObjectURL(file);
        button.download = 'own_standard_graph.json';

        document.getElementById("graph_file").value = null;
    }
    reader.readAsText(file);
}

/*
    draw the graph and display it on the website
    the graph has to be a javascript object
    only works with the standard format, kiali format
    has to be converted before calling this function
*/
function draw_graph(graph_obj) {
    // add the name of the System if it is specified in the graph and set a link
    // on it to the documentation of the whole system
    // let it "disappear" if there is no system element in the graph
    var system_name = document.getElementById("system_name");
    system_name.innerHTML = "";
    system_name.href = "";
    system_name.style.backgroundColor = "white";
    system_name.style.border = "2px solid white";

    if(graph_obj.system !== undefined){
        system_name.innerHTML = graph_obj.system.name;
        if(graph_obj.system.link !== undefined){
            system_name.href = graph_obj.system.link;
            system_name.style.backgroundColor = "#afa";
            system_name.style.border = "2px solid rgb(156, 152, 152)";
        }
    }

    // create the graph
    var g = new dagreD3.graphlib.Graph({compound:true});
    g.setGraph({});
    g.setDefaultEdgeLabel(function() { return {}; });

    var nodes = graph_obj.nodes;
    var clusters = [];
    var nodes_included = [];
    for(var i = 0; i < nodes.length; i++){
        node = nodes[i];
        // The links are not limited to swagger documentation. The user should be able to bind any link to his node using the link attribute in the graph specification.
        // This design choice enables the user to use the website with any documentation form. Each microservice can be documented in it's own way.
        // Setting a link to a documentation is not required
        // If the graph specification was uploaded in kiali format, the links can be set later.
        if(node.link !== undefined){
            g.setNode(node.id, { labelType: "html", label: "<a href=" + node.link + ">" + node.app + "-" + node.version + "</a>",  width: node.app.length*10+10, height: 40, style: "fill: #afa", href: "http://www.google.com"});
        }
        else{
            g.setNode(node.id, { labelType: "html", label: node.app + "-" + node.version,  width: node.app.length*10+10, height: 40, href: "http://www.google.com"});
        }
        // create a cluster if the node is another version of an already existing app
        if(nodes_included.includes(node.app)){
            if(!clusters.includes(node.app)){
                g.setNode(node.app, {label: node.app, clusterLabelPos: ""});
                clusters.push(node.app);
            }
        }
        else{
            nodes_included.push(node.app);
        }
    }

    // add the nodes to their corresponding clusters
    // this is necessary, because the cluster is created after the second occurence
    // of an apps name, so the first version of the app would not be added if
    // everything is done in the first loop
    for(var i = 0; i < nodes.length; i++){
        node = nodes[i];
        if(clusters.includes(node.app)){
            g.setParent(node.id, node.app);
        }
    }

    var edges = graph_obj.edges;
    for(var i = 0; i < edges.length; i++){
        edge = edges[i];
        g.setEdge(edge.source, edge.target);
    }

    dagre.layout(g);
    
    // draw the graph
    var render = new dagreD3.render();
    var svg = d3.select("svg");
    var svgGroup = svg.append("g");
    render(d3.select("svg g"), g);

    // Center the graph
    // von: https://dagrejs.github.io/project/dagre-d3/latest/demo/sentence-tokenization.html
    document.getElementById("image").style.marginLeft = "" + -(g.graph().width / 2) + "px";
    svg.attr("height", g.graph().height + 40);
}


/*
    convert the kiali json format into the easier format used to draw the graph
*/
// TODO: How can the user add links to his documentation after uploading a kiali graph?
// option 1: Make nodes clickable to add a link
// option 2: store the standard format of the kiali graph
//           and make it downloadable, to add the missing links
// option 3: after drawing the graph, make a form pop up where the user
//           is asked for a link for each node
function convert_kiali_to_standard(kiali_graph_obj){
    var graph_obj = {
        nodes: [],
        edges: []
    };

    var nodes = kiali_graph_obj.elements.nodes;
    for(var i = 0; i < nodes.length; i++){
        node = nodes[i];
        graph_obj.nodes.push({
            id : node.data.id,
            app : node.data.app,
            version : node.data.version
        });
    }

    var edges = kiali_graph_obj.elements.edges;
    for(var i = 0; i < edges.length; i++){
        edge = edges[i];
        graph_obj.edges.push({
            source : edge.data.source,
            target : edge.data.target
        });
    }

    return graph_obj;
}

/*
    bind the function upload_kiali_graph to the button graph_file_kiali
    call the function every time a new file is uploaded
    wait until the whole document is loaded before binding events
*/
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('graph_file_kiali').addEventListener('change', upload_kiali_graph, false);
  });

/*
    bind the function upload_standard_graph to the button graph_file
    call the function every time a new file is uploaded
    wait until the whole document is loaded before binding events
*/
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('graph_file').addEventListener('change', upload_standard_graph, false);
  });


// to prevent graph from disappering when the site is reloaded
window.onload = function(e){
    // let system node disappear before drawing the graph
    // (since it could be from an old graph)
    // the graph disappears on its own, since it is appended and not a
    // standard element in the html document
    var system_name = document.getElementById("system_name");
    system_name.innerHTML = "";
    system_name.href = "";
    system_name.style.backgroundColor = "white";
    system_name.style.border = "2px solid white";

    var graph_stored = window.localStorage.getItem('graph');
    var graph_type = window.localStorage.getItem('graph_type');
    if(graph_stored === null){
        return;
    }
    var graph_obj = JSON.parse(graph_stored);
    if(graph_type == 'kiali'){
        convert_kiali_to_standard(graph_obj);
    }
    draw_graph(graph_obj);
}