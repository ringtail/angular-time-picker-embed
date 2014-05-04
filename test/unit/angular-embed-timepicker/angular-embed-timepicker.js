'use strict';

// Set the jasmine fixture path
// jasmine.getFixtures().fixturesPath = 'base/';

describe('angular-embed-timepicker', function() {

    var module;
    var dependencies;
    dependencies = [];

    var hasModule = function(module) {
        return dependencies.indexOf(module) >= 0;
    };

    beforeEach(function() {

        // Get module
        module = angular.module('angular-embed-timepicker');
        dependencies = module.requires;
    });

    it('should load config module', function() {
        expect(hasModule('angular-embed-timepicker.config')).toBeTruthy();
    });

    

    
    it('should load directives module', function() {
        expect(hasModule('angular-embed-timepicker.directives')).toBeTruthy();
    });
    

    

});
