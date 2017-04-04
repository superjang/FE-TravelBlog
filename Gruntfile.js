module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        path: {
            build : {
                html : 'build/html/',
                css : 'build/css/',
                js : 'build/js/',
                image : 'build/image/'
            },
            origin : {
                html : 'origin/html/',
                scss : 'origin/scss/',
                js : 'origin/js/',
                image : 'origin/image/'
            }
        },
        clean: {
            dist: ['dist'],
            build: [
                '<%=path.build.html %>',
                '<%=path.build.css %>',
                '<%=path.build.js %>',
                '<%=path.build.image %>'
            ]
        },
        sass: {
            build: {
                options: {
                    style: 'compact',
                    sourcemap: 'none',
                    require: ['./functions.rb']
                },
                files: [{
                    expand: true,
                    cwd: '<%= path.origin.scss %>',
                    src: ['*.scss', '!**/_*.scss', '!_*.scss'],
                    dest: '<%= path.build.css %>',
                    ext: '.css'
                }]
            }
        },
        includereplace: {
            dist: {
                options: {
                    includesDir: '<%= path.origin.html %>components/'
                },
                files: [
                    {
                        expand: true,
                        cwd: '<%= path.origin.html %>',
                        src: ['**/*.html', '!components/**/*.html'],
                        dest: '<%= path.build.html %>'
                    }
                ]
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-include-replace');

    // Default task(s).
    grunt.registerTask('default', ['clean', 'sass', 'includereplace']);

};
