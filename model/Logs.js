class Log{

    constructor(){}
    
    setId(id){ this.id = id; }
    getId(){ return this.id; }

    setDocId(docId){ this.docId = docId }
    getDocId(){ return this.docId }

    setReleaseTo(releaseTo){ this.releaseTo = releaseTo; }
    getReleaseTo(){ return this.releaseTo; }

    setRecieveBy(recieveBy){ this.recieveBy = recieveBy }
    getRecieveBy(){ return this.recieveBy }

    setRecieveDate(recieveDate){ this.recieveDate = recieveDate }
    getRecieveDate(){ return this.recieveDate }

    setReleaseDate(releaseDate){ this.releaseDate = releaseDate }
    getReleaseDate(){ return this.releaseDate }

    setRemarks(remarks){ this.remarks = remarks }
    getRemarks(){ return this.remarks }
    
}

module.exports = Log;
