/*
    bound to a button, that let's people upload their graph file in the
    kiali json-format
*/
function upload_kiali_graph() {
    // convert kiali format into my easier format
    convert_kiali_to_standard();
    draw_graph();
}

/*
    bound to a button, that let's people upload their manually written graph
    in the standard json-format defined for this website
    TODO: Format formal beschreiben und einen Link zu der Beschreibung setzen
          Die Beschreibung könnte auch auf der Website verlinkt werden, so dass 
          Benutzer erfahren können, welches Format ihr Graph haben sollte
*/
function upload_standard_graph(){
    draw_graph();
}

function draw_graph() {
    document.getElementById("imagetest").innerHTML = "graph goes here";
    convert_json_graph()
}

/*

*/
function convert_json_grap() {

}

/*
    convert the kiali json format into the easier format used to draw the graph
*/
function convert_kiali_to_standard(){

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