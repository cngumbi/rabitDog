const { ValidateData } = require("./validateData");

const ValidateUser = async (req, res, next) => {
    try {
        //validate user input
        const { error } = await ValidateData.validateAsync(req.body);
        if (error) {
            return res.status(400).send({ message: error.details[0].message });
        }
        next();
    } catch (err) {
        return res.status(500).send({ message: 'Validation Failed' });
    }
};

module.exports = { ValidateUser };