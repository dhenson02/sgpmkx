module.exports = function(grunt) {
  grunt.initConfig({
    browserify: {
      options: {},
      dist: {
        files: {
          'content5.pre.js': ['nav.js', 'content5.js', 'helpers.js', 'store.js', 'domStore.js']
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
          sourceMap: true
        },
        files: {
          'main.min.js': 'content5.pre.js',
          'landing.min.js': 'landing.js'
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
          'main.min.js': 'content5.pre.js',
          'landing.min.js': 'landing.js'
        }
      }
    },
    purifycss: {
      options: {},
      content: {
        src: ['manager2b.aspx', 'main.min.js'],
        css: ['pageview.css', 'buttons.css', 'generic.css', 'codemirror.css', 'modal.css', 'nav.css'],
        dest: 'pageview.pure.css'
      },
      landing: {
        src: ['landAction.aspx', 'landing.min.js'],
        css: ['landing.css'],
        dest: 'landing.pure.css'
      }
    },
    cssmin: {
      options: {
        roundingPrecision: -1,
        compatibility: 'ie8',
        processImport: false,
        keepSpecialComments: 1
      },
      dist: {
        files: {
          'pageview.min.css': 'pageview.pure.css',
          'landing.min.css': 'landing.pure.css'
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
        files: ['*.css'],
        tasks: ['purifycss', 'cssmin']
      },
      scripts: {
        options: {
          debounceDelay: 25,
          spawn: false,
          atBegin: true
        },
        files: ['content5.js', 'nav.js', 'helpers.js', 'store*.js', 'domStore*.js', 'landing.js'],
        tasks: ['browserify:dist', 'uglify:dev', 'purifycss', 'cssmin']
      }
    }
  });

  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-purifycss');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['browserify:dist', 'uglify:dist', 'purifycss', 'cssmin']);
  grunt.registerTask('dev', ['browserify:dist', 'uglify:dev', 'purifycss']);
};
