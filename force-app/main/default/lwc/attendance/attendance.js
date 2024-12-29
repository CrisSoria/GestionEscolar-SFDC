import { LightningElement, track } from 'lwc';

export default class Attendance extends LightningElement {
    students = [
        {name: "Andrade, Valentín Daniel", order: 1},
        {name: "Argañaraz, Karen Aurora", order: 2},
        {name: "Cáceres, Fabricio Agustín", order: 3},
        {name: "Calpanchay Puca, Valentina.", order: 4},
        {name: "Carabajal, Kiara Antonella.", order: 5},
        {name: "Carrizo, Fabián Oscar", order: 6},
        {name: "Casimiro Cañízares, Fabricio", order: 7},
        {name: "Chocobar Céspedes, Mía Valentina.", order: 8},
        {name: "Chuca Mollo, Adonis Azariel", order: 9},
        {name: "Cordoba, Camila del Milagro", order: 10},
        {name: "Espinoza, Yuliana Geraldine Lisette.", order: 11},
        {name: "Figueroa Nuñez, Libertad Guadalupe.", order: 12},
        {name: "Figueroa Rodriguez, Joel Hernán.", order: 13},
        {name: "Garnica Gonzaléz, Jesús Antonio.", order: 14},
        {name: "Guanuco Montenegro,Ainara Jazmín.", order: 15},
        {name: "Juarez, Néstor Emanuel.", order: 16},
        {name: "Lacce, Jazmín Maria.", order: 17},
        {name: "Llampa, Luciana Nicole.", order: 18},
        {name: "Luna, Ceferino Josue.", order: 19},
        {name: "Meja, Maia Sumais.", order: 20},
        {name: "Orellana Huerta, Araceli Nicole.", order: 21},
        {name: "Perez, Augusto Martín.", order: 22},
        {name: "Ríos, Victoria Joselín Valentina.", order: 23},
        {name: "Romero Velez, Abraham.", order: 24},
        {name: "Solano,Angel Lorenzo.", order: 25},
        {name: "Tevez, Facundo Mateo.", order: 26},
        {name: "Velazquez, Francisco Agustín.", order: 27},
        {name: "Videla Subia, Xenia Aylen.", order: 28},
        {name: "Uncos Salgado, Dalma Dulce Jazmin", order: 29}
    ];      

    @track showTakeAttendance = true;
    studentAtt = this.students[0];
    contStudent = 0;
    
    takingAttendance(e) {
        const isPresent = e.detail;
        if (this.students.length > this.contStudent) {
            this.students[this.contStudent].present = isPresent;
            this.contStudent++;
            if (this.students.length === this.contStudent) {
                this.studentAtt = { name: 'No hay más estudiantes', present: false, order: 0 };
                this.showTakeAttendance = false;
            } else {
                this.studentAtt = this.students[this.contStudent];
            }
        }
    }

    get studentsAbsents() {
        return this.students.filter((s) => s.present === false);
    }
}