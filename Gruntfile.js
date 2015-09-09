module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        nodeunit: {
            all: ['lib/*_test.js', '*_test.js']
        },
        jshint: {
            all: ['*.js', 'lib/**/*.js']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    // Task Definitions
    grunt.registerTask('default', ['jshint', 'nodeunit']);
};
