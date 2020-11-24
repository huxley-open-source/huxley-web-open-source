/*global module, require*/

module.exports = function (grunt) {
    'use strict';

    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

    var modRewrite = require('connect-modrewrite'),
        config = {
            name: require('./bower.json').name || 'app',
            version: require('./bower.json').version,
            paths: {
                app: './app',

                target: {
                    js: './app/scripts',
                    css: './app/stylesheets'
                },

                src: {
                    main: './src/javascript/main/main-app.js',
                    javascript: './src/javascript',
                    tpl: './src/javascript/**/*.tpl.html'
                },

                vendor: './vendor',

                temp: {
                    tpl: './.tmp/tpl',
                    app: './.tmp/app'
                }
            },
            dist: './dist',
            karma: './karma.conf.js',
            protractor: './protractor.conf.js'
        };

    grunt.initConfig({

        config: config,

        watch: {
            bower: {
                files: ['bower.json'],
                tasks: ['wiredep']
            },

            js: {
                files: ['./<%= config.paths.src.javascript %>/**/*.js'],
                tasks: ['newer:jshint:all', 'browserify', 'concat'],
                options: {
                    livereload: '<%= connect.options.livereload %>'
                }
            },

            tpl: {
                files: ['./<%= config.paths.src.javascript %>/**/*.tpl.html'],
                tasks: ['newer:html2js', 'concat'],
                options: {
                    livereload: '<%= connect.options.livereload %>'
                }
            },

            less: {
                files: ['./<%= config.paths.src.javascript %>/**/*.less'],
                tasks: ['less', 'csslint'],
                options: {
                    livereload: '<%= connect.options.livereload %>'
                }
            }

        },

        connect: {
            options: {
                port: 9090,
                hostname: '0.0.0.0',
                livereload: true
            },

            livereload: {
                options: {
                    open: true,
                    middleware: function (connect) {
                        return [
                            modRewrite(['!\\.html|\\.js|\\.svg|\\.css|\\.png|\\.woff|\\.ttf|\\.eot|\\.ico|\\.svg$ /index.html [L]']),
                            connect.static(config.paths.app),
                            connect().use('/vendor', connect.static('./vendor')),
                            connect.static('.tmp')
                        ];
                    }
                }
            },

            test: {
                options: {
                    port: 9091,
                    middleware: function (connect) {
                        return [
                            modRewrite(['!\\.html|\\.js|\\.svg|\\.css|\\.png|\\.woff|\\.ttf|\\.eot|\\.svg$ /index.html [L]']),
                            connect.static(config.paths.app),
                            connect().use('/vendor', connect.static('./vendor')),
                            connect.static('.tmp')
                        ];
                    }
                }
            }
        },

        less: {
            defaults: {
                files: {
                    '<%= config.paths.target.css %>/<%= config.name %>.css': '<%= config.paths.src.javascript %>/main/templates/stylesheets/less/huxley.less'
                }
            }
        },

        csslint: {
            options: {
                csslintrc: '.csslintrc'
            },
            defaults: ['<%= config.paths.target.css %>/<%= config.name %>.css']
        },

        html2js: {
            defaults: {
                options: {
                    base: 'src/javascript',
                    module: 'thehuxley.templates'
                },
                src: ['<%= config.paths.src.tpl %>'],
                dest: '<%= config.paths.temp.tpl %>/templates.js'
            }
        },

        concat: {
            defaults: {
                src: ['<%= config.paths.temp.tpl %>/**/*.js', '<%= config.paths.temp.app %>/**/*.js'],
                dest: '<%= config.paths.target.js %>/<%= config.name %>.js'
            }
        },

        browserify: {
            defaults: {
                files: {
                    '<%= config.paths.temp.app %>/<%= config.name %>.js': ['<%= config.paths.src.javascript %>/config-dev.js', '<%= config.paths.src.javascript %>/config.js', '<%= config.paths.src.javascript %>/main/main-app.js']
                }
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish'),
                reporterOutput: ''
            },

            all: {
                src: [
                    'Gruntfile.js',
                    '<%= config.paths.src.javascript %>/{,*/}*.js'
                ]
            }
        },

        wiredep: {
            app: {
                src: ['<%= config.paths.app %>/index.html'],
                exclude: ['vendor/bootstrap/dist/css/bootstrap.css'],
                ignorePath: /\.\./
            },

            test: {
                src: 'karma.conf.js',
                fileTypes: {
                    js: {
                        block: /(([\s\t]*)\/\/\s*bower:*(\S*))(\n|\r|.)*?(\/\/\s*endbower)/gi,
                        detect: {
                            js: /'(.*\.js)'/gi
                        },
                        replace: {
                            js: '\'{{filePath}}\','
                        }
                    }
                }
            }
        },

        karma: {
            unit: {
                options: {
                    configFile: '<%= config.karma %>',
                    singleRun: true
                }
            }
        },

        protractor: {
            options: {
                configFile: '<%= config.protractor %>',
                keepAlive: true,
                noColor: false
            },
            all: {}
        },

        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= config.dist %>/{,*/}*',
                        '!<%= config.dist %>/.git{,*/}*'
                    ]
                }]
            }
        },

        useminPrepare: {
            html: '<%= config.paths.app %>/index.html',
            options: {
                dest: '<%= config.dist %>',
                flow: {
                    html: {
                        steps: {
                            js: ['concat', 'uglifyjs'],
                            css: ['cssmin']
                        },
                        post: {}
                    }
                }
            }
        },

        usemin: {
            html: ['<%= config.dist %>/{,*/}*.html'],
            css: ['<%= config.dist %>/stylesheets/{,*/}*.css'],
	    	js: ['<%= config.dist %>/scripts/{,*/}*.js'],
            options: {
				patterns: {
					js: [
				  		[/(images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the JS to reference our revved images']
					]
				},
                assetsDirs: ['<%= config.dist %>', '<%= config.dist %>/images']
            }
        },

        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= config.paths.app %>',
                    dest: '<%= config.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        '*.html',
                        'views/{,*/}*.html',
                        'images/{,*/}*.{webp}',
                        'images/{,*/}*.ico',
                        'fonts/{,*/}*.*'
                    ]
                }, {
                    expand: true,
                    cwd: '.tmp/images',
                    dest: '<%= config.dist %>/images',
                    src: ['generated/*']
                }]
            },
            styles: {
                expand: true,
                cwd: '<%= config.paths.app %>/stylesheets',
                dest: '.tmp/stylesheets/',
                src: '{,*/}*.css'
            }
        },

        filerev: {
            dist: {
                src: [
                    '<%= config.dist %>/scripts/{,*/}*.js',
                    '<%= config.dist %>/stylesheets/{,*/}*.css',
                    '<%= config.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                    '<%= config.dist %>/stylesheets/fonts/*'
                ]
            }
        },

        concurrent: {
            dist: [
                'imagemin',
                'svgmin'
            ]
        },

        ngAnnotate: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/concat/scripts',
                    src: ['*.js', '!oldieshim.js'],
                    dest: '.tmp/concat/scripts'
                }]
            }
        },

        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    collapseBooleanAttributes: true,
                    removeCommentsFromCDATA: true,
                    removeOptionalTags: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= config.dist %>',
                    src: ['*.html', 'views/{,*/}*.html'],
                    dest: '<%= config.dist %>'
                }]
            }
        },

        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.paths.app %>/images',
                    src: '{,*/}*.{png,jpg,jpeg,gif}',
                    dest: '<%= config.dist %>/images'
                }]
            }
        },

        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= config.paths.app %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%= config.dist %>/images'
                }]
            }
        },

        autoprefixer: {
            options: {
                browsers: ['last 1 version']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/stylesheets/',
                    src: '{,*/}*.css',
                    dest: '.tmp/stylesheets/'
                }]
            }
        }
    });

    grunt.registerTask('serve', 'Compile and start a Connect web server', function (target) {

        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'wiredep:app',
            'autoprefixer',
            'browserify',
            'html2js',
            'less',
            'concat:defaults',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('build', [
        'clean:dist',
        'wiredep:app',
        'useminPrepare',
        'concurrent:dist',
        'autoprefixer',
        'browserify',
        'html2js',
	    'less',
        'concat',
        'ngAnnotate',
        'copy:dist',
        'copy:styles',
        'cssmin',
        'uglify',
        'filerev',
        'usemin',
        'htmlmin'
    ]);

    grunt.registerTask('test:unit', [
        'autoprefixer',
        'wiredep:test',
        'connect:test',
        'karma'
    ]);

    grunt.registerTask('default', [
        'newer:jshint',
        'test:unit',
        'build'
    ]);

    grunt.registerTask('dev', [
        'serve'
    ]);
};
