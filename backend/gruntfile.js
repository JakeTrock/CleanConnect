module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      files: ['Gruntfile.js', '*.js'],
      ignores: ['node_modules/*', 'temp/*'],
      options: {
        globals: {
          "esversion": 6
        }
      }
    },
    uglify: {
      all_src: {
        options: {
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
          //         sourceMap : true, 
          //         sourceMapName : 'sourceMap.map'
        },
        src: ['server.js','config/*.js','validation/*.js','routes/*.js','models/*.js','!gruntfile.js','!UnitTest.js','!**/*.min.js'],
        dest: ['build/',]
      }

    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify-es');
  // Default task(s).
  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('default', ['uglify']);
}; 
