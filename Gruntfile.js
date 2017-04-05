module.exports = function(grunt) {
    var spriteHelper = require('./.grunt-tasks/sprite-helper.js');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        path: {
            build : {
                html : 'build/html/',
                css : 'build/css/',
                js : 'build/js/',
                image : 'build/images/'
            },
            origin : {
                html : 'origin/html/',
                scss : 'origin/scss/',
                js : 'origin/js/',
                aImage : 'origin/images/image/',
                spriteImage : 'origin/images/sprite/'
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
        sprite: spriteHelper('origin/images/sprite/'),
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
        },
        copy: {
            main: {
                expand: true,
                cwd: '<%= path.origin.aImage %>',
                src: '**/*',
                flatten: false,
                dest: '<%= path.build.image %>image/'
            }
        },
        watch: {
            includes: {
                files: ['<%= path.origin.html %>**/*.html'],
                tasks: ['includereplace:dist']
            },
            scss: {
                files: ['<%= path.origin.scss %>*.scss', '<%= path.origin.scss %>**/*.scss'],
                tasks: ['sass:build']
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-spritesmith');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-include-replace');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('default', ['clean', 'copy', 'sass', 'includereplace', 'watch']);

};
