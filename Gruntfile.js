module.exports = function(grunt) {
  grunt.initConfig({
    browserify: {
      options: {},
      dist: {
        files: {
          //'content3b.pre.js': ['content3b.js', 'manager.js', 'store-dist.js', 'domStore-dist.js'],
          'content3.pre.js': ['content3.js', 'store.js', 'domStore.js']
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
          sourceMap: false
        },
        files: {
          'content3.min.js': [
            'helpers.js',
            //'actions.js',
            'content3.pre.js'
            //'render.js',
          ]
        }
      },
      dev: {
        options: {
          compress: false,
          screwIE8: false,
          beautify: true,
          mangle: false,
          wrap: false,
          sourceMap: false
        },
        files: {
          'content3.min.js': [
            'helpers.js',
            //'actions.js',
            'content3.pre.js'
            //'render.js',
          ]
        }
      }
    },
    purifycss: {
      options: {},
      target: {
        src: ['manager2b.aspx', 'content3.min.js'],
        css: ['pageview.css'],
        dest: 'pageview.pure.css'
      }
    },
    cssmin: {
      options: {
        roundingPrecision: -1,
        compatibility: 'ie8',
        processImport: false,
        keepSpecialComments: 0
      },
      dist: {
        files: {
          'pageview.min.css': 'pageview.pure.css'
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
        files: ['content3.js', 'manager.js', 'helpers.js', 'actions.js', 'render.js', 'store*.js', 'domStore*.js'],
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
