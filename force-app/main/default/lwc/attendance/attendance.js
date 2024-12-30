import { LightningElement, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getStudents from "@salesforce/apex/AttendanceController.getStudents";
import getAttendance from "@salesforce/apex/AttendanceController.getAttendance";

export default class Attendance extends LightningElement {
    wiredAttendanceResult; // Variable para almacenar el resultado del wire
    
    @wire(getStudents)
    students; //alumnos desde SFDC 
    @wire(getAttendance)
    attendance; //asistencia del día de hoy desde SFDC 

    @track showBtnTakeAttendance = true
    @track showTakeAttendance = false; //iniciar el LWC para la toma de asistencia
    @track showTodayAttendance = false;
    @track studentsAbsents = []; //estudiantes ausentes el día de hoy

     @wire(getAttendance)
    wiredAttendance(result) {
        this.wiredAttendanceResult = result; // Guardamos el resultado
        const { error, data } = result;
        console.log('Wire error:', error);
        
        if (data) {
            if(data.length > 0) {
                this.showBtnTakeAttendance = false;
                this.showTodayAttendance = true;
            }
            this.studentsAbsents = data
                .filter(wrapper => wrapper.event?.Type === 'Ausente')
                .map(wrapper => wrapper.contact);
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