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
      'bootstrap-dialog': 'lib/bootstrap-dialog'
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
        }
    }
});

// Load the main app module to start the app
requirejs(['main']);