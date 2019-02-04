class BaseShoe {
    constructor(model, size) {
        this.model = model; 
        this.size = size;
    }

    insert() {
        throw new Error("NotImplementedError")
    }
}

module.exports = BaseShoe; 