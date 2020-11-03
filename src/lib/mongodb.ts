'use strict';

const Mongoose = require('mongoose');
const Glob = require('glob');

export default  {  
    register: (plugin : any, options: any) => {
        Mongoose.connection.on('connecting', function() {
            console.log('connecting to MongoDB...');
        });
        
        Mongoose.connection.on('error', function(error: any) {
            console.error('Error in MongoDb connection: ' + error);
            Mongoose.disconnect();
        });

        Mongoose.connection.on('connected', function() {
            console.log('MongoDB connected!');
        });

        Mongoose.connection.once('open', function() {
            console.log('MongoDB connection opened!');
        });
          
        Mongoose.connection.on('reconnected', function () {
            console.log('MongoDB reconnected!');
        });
          
        Mongoose.connection.on('disconnected', function() {
            console.log('MongoDB disconnected! Retry connecting');
            Mongoose.connect(options.uri, options.options);
        });

        Mongoose.set('useCreateIndex', true);
        Mongoose.set('useFindAndModify', false);


        Mongoose.connect(options.uri, options.options, function(err: any) {
            if (err) {
                console.log(err);
                throw err;
            }
        });

        // Load models 
        var models = Glob.sync('models/*.js');
        models.forEach(function(model: any) {
            require('../' + model);
        });

    },
    pkg: require('../../package.json'),
    name : 'moogoose'
};