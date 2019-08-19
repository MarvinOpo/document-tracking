class Document{

    constructor(){}
    
    setId(id){ this.id = id; }
    getId(){ return this.id; }

    setDocNo(docno){ this.docno = docno; }
    getDocNo(){ return this.docno; }

    setBarcode(barcode){ this.barcode = barcode }
    getBarcode(){ return this.barcode }

    setName(name){ this.name = name; }
    getName(){ return this.name; }

    setType(type){ this.type = type }
    getType(){ return this.type }

    setPriority(priority){ this.priority = priority }
    getPriority(){ return this.priority }

    setDescription(description){ this.description = description }
    getDescription(){ return this.description }

    setRemarks(remarks){ this.remarks = remarks }
    getRemarks(){ return this.remarks }

    setCreateBy(createBy){ this.createBy = createBy }
    getCreateBy(){ return this.createBy }

    setCreateDate(createDate){ this.createDate = createDate }
    getCreateDate(){ return this.createDate }

    setUpdateBy(updateBy){ this.updateBy = updateBy }
    getUpdateBy(){ return this.updateBy }

    setUpdateDate(updateDate){ this.updateDate = updateDate }
    getUpdateDate(){ return this.updateDate }

    setLocation(location){ this.location = location }
    getLocation(){ return this.location }
    
}

module.exports = Document;
