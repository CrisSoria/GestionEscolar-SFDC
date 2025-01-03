import { LightningElement, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getAttendance from "@salesforce/apex/AttendanceController.getAttendance";

export default class Attendance extends LightningElement {
    wiredAttendanceResult; // Variable para almacenar el resultado del wire (refreshApex)
    
    @wire(getAttendance)
    attendance; //asistencia del día de hoy desde SFDC 

    @track showBtnTakeAttendance = true //permite la opción de tomar asistencia
    @track showTakeAttendance = false; //iniciar el LWC para la toma de asistencia
    @track showTodayAttendance = false; //muestra lista de ausentes
    @track showMessage = false; //mostrar un mensaje
    @track message = {title:"",text:"",icon:"utility:error"}; // mensaje para mostrar


    @track studentsAbsents = []; //estudiantes ausentes el día de hoy

    @wire(getAttendance)
    wiredAttendance(result) {
        this.wiredAttendanceResult = result; // Guardamos el resultado (refreshApex)
        const { error, data } = result;
        if (error){
            this.message.title = 'Error al cargar la asistencia';
            this.message.text = 'wiredAttendance error:' + error;
            this.message.icon = 'utility:error';
            this.showMessage = true;
        }
        
        if (data) {
            if(data.length > 0) {
                if(data[0].event?.Type === 'Feriado') {
                    // caso: día feriado
                    this.showBtnTakeAttendance = false;
                    this.showTodayAttendance = false;

                    this.message.title = 'El día de hoy es feriado';
                    this.message.text = data[0].event.Subject;
                    this.message.icon = "utility:key_dates";
                    this.showMessage = true;
                }else{
                    // caso: ya se tomó asistencia
                    this.showBtnTakeAttendance = false;
                    
                    this.studentsAbsents = data
                    .filter(wrapper => wrapper.event?.Type === 'Ausente')
                    .map(wrapper => wrapper.contact);
                    
                    //caso: todos presentes
                    if(this.studentsAbsents.length === 0) {
                        this.message.title = 'Sin ausentes';
                        this.message.text = 'Todos los estudiantes están presentes el día de hoy';
                        this.message.icon = 'utility:check';
                        this.showMessage = true;
                    } else {
                        //caso: ausentes
                        this.showTodayAttendance = true;
                    }
                }
            }
        }
    }

    get fechaActualFormateada() {
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
        const fechaActual = new Date();
        const diaSemana = diasSemana[fechaActual.getDay()];
        const diaMes = fechaActual.getDate();
        const mes = meses[fechaActual.getMonth()];
        const año = fechaActual.getFullYear();
    
        // Analizar si es Sabado o Domingo: No se toma asistencia
        if (diaSemana === 'Sábado' || diaSemana === 'Domingo') {
            this.showBtnTakeAttendance = false;
            this.message.title = 'Hoy es fin de semana';
            this.message.text = 'No se toma asistencia los fines de semana'
            this.message.icon = "utility:key_dates";
            this.showMessage = true;
        }
        return `${diaSemana} ${diaMes} de ${mes} de ${año}`;
    }

    showTakeAttendanceHandler() {
        this.showBtnTakeAttendance = false;
        this.showTakeAttendance = true;
    }

    saveAttHandler(e) {
        this.showBtnTakeAttendance = false;
        this.showTakeAttendance = false;
        this.showTodayAttendance = true;
        // Refrescar los datos
        refreshApex(this.wiredAttendanceResult);
    }
        
}