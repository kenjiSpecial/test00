'use strict';

export default class AirPort {
    constructor(data){
        this.data = data;
        this.parse();
    }
    parse(){
        this._routes = this.data['routes'];
        this._airports = this.data['airports'];
    }
    get airports() {
        return this._airports;
    }
    get routes(){
        return this._routes;
    }
}
