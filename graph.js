/*
    bound to a button, that let's people upload their graph file in the
    kiali json-format
*/
function upload_kiali_graph(evt) {
    // TODO: do this with a predefined object that represents the correct format
    // so the file can be rejected if it is not correct
    var file = evt.target.files[0];
    var kiali_graph_string;

    var reader = new FileReader();
    reader.onload = function() {
        kiali_graph_string = reader.result;
        //document.getElementById("imagetest").innerHTML = kiali_graph_string;
        var kiali_graph_obj = JSON.parse(kiali_graph_string);
        // convert kiali format into the standard format
        convert_kiali_to_standard(kiali_graph_obj);
        draw_graph(graph_obj);
    }
    reader.readAsText(file);
}

/*
    bound to a button, that let's people upload their manually written graph
    in the standard json-format defined for this website
    TODO: Format formal beschreiben und einen Link zu der Beschreibung setzen
          Die Beschreibung könnte auch auf der Website verlinkt werden, so dass 
          Benutzer erfahren können, welches Format ihr Graph haben sollte
*/
function upload_standard_graph(evt){
    var file = evt.target.files[0];
    var graph_string;

    var reader = new FileReader();
    reader.onload = function() {
        graph_string = reader.result;
        //document.getElementById("imagetest").innerHTML = kiali_graph_string;
        var graph_obj = JSON.parse(graph_string);
        draw_graph(graph_obj);
    }
    reader.readAsText(file);
}

/*
    TODO 1: write this function
    draw the graph and display it on the website
    the graph has to be a javascript object
    only works with the standard format, kiali format
    has to be converted before calling this function
*/
function draw_graph(graph_obj) {
    // create the graph
    // TODO: find out whether it makes a difference if dagre or dagreD3 is used here
    var g = new dagreD3.graphlib.Graph();
    g.setGraph({});
    g.setDefaultEdgeLabel(function() { return {}; });

    // var clusters := [];
    var nodes = graph_obj.nodes;
    for(var i = 0; i < nodes.length; i++){
        node = nodes[i];
        g.setNode(node.id, { label: node.app + "-" + node.version,  width: 50, height: 50 });
        // TODO: if node.app is identical to an already existing node, create a cluster node
        // like this: 
        // g.setNode('top_group', {label: 'Top Group', clusterLabelPos: 'bottom', style: 'fill: #ffd47f'});
        // g.setParent('b', 'top_group');
        // clusters.push(node.app)
        // test if the cluster already exists, create an array of strings to keep
        // track of existing clusters. Strings are the node.app field, because that
        // is what is equal to all the nodes inside the cluster
    }

    var edges = graph_obj.edges;
    for(var i = 0; i < edges.length; i++){
        edge = edges[i];
        g.setEdge(edge.source, edge.target);
    }

    dagre.layout(g);

    // draw the graph
    var render = new dagreD3.render();
    var svg = d3.select("svg"), svgGroup = svg.append("g");
    render(d3.select("svg g"), g);

    // Center the graph
    // von: https://dagrejs.github.io/project/dagre-d3/latest/demo/sentence-tokenization.html
    var xCenterOffset = (svg.attr("width") - g.graph().width) / 2;
    svgGroup.attr("transform", "translate(" + xCenterOffset + ", 20)");
    svg.attr("height", g.graph().height + 40);
}


/*
    TODO 2
    convert the kiali json format into the easier format used to draw the graph
*/
function convert_kiali_to_standard(kiali_graph_obj){

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


/* 
Dieses Format wollen wir erreichen:
{
    "nodes": [
        {
          "id": "47efcb6a38cec94b8f02e15c58ce44df",
          "app": "details",
          "version": "v1",
          // erstmal per Hand einfügen
          "link" : "details-v1/docs"
        }
    ],
    "edges": [
      {
        "id": "5d577c549824d1376e9fb8477324240c",
        "source": "11b370489b738638fabddc4f4ce47ebd",
        "target": "b744c74ec7104950b36f9bf0b47a22fd"
      }
    ]
}
*/