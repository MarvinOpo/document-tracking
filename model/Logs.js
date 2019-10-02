class Log{

    constructor(){}
    
    setId(id){ this.id = id; }
    getId(){ return this.id; }

    setDocId(docId){ this.docId = docId }
    getDocId(){ return this.docId }

    setReleaseTo(releaseTo){ this.releaseTo = releaseTo; }
    getReleaseTo(){ return this.releaseTo; }

    setReceiveBy(receiveBy){ this.receiveBy = receiveBy }
    getReceiveBy(){ return this.receiveBy }

    setReceiveDate(receiveDate){ this.receiveDate = receiveDate }
    getReceiveDate(){ return this.receiveDate }

    setReleaseDate(releaseDate){ this.releaseDate = releaseDate }
    getReleaseDate(){ return this.releaseDate }

    setRemarks(remarks){ this.remarks = remarks }
    getRemarks(){ return this.remarks }
    
}

module.exports = Log;
