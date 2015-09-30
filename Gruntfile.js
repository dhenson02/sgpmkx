module.exports = function ( grunt ) {
	grunt.initConfig({
		browserify: {
			options: {},
			dist: {
				files: {
					'.tmp/main.js': 'main.js'
				}
			}
		},
		uglify: {
			dist: {
				options: {
					beautify: {
						indent_level: 2,
						width: 80,
						quote_style: 0,
						max_line_len: 1000,
						bracketize: true,
						semicolons: true
					},
					compress: {
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
						sequences: true,
						cascade: true
					},
					screwIE8: false,
					wrap: false,
					mangle: true,
					sourceMap: false,
					preserveComments: "some"
				},
				files: {
					'main.min.js': '.tmp/main.js'
				}
			},
			dev: {
				options: {
					compress: false,
					screwIE8: false,
					beautify: true,
					mangle: false,
					wrap: false,
					sourceMap: true
				},
				files: {
					'main.min.js': '.tmp/main.js'
				}
			}
		},
		purifycss: {
			options: {},
			dist: {
				src: ['content-src.aspx', 'main.min.js'],
				css: [
					'css/init.css',
					'css/main.css',
					'css/icons.css',
					'css/buttons.css',
					'css/generic.css',
					'css/codemirror.css',
					'css/nav.css',
					'css/tabs.css',
					'css/loader.css',
					/*'css/loader2.css',*/
					'node_modules/sweetalert/dist/sweetalert.css',
					'node_modules/animate.css/animate.min.css'
				],
				dest: '.tmp/main.css'
			},
			dev: {
				src: ['main_template.html', 'main.min.js'],
				css: [
					'css/init.css',
					'css/main.css',
					'css/icons.css',
					'css/buttons.css',
					'css/generic.css',
					'css/codemirror.css',
					'css/nav.css',
					'css/tabs.css',
					'css/loader.css',
					/*'css/loader2.css',*/
					'node_modules/sweetalert/dist/sweetalert.css',
					'node_modules/animate.css/animate.min.css'
				],
				dest: '.tmp/main.css'
			}
		},
		cssmin: {
			options: {
				roundingPrecision: -1,
				compatibility: 'ie8',
				processImport: false
			},
			dist: {
				options: {
					keepSpecialComments: 1
				},
				files: {
					'main.min.css': '.tmp/main.css'
				}
			},
			dev: {
				options: {
					keepSpecialComments: 2
				},
				files: {
					'main.min.css': '.tmp/main.css'
				}
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
					'css/*.css',
					'node_modules/sweetalert/dist/sweetalert.css',
					'node_modules/animate.css/*.min.css'
				],
				tasks: ['purifycss', 'cssmin:dev']
			},
			scripts: {
				options: {
					debounceDelay: 25,
					spawn: false,
					atBegin: true
				},
				files: [
					'data.js',
					'main.js',
					'nav.js',
					'tabs.js',
					'helpers.js',
					'store.js',
					'domStore.js'
				],
				tasks: [
					'browserify:dist',
					'uglify:dev',
					'purifycss:dev',
					'cssmin:dev'
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-purifycss');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('default', [
		'browserify:dist',
		'uglify:dist',
		'purifycss:dist',
		'cssmin:dist'
	]);
	grunt.registerTask('dev', [
		'browserify:dist',
		'uglify:dev',
		'purifycss:dev',
		'cssmin:dev'
	]);
};
