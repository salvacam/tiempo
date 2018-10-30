document.addEventListener('DOMContentLoaded', function () {
  	app.init();
});

var app = {  
    tiempo: null,
    fechaHora: new Date(),
    actualizar: document.getElementById('actualizar'),
    accionHoras: undefined,
  	horas: undefined,
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
    app.actualizar.classList.remove('rotate');
    app.encenderBoton();
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

      app.accionHoras = document.getElementById('accionHoras');
      app.horas = document.getElementById('horas');
      app.accionHoras.addEventListener('click', app.mostrarHoras);
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
          element.estadoCielo.forEach(function(estado, index) {

            // Se muestran los datos si el día en el que se recorre no es hoy
            // o si es hoy pero la hora aún no ha pasado
            if (app.fechaHora.getDate() !== parseInt(element.fecha.substring(8,10)) || //Día distinto
              (estado.periodo === undefined || 
              (estado.periodo !== undefined && parseInt(estado.periodo.substring(3,5)) >= app.fechaHora.getHours()))) {
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

          //http://www.aemet.es/imagenes_gcd/_iconos_municipios/54.png
        }
      });
    }
    let datosSemana = false;
    if (exit !== "") {
      datosSemana = true;      
      exit += `<div class='separator titleDate' id='accionHoras'>Por horas</div>
              <div class='hide' id='horas'>`;
    }

    app.tiempo.dia.forEach(function(element) {      
        if (app.compareDate(element.fecha)) {
          lastDay = element.fecha;
          exit += app.formatDate(element.fecha);
          exit += `<div class='amanecer'>
                  <span class='orto'>Amanecer: ${element.orto}</span> 
                  <span class='ocaso'>Puesta: ${element.ocaso}</span></div>`;


          exit += `<div class='card-container'>`;
          element.estadoCielo.forEach(function(estado, index) {
            // Se muestran los datos si el día en el que se recorre no es hoy
            // o si es hoy pero la hora aún no ha pasado
            if (app.fechaHora.getDate() !== parseInt(element.fecha.substring(8,10)) || //Día distinto
              (app.fechaHora.getDate() === parseInt(element.fecha.substring(8,10)) &&
                 app.fechaHora.getHours() <= parseInt(estado.periodo))) {

              exit += `<div class='card'>
                        <div class='card-row'>
                          <div class='temp'>${element.temperatura[index].value}º</div>
                          ${app.formatRain(element.precipitacion[index].value)}
                        </div>
                        <div class='icon'><img alt="${estado.descripcion}" 
                          src="./img/weather/${estado.value}_g.png"
                          title="${estado.descripcion}"></div>
                        <div class='time'>${estado.periodo}:00</div>
                      </div>`;
            }
          });

          exit += `</div>`;
        }
      });

    if (datosSemana) {
      exit+="</div>";
    }
    return exit;
  },

  mostrarHoras: function(estado) {
    app.horas.classList.toggle('hide');
  },

  formatRain: function(rain){
    if (rain !== "Ip") {
      rain += " mm";
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
    return `<div class='titleDate'>${str.substring(8,10)}-${str.substring(5,7)}-${str.substring(0,4)}</div>`;
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
