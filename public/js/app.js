requirejs.config({
    'baseUrl': 'js',
    'paths': {
      'jquery': 'lib/jquery',
      'jquery-form': 'lib/jquery.form.min',
      'bootstrap': 'lib/bootstrap.min',
      'fileinput': 'lib/fileinput.min',
      'rsvp': 'lib/rsvp',
      'underscore': 'lib/underscore',
      'text': 'lib/require_text',
      'x-editable': 'lib/bootstrap-editable',
      'bootstrap-dialog': 'lib/bootstrap-dialog',
      'bootstrap-select': 'lib/bootstrap-select',
      'react': 'lib/react/build/react-with-addons',
      'JSXTransformer': 'lib/react/build/JSXTransformer',
      'jsx': 'lib/react/build/jsx'
    },
    'shim': {
        'jquery-form': {
        	deps: ['jquery']
        },
        'bootstrap' : {
        	deps: ['jquery']
        },
        'fileinput': {
        	deps: ['jquery']
        },
        'x-editable': {
          deps: ['jquery', 'bootstrap']
        },
        'bootstrap-dialog': {
          deps: ['jquery', 'bootstrap']
        },
        'bootstrap-select': {
          deps: ['jquery', 'bootstrap']
        }
    }
});

// Load the main app module to start the app
requirejs(['main']);