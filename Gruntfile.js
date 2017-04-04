module.exports = function(grunt){

    var spriteHelper = require('./.grunt-tasks/sprite-helper.js');

    require('time-grunt')(grunt);
    require('jit-grunt')(grunt, {
        sprite: 'grunt-spritesmith',
        includereplace: 'grunt-include-replace'
    });

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        path: {
            src: 'src/',
            css: 'css/',
            img: 'img/',
            img_sprite: 'sprite/',
            img_sprite_result: 'im/',
            js: 'js/',
            scss: 'scss/',
            html: 'html/',
            html_build: 'html_build/',
            buildpath: 'build/',
            cdn: '../../cdn/',
            root: '../../../',
            shared: '/src/main/webapp/shared/m'
        },
        clean: {
            dist: ['dist'],
            html_build: ['<%= path.src %><%= path.html_build %>'],
            build: [
                '<%= path.src %>/im/',
                '<%= path.src %>/css/',
                '<%= path.src %>/js/merged/'
            ],
            cdn: {
                options: {
                    force: true
                },
                src: ['<%= path.cdn %><%= targetPath %>/m/']
            }
        },
        sprite: spriteHelper('src/sprite/'),
        sass: {
            build: {
                options: {
                    style: 'compact',
                    sourcemap: 'none',
                    require: ['../functions.rb']
                },
                files: [{
                    expand: true,
                    cwd: '<%= path.src %><%= path.scss %>',
                    src: ['*.scss', '!**/_*.scss', '!_*.scss'],
                    dest: '<%= path.src %><%= path.css %>',
                    ext: '.css'
                }]
            }
        },
        includereplace: {
            dist: {
                options: {
                    includesDir: 'src/html/include/'
                },
                files: [
                    {
                        src: ['**/*.html', '!include/**/*.html', '!index.html'],
                        dest: '<%= path.src %><%= path.html_build %>',
                        expand: true,
                        cwd: '<%= path.src %><%= path.html %>'
                    }
                ]
            }
        },
        browserSync: {
            options: {
                server: {
                    baseDir: '<%= path.src %>',
                    directory: true
                },
                watchTask: true
            },
            bsFiles: {
                src : [
                    '<%= path.src %><%= path.html_build %>**/*.html',
                    '<%= path.src %><%= path.css %>**/*.css',
                    '<%= path.src %><%= path.js %>**/*.js'
                ]
            }
        },
        watch: {
            includes: {
                files: ['<%= path.src %><%= path.html %>**/*.html'],
                tasks: ['includereplace:dist']
            },
            sprite: {
                files: ['<%= path.src %><%= path.img_sprite %>**/*.png'],
                tasks: ['sprite']
            },
            scss: {
                files: ['<%= path.src %><%= path.scss %>*.scss', '<%= path.src %><%= path.scss %>**/*.scss'],
                tasks: ['sass:build']
            },
            jsconcat: {
                files: [
                    '<%= path.src %><%= path.js %>**/*.js',
                    '!<%= path.src %><%= path.js %>merged/*.js',
                    '!<%= path.src %><%= path.js %>concat/*.js'
                ],
                tasks: ['jsconcat']
            },
            livereload: {
                options: {
                    livereload: true
                },
                files: [
                    '<%= path.src %><%= path.html_build %>**/*.html',
                    '<%= path.src %><%= path.css %>*.css'
                ]
            }
        },
        concat: {
            merge: {
                files: '<%= merge_config %>'
            }
        },
        uglify: {
            merge: {
                options: {
                    report: 'min'
                },
                files: '<%= merge_config %>'
            }
        },
        copy: {
            cdn: {
                expand: true,
                cwd: 'src/',
                src: ['im/**/*', 'img/**/*', 'css/**/*', 'js/**/*'],
                dest: '<%= path.cdn %><%= targetPath %>/m/'
            },
            deploy: {
                expand: true,
                cwd: 'src/',
                src: ['im/**/*', 'img/**/*', 'css/**/*'],
                dest: '<%= path.root %><%= deployPath %><%= path.shared %>'
            },
            deployjs: {
                expand: true,
                cwd: 'src/',
                src: ['js/**/*'],
                dest: '<%= path.root %><%= deployPath %><%= path.shared %>'
            },
            check: {
                expand: true,
                cwd: 'src/',
                src: ['html_build/**/*', 'im/**/*', 'img/**/*', 'css/**/*', 'js/**/*'],
                dest: '<%= path.root %><%= checkPath %>'
            }
        }
    });

    grunt.registerTask('default', ['includereplace', 'sprite', 'sass', 'watch']);
    grunt.registerTask('bswatch', ['browserSync:bsFiles', 'watch']);

    /**
     * cdn task
     */
    grunt.task.registerTask('cdn', 'copy resources to targetPath of cdn directory', function(){
        var aTargetPath = grunt.option('targetPath').split(',');

        if(aTargetPath){
            grunt.task.run(['clean:build', 'sprite', 'sass', 'jsmerge']);

            aTargetPath.forEach(function(targetPath){
                grunt.task.run('cdn_copy_clean:' + targetPath);
            });
        }
    });

    grunt.task.registerTask('cdn_copy_clean', 'sub task of cdn', function(targetPath){
        grunt.config.set('targetPath', targetPath);
        grunt.task.run(['clean:cdn', 'copy:cdn']);
    });

    grunt.task.registerTask('deploy', 'copy resources to ui server', function(){
        var bIsDeployingJS = grunt.option('js');

        grunt.config.set('deployPath', grunt.option('path'));
        grunt.task.run(['clean:build', 'sprite', 'sass', 'copy:deploy']);

        if(bIsDeployingJS){
            grunt.task.run(['jsmerge', 'copy:deployjs']);
        }
    });

    grunt.task.registerTask('deployjs', 'copy resources to ui server', function(){
        grunt.config.set('deployPath', grunt.option('path'));
        grunt.task.run(['clean:build', 'jsmerge', 'copy:deployjs']);
    });

    grunt.task.registerTask('check', 'copy resources to somewhere', function(){
        grunt.config.set('checkPath', grunt.option('path'));
        grunt.task.run(['copy:check']);
    });

    grunt.task.registerTask('build', 'compiles sass, make sprite images and uglify js', function(){
        var extend = require('util')._extend,
            spawnOptions = {
                grunt : true,
                opts : { stdio : [0,1,2] }
            },
            done = this.async();

        grunt.util.spawn(extend(spawnOptions, { args : ['clean:build'] }), function(err){
            var cbSpawn = function(err, res, code){
                    if(err) throw err;
                    if(code === 0) taskDone++;
                    if(taskDone === 2) done();
                },
                taskDone = 0;
            if(err) throw err;
            grunt.util.spawn(extend(spawnOptions, { args : ['jsmerge'] }), cbSpawn);
            grunt.util.spawn(extend(spawnOptions, { args : ['sprite', 'sass'] }), cbSpawn);
        });
    });

    /**
     * jsmerge task
     */
    grunt.task.registerTask('jsmerge', 'merge and minify js files', function(){
        var jsmergerc = grunt.file.readJSON('.jsmergerc');
        var merge_config = {};
        var arr = Object.keys(jsmergerc);

        arr.forEach(function(path){
            var key = path.replace('merged', 'src/js/merged');
            var files = [];

            jsmergerc[path].forEach(function(file){
                files.push('src/js/' + file);
            });

            merge_config[key] = files;
        });

        grunt.option('verbose', true);
        grunt.config.set('merge_config', merge_config);
        grunt.task.run('uglify:merge');
    });

    /**
     * jsconcat task
     */
    grunt.task.registerTask('jsconcat', 'concat js files', function(){
        var jsmergerc = grunt.file.readJSON('.jsmergerc');
        var merge_config = {};
        var arr = Object.keys(jsmergerc);

        arr.forEach(function(path){
            var key = path.replace('merged', 'src/js/concat');
            var files = [];

            jsmergerc[path].forEach(function(file){
                files.push('src/js/' + file);
            });

            merge_config[key] = files;
        });

        grunt.option('verbose', true);
        grunt.config.set('merge_config', merge_config);
        grunt.task.run('concat:merge');
    });

    // HTML Index tasks
    grunt.task.registerTask('htmlindex', 'Generates HTML index data', function(){
        require('./.grunt-tasks/html-index-helper.js')(grunt);
    });
};
