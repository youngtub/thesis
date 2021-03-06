import Sequelize from 'sequelize';
import sequelize from '../../db';

const User = sequelize.define('user', {
  username: Sequelize.STRING,
  password: Sequelize.STRING,
  fbId: Sequelize.INTEGER,
  sex: Sequelize.STRING,
  age: Sequelize.INTEGER,
  creator: Sequelize.BOOLEAN
});

User.sync({force: false});

module.exports = User;
