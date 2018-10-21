document.addEventListener('DOMContentLoaded', function () {
  	app.init();
});

var app = {  
    tiempo: null,     
  	note: document.getElementById('note'),
  	actualizar: document.getElementById('actualizar'),

    URL_SERVER: 'https://calcicolous-moonlig.000webhostapp.com/tiempo/index.php?id=',
    //URL_SERVER: 'http://localhost:1212/index.php?id=',

  	modal: document.getElementById('modal'),

  	init: function() {

      if(localStorage.getItem("_tiempo")){
        app.tiempo = JSON.parse(localStorage.getItem("_tiempo"));

        // JS devuelve la hora actual en milisegundos, en PHP lo devuelve en segundos
        // la hora la paso a String le quito los 3 últimos caracteres y lo paso a número
        let horaActual = new Date().getTime();
        horaActual = horaActual.toString();
        horaActual = horaActual.slice(0,-3);
        horaActual = Number(horaActual);
        
        //Two hours, 60 seg * 60 min * 2 hour
        if (horaActual > (app.tiempo.hora + 7200)) {
            app.realizarLlamada();            
        } else {
          // TODO dibujar tablar
          app.drawTable();
        }
      } else {
        app.realizarLlamada();
      }

	  	app.actualizar.addEventListener('click', (event) => {
        app.realizarLlamada();
      });

		if ('serviceWorker' in navigator) {
  		navigator.serviceWorker
    		.register('service-worker.js')
    		.then(function() {
      		//console.log('Service Worker Registered');
      	});
		}
	}, 

  realizarLlamada: function() {
    let request = new Request(app.URL_SERVER+'18087');

    fetch(request).then((results) => {
      if (results.status === 200){
        results
          .json()
          .then(( str ) => {
            localStorage.setItem("_tiempo", JSON.stringify(str));
            app.tiempo = str;
            app.drawTable();
          })
          .catch(function() {
            console.log('error al formatear los datos');
            app.obtenerDatosGuardados();
          });
      } else {      
        console.log('error al obtener los datos');
        app.obtenerDatosGuardados();        
      }
    })
    .catch(function() {
      console.log('error al obtener los datos');
      app.obtenerDatosGuardados();      
    });
  },

  obtenerDatosGuardados: function() {
    // TODO aviso error al obtener los datos
    app.modal.classList.remove('hide');    
    document.getElementById('closeModal').addEventListener('click', () => {
        app.modal.classList.add('hide');
        document.getElementById('closeModal').removeEventListener('click', ()=> {});
    });
    if(localStorage.getItem("_tiempo")){
        app.tiempo = JSON.parse(localStorage.getItem("_tiempo"));
        app.drawTable();
    }
  },

  drawTable: function() {
    if (app.tiempo.dia != undefined && app.tiempo.dia.length > 0) {
      let noteItem = app.drawData();      
      app.note.value = noteItem.toString();
    } else {
      // TODO aviso
      //alert('No carga');
    }
  },

  drawData: function(estado, element) {
    let exit = "";
    app.tiempo.dia.forEach(function(element) {
        exit += element.fecha;
        exit += "\n";

        element.estadoCielo.forEach(function(estado, index) {
          exit += estado.periodo + ":00 - " + estado.descripcion + " - " + element.temperatura[index].value + "º - " + element.precipitacion[index].value;
          exit += "\n";
        });

        exit += "\n";
        exit += "\n";
      });
    return exit;
  }
};
