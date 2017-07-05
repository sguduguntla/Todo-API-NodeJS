var bcrypt = require('bcryptjs');
var _ = require('underscore');

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        salt: {
            type: DataTypes.STRING
        },
        password_hash: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.VIRTUAL,
            allowNull: false,
            validate: {
                len: [7, 100]
            },
            set: function(value) {
                var salt = bcrypt.genSaltSync(10);
                var hashedPassword = bcrypt.hashSync(value, salt);

                this.setDataValue('password', value);
                this.setDataValue('salt', salt);
                this.setDataValue('password_hash', hashedPassword);
            }
        }
    }, {
        hooks: {
            beforeValidate: function(user, options) {
                //Changes email to lowercase version before email is validate for uniqueness
                if (typeof user.email === 'string') {
                    user.email = user.email.toLowerCase();
                }
            }
        }
    });

    User.prototype.toPublicJSON = function() {
        var json = this.toJSON();
        //makes sure only these are returned in the API
        return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');
    }

    return User;
};
