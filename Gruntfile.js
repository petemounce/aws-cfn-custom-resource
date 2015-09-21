'use strict';

module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    nodeunit: {
      all: ['test/**/*_test.js']
    },
    eslint: {
      src: ['*.js', 'lib/**/*.js', 'test/**/*.js'],
      options: {
        configFile: 'conf/eslint.yaml'
      }
    }
  });

  grunt.loadNpmTasks('gruntify-eslint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Task Definitions
  grunt.registerTask('default', ['eslint', 'nodeunit']);
};
