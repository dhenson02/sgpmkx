module.exports = function ( grunt ) {
	grunt.initConfig({
		browserify: {
			dist: {
				files: {
					'.tmp/main.min.js': 'src/js/main.js'
				}
			},
			dev: {
				files: {
					'dist/js/main.js': 'src/js/main.js'
				}
			}
		},
		uglify: {
			dist: {
				options: {
					beautify: {
						indent_level: 4,
						width: 80,
						quote_style: 0,
						max_line_len: 4000,
						semicolons: true
					},
					compress: {
					    es6: true,
						unsafe: true,
						drop_console: true,
						keep_fargs: false,
						join_vars: true,
						if_return: true,
						hoist_funs: true,
						unused: true,
						negate_iife: true,
						comparisons: true,
						conditionals: true,
						dead_code: true,
						sequences: true
					},
					reserved: "CodeMirror",
					wrap: false,
					mangle: true,
					sourceMap: true,
					preserveComments: "some"
				},
				files: {
					'dist/js/main.min.js': '.tmp/main.min.js'
				}
			},
			dev: {
				options: {
					compress: false,
					beautify: true,
					mangle: false,
					wrap: false,
					reserved: "CodeMirror",
					sourceMap: false,
					preserveComments: false
				},
				files: {
					'dist/js/main.js': '.tmp/main.js'
				}
			}
		},
		purifycss: {
			options: {},
			dist: {
				src: ['dist/main_template.html', 'dist/js/main.min.js'],
				css: [
					'src/css/init.css',
					'src/css/main.css',
					'src/css/generic.css',
					'src/css/icons.css',
					'src/css/buttons.css',
					'src/css/codemirror.css',
					'src/css/nav.css',
					'src/css/tabs.css',
					'src/css/loader.css',
					'src/css/loader2.css',
					'src/css/search.css',
					'src/css/create.css',
					'src/css/tags.css',
					'node_modules/sweetalert/dist/sweetalert.css',
					'node_modules/horsey/dist/horsey.min.css'
				],
				dest: '.tmp/main.min.css'
			},
			dev: {
				src: ['dist/main_template.html', 'dist/js/main.js'],
				css: [
					'src/css/init-dev.css',
					'src/css/main.css',
					'src/css/generic.css',
					'src/css/icons.css',
					'src/css/buttons.css',
					'src/css/codemirror.css',
					'src/css/nav.css',
					'src/css/tabs.css',
					'src/css/loader.css',
					'src/css/loader2.css',
					'src/css/search.css',
					'src/css/create.css',
					'src/css/tags.css',
					'node_modules/sweetalert/dist/sweetalert.css',
					'node_modules/horsey/dist/horsey.css'
				],
				dest: '.tmp/main.css'
			}
		},
		postcss: {
			options: {
				map: { inline: false },
				processors: [
					require('pixrem')(),
					require('autoprefixer')({ browsers: 'last 2 versions' }),
					require('cssnano')()
				]
			},
			dist: {
				src: '.tmp/main.min.css',
				dest: 'dist/css/main.min.css'
			},
			dev: {
				src: '.tmp/main.css',
				dest: 'dist/css/main.css'
			}
		},
		watch: {
			configFiles: {
				options: {
					debounceDelay: 25,
					reload: true
				},
				files: ['Gruntfile.js']
			},
			css: {
				options: {
					debounceDelay: 25,
					spawn: false,
					atBegin: false
				},
				files: [
					'src/css/*.css',
					'node_modules/sweetalert/dist/*.css',
					'node_modules/horsey/dist/*.css'
				],
				tasks: [
					'purifycss:dev',
				    'postcss:dev'
				]
			},
			scripts: {
				options: {
					debounceDelay: 25,
					spawn: false,
					atBegin: true
				},
				files: [
					'src/js/*.js'
				],
				tasks: [
					'browserify:dev',
					'purifycss:dev',
				    'postcss:dev'
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-purifycss');
	grunt.loadNpmTasks('grunt-postcss');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', [
		'browserify:dist',
		'uglify:dist',
		'purifycss:dist',
	    'postcss:dist'
	]);

	grunt.registerTask('dev', [
		'browserify:dev',
		'purifycss:dev',
	    'postcss:dev'
	]);

    grunt.registerTask('dev-min', [
        'browserify:dist',
        'uglify:dist',
        'purifycss:dev',
        'postcss:dev'
    ]);
};
