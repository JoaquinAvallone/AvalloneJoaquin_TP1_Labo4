export class Usuario {
    id?: string;
    nombre: string;
    email: string;


    constructor(nombre: string, email: string, id?: string) {
        this.nombre = nombre;
        this.email = email;
        this.id = id;
    }
}
