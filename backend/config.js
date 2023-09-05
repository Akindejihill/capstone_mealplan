require('dotenv').config();

/**Database address and login URI */
const db_password = process.env.DB_PASSWORD;
const DB_URI = process.env.NODE_ENV === "test"
    ? `postgresql://akindeji:${db_password}@localhost:5432/mealplan_test`
    : `postgresql://akindeji:${db_password}@localhost:5432/mealplan`;

const SECRET_KEY = process.env.SECRET_KEY || "not so secret";

const BCRYPT_WORK_FACTOR = 12;

const origin = '*';

module.exports = {
    DB_URI, SECRET_KEY, BCRYPT_WORK_FACTOR, origin
};