document.addEventListener('DOMContentLoaded', function () {
  	app.init();
});

var app = {  
    tiempo: null,
    fechaHora: new Date(),
    actualizar: document.getElementById('actualizar'),
    principalDiv: document.getElementById('principalDiv'),

    //URL_SERVER: 'https://calcicolous-moonlig1.000webhostapp.com/tiempo/index.php?id=',
    //URL_SERVER: 'http://localhost:1212/index.php?id=',
    URL_API: "https://opendata.aemet.es/opendata/api/prediccion/especifica/municipio/",
    API_KEY: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzYWx2YWNhbXNAZ21haWwuY29tIiwianRpIjoiYTU2ZjkzZWYtZmQyMS00YTY2LWIzYTctNDM1MzU0OGExZGM4IiwiaXNzIjoiQUVNRVQiLCJpYXQiOjE1Mzk5NTI1MzEsInVzZXJJZCI6ImE1NmY5M2VmLWZkMjEtNGE2Ni1iM2E3LTQzNTM1NDhhMWRjOCIsInJvbGUiOiIifQ.ZU_KjGW9u4hR3gWJdKWYxnPm4mOimVjjYHnCvVA_CC4',

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

    	app.actualizar.addEventListener('click', app.realizarLlamada);

  		if ('serviceWorker' in navigator) {
    		navigator.serviceWorker
      		.register('service-worker.js')
      		.then(function() {
        		//console.log('Service Worker Registered');
        	});
  		}
	},

  realizarLlamada: function() {
    app.actualizar.removeEventListener('click', app.realizarLlamada);
    app.actualizar.classList.add('rotate');

    var data = null;

    var xhr = new XMLHttpRequest();
    //xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        console.log(this.responseText);
        var myArr = JSON.parse(this.responseText);

		    let request = myArr.datos;	    

  	    fetch(request).then((results) => {
  	      if (results.status === 200){
  	        results
  	          .json()
  	          .then(( str ) => {

    	        	let horaActual = app.fechaHora.getTime();
    		        horaActual = horaActual.toString();
    		        horaActual = horaActual.slice(0,-3);
    		        horaActual = Number(horaActual);

  	          	app.tiempo = {
      				  "id": "18087",
      				  "nombre": "Granada",
      				  "hora": horaActual,
      				  "dia": str[0].prediccion.dia,
      				  "semana": null
        				};

        				var data2 = null;

          			var xhr2 = new XMLHttpRequest();
      			    //xhr2.withCredentials = true;

      			    xhr2.addEventListener("readystatechange", function () {
      			      if (this.readyState === 4) {
      			         //console.log(this.responseText);
      			         var myArr = JSON.parse(this.responseText);
      					     let request = myArr.datos;	    

        				    fetch(request).then((results) => {
        				      if (results.status === 200){
        				        results
        				          .json()
        				          .then(( str ) => {

        				          	app.tiempo.semana = str[0].prediccion.dia;
        				            localStorage.setItem("_tiempo", JSON.stringify(app.tiempo));
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
                  
      			      }
      			    });
    			    
      			    xhr2.open("GET", app.URL_API + "diaria/18087/?api_key=" + app.API_KEY);
      			    xhr2.setRequestHeader("cache-control", "no-cache");
      			    xhr2.send(data);

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
      }
    });
	    
    xhr.open("GET", app.URL_API + "horaria/18087/?api_key=" + app.API_KEY);
    xhr.setRequestHeader("cache-control", "no-cache");
    xhr.send(data);
  },

  obtenerDatosGuardados: function() {
    app.actualizar.classList.remove('rotate');
    //app.encenderBoton();
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
    app.actualizar.addEventListener('click', app.realizarLlamada);
    app.actualizar.classList.remove('rotate');
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
        if (app.compareDate(element.fecha)){ 

          if (element.estadoCielo.length === 7) {
            element.estadoCielo = element.estadoCielo.slice(3,7); 
            element.probPrecipitacion = element.probPrecipitacion.slice(3,7); 
          }
          if (element.estadoCielo.length === 3) {
            element.estadoCielo = element.estadoCielo.slice(1,3); 
            element.probPrecipitacion = element.probPrecipitacion.slice(1,3); 
          }
          exit += app.formatDate(element.fecha);

          exit += `<div class='card-container'>`;
          let primerDato = true;
          element.estadoCielo.forEach(function(estado, index) {

            // Se muestran los datos si el día en el que se recorre no es hoy
            // o si es hoy pero la hora aún no ha pasado
            if (app.fechaHora.getDate() !== parseInt(element.fecha.substring(8,10)) || //Día distinto
              (estado.periodo === undefined || 
              (estado.periodo !== undefined && parseInt(estado.periodo.substring(3,5)) >= app.fechaHora.getHours()))) {
              if (!primerDato) {
                exit += `<div class="card-separator"></div>`;
              } else {
                primerDato = false;
              }
              exit += `<div class='card'>
                        <div class='card-row'>
                          <div class='temp'>${element.temperatura.maxima}/${element.temperatura.minima}º</div>
                          <div class='rain'>${element.probPrecipitacion[index].value}%</div>
                        </div>
                        <div class='icon'><img alt="${estado.descripcion}" 
                          src="./img/weather/${estado.value}_g.png"
                          title="${estado.descripcion}"></div>
                        <div class='time'>${app.formatTime(estado)}</div>
                      </div>`;
            }
          });
          exit += `</div>`;

          let elementDay = app.myFindWhere(app.tiempo.dia, {fecha:element.fecha});
          if (elementDay !== undefined) {
            if (app.compareDate(elementDay.fecha)) {

              exit += `<div class='amanecer'>
                        <span class='orto'>Amanecer: ${elementDay.orto}</span> 
                        <span class='ocaso'>Puesta: ${elementDay.ocaso}</span></div>
                      <div class='separator titleDate'>Por horas</div>
                      <div class='horas'>`;

              exit += `<div class='card-container'>`;
              primerDato = true;
              elementDay.estadoCielo.forEach(function(estadoDay, index) {
                // Se muestran los datos si el día en el que se recorre no es hoy
                // o si es hoy pero la hora aún no ha pasado
                if (app.fechaHora.getDate() !== parseInt(elementDay.fecha.substring(8,10)) || //Día distinto
                  (app.fechaHora.getDate() === parseInt(elementDay.fecha.substring(8,10)) &&
                     app.fechaHora.getHours() <= parseInt(estadoDay.periodo))) {
                  if (!primerDato) {
                    exit += `<div class="card-separator"></div>`;
                  } else {
                    primerDato = false;
                  }
                  exit += `<div class='card'>
                            <div class='card-row'>
                              <div class='temp'>${elementDay.temperatura[index] == null || elementDay.temperatura[index].value == null ? "" : elementDay.temperatura[index].value}º</div>
                              ${app.formatRain(elementDay.precipitacion[index].value)}
                            </div>
                            <div class='icon'><img alt="${estadoDay.descripcion}" 
                              src="./img/weather/${estadoDay.value}_g.png"
                              title="${estadoDay.descripcion}"></div>
                            <div class='time'>${estadoDay.periodo}:00</div>
                          </div>`;
                }
              });

              exit += `</div>
                      </div>`;
            }
          }
        }
      });
    }

    return exit;
  },

  formatRain: function(rain){
    if (rain !== "Ip") {
        return `<div class='rain'>${rain}<span class="min">mm</span></div>`;
    }
    return `<div class='rain'>${rain}</div>`;
  },

  formatTime: function(estado) {
    if(estado.periodo === undefined) {
      return "00-24 h";
    } else if (estado.periodo.length <=2) {
      return estado.periodo;
    }
      return estado.periodo + " h";
  },

  formatDate: function(str) {
    //str = "2018-10-22"
	  let diaSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return `<div class='titleDate'>${diaSemana[new Date(parseInt(str.substring(0, 4)),parseInt(str.substring(5, 7)) - 1,parseInt(str.substring(8, 10))).getDay()]} ${str.substring(8,10)}-${str.substring(5,7)}-${str.substring(0,4)}</div>`;
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
  },

  //https://stackoverflow.com/questions/37301790/es6-equivalent-of-underscore-findwhere
  myFindWhere: function(array, criteria) {
    return array.find(item => Object.keys(criteria).every(key => item[key] === criteria[key]))
  }

};
