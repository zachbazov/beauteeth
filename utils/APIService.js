class APIService {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObject = { ...this.queryString };
        const excludedFields = ["page", "sort", "limit", "fields"];
        excludedFields.forEach((el) => delete queryObject[el]);

        let queryString = JSON.stringify(queryObject);
        queryString = queryString.replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => `$${match}`
        );

        const parsedQueryString = JSON.parse(queryString);

        this.query.find(parsedQueryString);

        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(",").join(" ");
            this.query = this.query.sort(sortBy);
        } else {
            // this.query = this.query.sort('-rating');
        }

        return this;
    }

    limit() {
        if (this.queryString.limit) {
            const limit = this.queryString.limit * 1 || 100;
            this.query = this.query.limit(limit);
            console.log(this.queryString);
        }

        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(",").join(" ");
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select("-__v +_id");
        }

        return this;
    }

    paginate() {
        if (this.queryString.page) {
            const page = this.queryString.page * 1 || 1;
            const limit = this.queryString.limit * 1 || 9;
            const skip = (page - 1) * limit;

            this.query = this.query.skip(skip).limit(limit);
        }

        return this;
    }

    populate = async (Model) => {
        let data;

        if (Model.modelName === "Season") {
            data = await this.query.populate("episodes");
            return data;
        } else if (Model.modelName === "MyList") {
            data = await this.query.populate("media");
            return data;
        } else {
            data = await this.query; //.explain();
            return data;
        }
    };
}

module.exports = APIService;
