import { LightningElement, track, wire } from 'lwc';
import getStudents from "@salesforce/apex/AttendanceController.getStudents";
import getAttendance from "@salesforce/apex/AttendanceController.getAttendance";

export default class Attendance extends LightningElement {
    
    @wire(getStudents)
    students; //alumnos desde SFDC 
    @wire(getAttendance)
    attendance; //asistencia del día de hoy desde SFDC 

    showBtnTakeAttendance = true
    showTakeAttendance = false; //iniciar el LWC para la toma de asistencia

    connectedCallback() {
        if (this.attendance?.data?.length > 0) {
            this.showBtnTakeAttendance = false;
        }
    }


    get todayAttendance() {
        return this.attendance?.data?.length > 0;
    }

    get studentsAbsents() {
        return this.students.data.filter((s) => s.present === false);
    }

    get fechaActualFormateada() {
        const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
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
        
}