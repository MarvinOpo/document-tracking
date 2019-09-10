class User{

    constructor(){}
    
    setId(id){ this.id = id; }
    getId(){ return this.id; }

    setFname(fname){ this.fname = fname }
    getFname(){ return this.fname }

    setMinit(minit){ this.minit = minit }
    getMinit(){ return this.minit }

    setLname(lname){ this.lname = lname }
    getLname(){ return this.lname }

    setDesignation(designation){ this.designation = designation }
    getDesignation(){ return this.designation }

    setDepartment(department){ this.department = department }
    getDepartment(){ return this.department }

    setUsername(username){ this.username = username; }
    getUsername(){ return this.username; }

    setPassword(password){ this.password = password }
    getPassword(){ return this.password }
}

module.exports = User;
