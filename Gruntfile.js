module.exports = function ( grunt ) {
	grunt.initConfig({
		browserify: {
			options: {
				sourceMap: true
			},
			dist: {
				files: {
					'.tmp/main.js': 'src/js/main.js'
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
					'dist/js/main.min.js': '.tmp/main.js'
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
					//'dist/js/main.min.js': '.tmp/main.js'
					'dist/js/main.js': 'dist/js/main.js'
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
					'src/css/icons.css',
					'src/css/buttons.css',
					'src/css/generic.css',
					'src/css/codemirror.css',
					'src/css/nav.css',
					'src/css/tabs.css',
					'src/css/loader.css',
					'src/css/search.css',
					/*'css/loader2.css',*/
					'node_modules/sweetalert/dist/sweetalert.css',
					'node_modules/horsey/dist/horsey.min.css'
					/*'node_modules/animate.css/animate.min.css'*/
				],
				dest: '.tmp/main.css'
			},
			dev: {
				src: ['dist/main_template.html', 'dist/js/main.js'],
				css: [
					'src/css/init-dev.css',
					'src/css/main.css',
					'src/css/icons.css',
					'src/css/buttons.css',
					'src/css/generic.css',
					'src/css/codemirror.css',
					'src/css/nav.css',
					'src/css/tabs.css',
					'src/css/loader.css',
					'src/css/search.css',
					/*'css/loader2.css',*/
					'node_modules/sweetalert/dist/sweetalert.css',
					'node_modules/horsey/dist/horsey.css'
					/*'node_modules/animate.css/animate.min.css'*/
				],
				dest: 'dist/css/main.css'
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
					'dist/css/main.min.css': '.tmp/main.css'
				}
			},
			dev: {
				options: {
					keepSpecialComments: 2
				},
				files: {
					'dist/css/main.css': 'dist/css/main.css'
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
					'src/css/*.css',
					'node_modules/sweetalert/dist/*.css',
					'node_modules/horsey/dist/*.css'
					/*'node_modules/animate.css/!*.min.css'*/
				],
				tasks: [
					'purifycss:dev',
					'cssmin:dev'
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
		'browserify:dev',
		'uglify:dev',
		'purifycss:dev',
		'cssmin:dev'
	]);
};
