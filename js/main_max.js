document.addEventListener('DOMContentLoaded', function () {
  	app.init();
});

var app = {  
    tiempo: null,
    fechaHora: new Date(),
  	actualizar: document.getElementById('actualizar'),
    principalDiv: document.getElementById('principalDiv'),

    URL_SERVER: 'https://calcicolous-moonlig.000webhostapp.com/tiempo/index.php?id=',
    //URL_SERVER: 'http://localhost:1212/index.php?id=',

  	modal: document.getElementById('modal'),

  	init: function() {

      if(localStorage.getItem("_tiempo")){
        app.tiempo = JSON.parse(localStorage.getItem("_tiempo"));
        app.drawTable();

        // JS devuelve la hora actual en milisegundos, en PHP lo devuelve en segundos
        // la hora la paso a String le quito los 3 últimos caracteres y lo paso a número
        let horaActual = app.fechaHora.getTime();
        horaActual = horaActual.toString();
        horaActual = horaActual.slice(0,-3);
        horaActual = Number(horaActual);
        
        //Two hours, 60 seg * 60 min * 2 hour
        if (horaActual > (app.tiempo.hora + 7200)) {
            app.realizarLlamada();            
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
            //console.log('error al formatear los datos');
            app.obtenerDatosGuardados();
          });
      } else {      
        //console.log('error al obtener los datos');
        app.obtenerDatosGuardados();        
      }
    })
    .catch(function() {
      //console.log('error al obtener los datos');
      app.obtenerDatosGuardados();      
    });
  },

  obtenerDatosGuardados: function() {
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
      app.principalDiv.innerHTML = noteItem;
    } else {
      // TODO aviso
      //alert('No carga');
    }
  },

  drawData: function(estado, element) {
    let exit = "";

    if (app.tiempo.semana !== undefined) {
      app.tiempo.semana.forEach(function(element) {
        if (element.estadoCielo.length === 7) {
          element.estadoCielo = element.estadoCielo.slice(3,7); 
        }
        if (element.estadoCielo.length === 3) {
          element.estadoCielo = element.estadoCielo.slice(1,3); 
        }
	if (app.compareDate(element.fecha)){
          exit += "<div class='titleDate'>" + app.formatDate(element.fecha) + "</div>";
          
          exit += "<div class='titleHeader'>" +
                  "<span class='time'>Hora</span>" +
                  "<span class='status'>Estado</span>" + 
                  "<span class='temp'>Temp.</span>" +
                  "<span class='rain'>LLuvia</span></div>";

          element.estadoCielo.forEach(function(estado, index) {                  
            exit += "<div class='contentData'>" + 
                    "<span class='time'>" + app.formatTime(estado) + "</span>" +
                    "<span class='status'>" + estado.descripcion + "</span>"+ 
                    "<span class='temp'>" + element.temperatura.maxima + "/" + element.temperatura.minima + "º" + "</span>" +
                    "<span class='rain'>" + element.probPrecipitacion[index].value + "</span></div>";
          });
	}
      });
    }
    if (exit !== "") {
      exit += "<div class='separator titleDate'>Por horas</div>";
    }

    app.tiempo.dia.forEach(function(element) {      
        if (app.compareDate(element.fecha)) {
          lastDay = element.fecha;
          exit += "<div class='titleDate'>" + app.formatDate(element.fecha) + "</div>";
          exit += "<div class='amanecer'>" + 
                  "<span class='orto'>Amanecer: " + element.orto + "</span>" + 
                  "<span class='ocaso'>Puesta: " + element.ocaso + "</span></div>";

          exit += "<div class='titleHeader'>" +
                  "<span class='time'>Hora</span>" +
                  "<span class='status'>Estado</span>" + 
                  "<span class='temp'>Temp.</span>" +
                  "<span class='rain'>LLuvia</span></div>";

          element.estadoCielo.forEach(function(estado, index) {
            // Se muestran los datos si el día en el que se recorre no es hoy
            // o si es hoy pero la hora aún no ha pasado
            if (app.fechaHora.getDate() !== parseInt(element.fecha.substring(8,10)) || //Día distinto
              (app.fechaHora.getDate() === parseInt(element.fecha.substring(8,10)) &&
                 app.fechaHora.getHours() <= parseInt(estado.periodo))) {            
              exit += "<div class='contentData'>" + 
                      "<span class='time'>" + estado.periodo + ":00" + "</span>" +
                      "<span class='status'>" + estado.descripcion + "</span>" + 
                      "<span class='temp'>" + element.temperatura[index].value + "º" + "</span>" +
                      "<span class='rain'>" + element.precipitacion[index].value + "</span></div>";              
            }
          });
        }
      });

    return exit;
  },

  formatTime: function(estado) {
    return estado.periodo != undefined ? estado.periodo : "00-24";
  },

  formatDate: function(str) {
    //str = "2018-10-22"
    return str.substring(8,10) + "-" + str.substring(5,7) + "-" + str.substring(0,4);
  },

  compareDate: function(str) {
    let d = new Date(
      parseInt(str.substring(0,4)), 
      (parseInt(str.substring(5,7)) - 1), 
      parseInt(str.substring(8,10)),
      23,
      59,
      59
    );
    return d >= app.fechaHora;
  }

};
