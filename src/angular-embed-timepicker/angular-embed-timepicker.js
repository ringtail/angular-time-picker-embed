
// Create all modules and define dependencies to make sure they exist
// and are loaded in the correct order to satisfy dependency injection
// before all nested files are concatenated by Grunt

// Config
/*
 --------------------------------------------
| embed timepicker for angularjs             |
| the directive of timepicker in ui-bootstrap|
| can't set second , and here come the one   |
 --------------------------------------------
\     /\  ___  /\
 \   // \/   \/ \\
    ((    O O    ))
     \\ /     \ //
      \/  | |  \/
       |  | |  |
       |  | |  |
       |   o   |
       | |   | |
       |m|   |m|
*/
// Modules
angular.module('angular.embed.timepicker', [])

    .constant('timepickerConfig', {
        hourStep: 1,
        minuteStep: 1,
        secondStep: 1,
        showMeridian: true,
        meridians: null,
        readonlyInput: false,
        mousewheel: true
    })

    .directive('timepicker', ['$parse', '$log', 'timepickerConfig', '$locale', function ($parse, $log, timepickerConfig, $locale) {
        return {
            restrict: 'EA',
            require:'?^ngModel',
            replace: true,
            scope: {
                disableSeconds:"=",
                disableMinutes:"="
            },
            templateUrl: 'template/angular-embed-timepicker/embedTimepicker.html',
            link: function(scope, element, attrs, ngModel) {
                if ( !ngModel ) {
                    return; // do nothing if no ng-model
                }

                scope.$parent.$watch($parse(attrs.ngDisabled), function(value) {
                    scope.readonlyInput = value;
                });

                var selected = new Date(),
                    meridians = angular.isDefined(attrs.meridians) ? scope.$parent.$eval(attrs.meridians) : timepickerConfig.meridians || $locale.DATETIME_FORMATS.AMPMS;

                var hourStep = timepickerConfig.hourStep;

                if (attrs.hourStep) {
                    scope.$parent.$watch($parse(attrs.hourStep), function(value) {
                        hourStep = parseInt(value, 10);
                    });
                }

                var minuteStep = timepickerConfig.minuteStep;

                if (attrs.minuteStep) {
                    scope.$parent.$watch($parse(attrs.minuteStep), function(value) {
                        minuteStep = parseInt(value, 10);
                    });
                }

                var secondStep = timepickerConfig.secondStep;
                if (attrs.secondStep){
                    scope.$parent.$watch($parse(attrs.secondStep), function(value) {
                        secondStep = parseInt(value, 10);
                    });
                }

                // 12H / 24H mode
                scope.showMeridian = timepickerConfig.showMeridian;
                if (attrs.showMeridian) {
                    scope.$parent.$watch($parse(attrs.showMeridian), function(value) {
                        scope.showMeridian = !!value;

                        if ( ngModel.$error.time ) {
                            // Evaluate from template
                            var hours = getHoursFromTemplate(), minutes = getMinutesFromTemplate();
                            if (angular.isDefined( hours ) && angular.isDefined( minutes )) {
                                selected.setHours( hours );
                                refresh();
                            }
                        } else {
                            updateTemplate();
                        }
                    });
                }

                // Get scope.hours in 24H mode if valid
                function getHoursFromTemplate ( ) {
                    var hours = parseInt( scope.hours, 10 );
                    var valid = ( scope.showMeridian ) ? (hours > 0 && hours < 13) : (hours >= 0 && hours < 24);
                    if ( !valid ) {
                        return undefined;
                    }

                    if ( scope.showMeridian ) {
                        if ( hours === 12 ) {
                            hours = 0;
                        }
                        if ( scope.meridian === meridians[1] ) {
                            hours = hours + 12;
                        }
                    }
                    return hours;
                }

                function getMinutesFromTemplate() {
                    var minutes = parseInt(scope.minutes, 10);
                    return ( minutes >= 0 && minutes < 60 ) ? minutes : undefined;
                }


                function getSecondsFromTemplate(){
                    var seconds = parseInt(scope.seconds ,10);
                    return ( seconds >= 0 && seconds < 60 ) ? seconds : undefined;
                }

                function pad( value ) {
                    return ( angular.isDefined(value) && value.toString().length < 2 ) ? '0' + value : value;
                }

                // Input elements
                var inputs = element.find('input'), hoursInputEl = inputs.eq(0), minutesInputEl = inputs.eq(1),secondsInputEl = inputs.eq(2);

                // Respond on mousewheel spin
                var mousewheel = (angular.isDefined(attrs.mousewheel)) ? scope.$eval(attrs.mousewheel) : timepickerConfig.mousewheel;
                if ( mousewheel ) {

                    var isScrollingUp = function(e) {
                        if (e.originalEvent) {
                            e = e.originalEvent;
                        }
                        //pick correct delta variable depending on event
                        var delta = (e.wheelDelta) ? e.wheelDelta : -e.deltaY;
                        return (e.detail || delta > 0);
                    };

                    hoursInputEl.bind('mousewheel wheel', function(e) {
                        if(scope.readonlyInput) return;
                        scope.$apply( (isScrollingUp(e)) ? scope.incrementHours() : scope.decrementHours() );
                        e.preventDefault();
                    });

                    minutesInputEl.bind('mousewheel wheel', function(e) {
                        if(scope.readonlyInput) return;
                        scope.$apply( (isScrollingUp(e)) ? scope.incrementMinutes() : scope.decrementMinutes() );
                        e.preventDefault();
                    });
                    secondsInputEl.bind('mousewheel wheel',function(e){
                        if(scope.readonlyInput) return;
                        scope.$apply( (isScrollingUp(e)) ? scope.incrementSeconds() : scope.decrementSeconds() );
                        e.preventDefault();
                    });

                }

                scope.readonlyInput = (angular.isDefined(attrs.readonlyInput)) ? scope.$eval(attrs.readonlyInput) : timepickerConfig.readonlyInput;
                if ( ! scope.readonlyInput ) {

                    var invalidate = function(invalidHours, invalidMinutes ,invalidSeconds) {
                        ngModel.$setViewValue( null );
                        ngModel.$setValidity('time', false);
                        if (angular.isDefined(invalidHours)) {
                            scope.invalidHours = invalidHours;
                        }
                        if (angular.isDefined(invalidMinutes)) {
                            scope.invalidMinutes = invalidMinutes;
                        }
                        if (angular.isDefined(invalidSeconds)){
                            scope.invalidSeconds = invalidSeconds;
                        }
                    };

                    scope.updateHours = function() {
                        var hours = getHoursFromTemplate();

                        if ( angular.isDefined(hours) ) {
                            selected.setHours( hours );
                            refresh( 'h' );
                        } else {
                            invalidate(true);
                        }
                    };

                    hoursInputEl.bind('blur', function(e) {
                        if ( !scope.validHours && scope.hours < 10) {
                            scope.$apply( function() {
                                scope.hours = pad( scope.hours );
                            });
                        }
                    });

                    scope.updateMinutes = function() {
                        var minutes = getMinutesFromTemplate();

                        if ( angular.isDefined(minutes) ) {
                            selected.setMinutes( minutes );
                            refresh( 'm' );
                        } else {
                            invalidate(undefined, true);
                        }
                    };

                    minutesInputEl.bind('blur', function(e) {
                        if ( !scope.invalidMinutes && scope.minutes < 10 ) {
                            scope.$apply( function() {
                                scope.minutes = pad( scope.minutes );
                            });
                        }
                    });


                    scope.updateSeconds = function() {
                        var seconds = getSecondsFromTemplate();

                        if ( angular.isDefined(seconds) ) {
                            selected.setSeconds( seconds );
                            refresh( 's' );
                        } else {
                            invalidate(undefined, true);
                        }
                    };

                    secondsInputEl.bind('blur',function(e){
                        if ( !scope.invalidSeconds && scope.seconds < 10 ) {
                            scope.$apply( function() {
                                scope.seconds = pad( scope.seconds );
                            });
                        }
                    });

                } else {
                    scope.updateHours = angular.noop;
                    scope.updateMinutes = angular.noop;
                    scope.updateSeconds = angular.noop;
                }

                ngModel.$render = function() {
                    var date = ngModel.$modelValue ? new Date( ngModel.$modelValue ) : null;

                    if ( isNaN(date) ) {
                        ngModel.$setValidity('time', false);
                        $log.error('Timepicker directive: "ng-model" value must be a Date object, a number of milliseconds since 01.01.1970 or a string representing an RFC2822 or ISO 8601 date.');
                    } else {
                        if ( date ) {
                            selected = date;
                        }
                        makeValid();
                        updateTemplate();
                    }
                };

                // Call internally when we know that model is valid.
                function refresh( keyboardChange ) {
                    makeValid();
                    ngModel.$setViewValue( new Date(selected) );
                    updateTemplate( keyboardChange );
                }

                function makeValid() {
                    ngModel.$setValidity('time', true);
                    scope.invalidHours = false;
                    scope.invalidMinutes = false;
                    scope.invalidSeconds = false;
                }

                function updateTemplate( keyboardChange ) {
                    var hours = selected.getHours(), minutes = selected.getMinutes(),seconds = selected.getSeconds();

                    if ( scope.showMeridian ) {
                        hours = ( hours === 0 || hours === 12 ) ? 12 : hours % 12; // Convert 24 to 12 hour system
                    }
                    scope.hours =  keyboardChange === 'h' ? hours : pad(hours);
                    scope.minutes = keyboardChange === 'm' ? minutes : pad(minutes);
                    scope.seconds = keyboardChange === 's' ? seconds : pad(seconds);
                    scope.meridian = selected.getHours() < 12 ? meridians[0] : meridians[1];


                    console.log(ngModel.$modelValue);
                    console.log(scope.$parent);
                }

                function addTime( seconds ) {
                    var dt = new Date( selected.getTime() + seconds * 1000);
                    selected.setHours( dt.getHours(), dt.getMinutes(),dt.getSeconds());
                    refresh();
                }



                scope.incrementHours = function() {
                    addTime( secondStep * 60 * 60);
                };
                scope.decrementHours = function() {
                    addTime( - secondStep * 60 * 60);
                };
                scope.incrementMinutes = function() {
                    addTime( secondStep * 60);
                };
                scope.decrementMinutes = function() {
                    addTime( - secondStep * 60 );
                };

                scope.incrementSeconds = function(){
                   addTime(secondStep);
                };

                scope.decrementSeconds = function(){
                    addTime( - secondStep);
                };


                scope.toggleMeridian = function() {
                    addTime( 12 * 60 * (( selected.getHours() < 12 ) ? 1 : -1) * 60 );
                };
            }
        };



    }]);
angular.module("template/angular-embed-timepicker/embedTimepicker.html", []).run(["$templateCache", function ($templateCache) {
    $templateCache.put("template/angular-embed-timepicker/embedTimepicker.html",
      "<table>" +
        "<tbody>" +
            "<tr class=\"text-center\">" +
                "<td>" +
                    "<a ng-click=\"incrementHours()\" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-chevron-up\"></span></a>" +
                "</td>" +
                "<td ng-hide=\"disableMinutes\">&nbsp;</td>" +
                "<td ng-hide=\"disableMinutes\">" +
                    "<a ng-click=\"incrementMinutes()\" class=\"btn btn-link\">" +
                        "<span class=\"glyphicon glyphicon-chevron-up\"></span>" +
                    "</a>" +
                "</td>" +
                "<td ng-hide=\"disableSeconds\">&nbsp;</td>" +
                "<td ng-hide=\"disableSeconds\">" +
                   " <a ng-click=\"incrementSeconds()\" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-chevron-up\"></span></a>" +
                "</td>" +
                "<td ng-show=\"showMeridian\"></td>" +
            "</tr>" +
            "<tr>" +
                "<td style=\"width:50px;\" class=\"form-group\" ng-class=\"{'has-error': invalidHours}\">" +
                    "<input type=\"text\" ng-model=\"hours\" ng-change=\"updateHours()\" class=\"form-control text-center\" ng-mousewheel=\"incrementHours()\" ng-readonly=\"readonlyInput\" maxlength=\"2\">" +
     "</td>" +
     "<td ng-hide=\"disableMinutes\">:</td>" +
     "<td ng-hide=\"disableMinutes\" style=\"width:50px;\" class=\"form-group\" ng-class=\"{'has-error': invalidMinutes}\">" +
     "<input type=\"text\" ng-model=\"minutes\" ng-change=\"updateMinutes()\" class=\"form-control text-center\" ng-readonly=\"readonlyInput\" maxlength=\"2\">" +
     "</td>" +
     "<td ng-hide=\"disableSeconds\">:</td>" +
     "<td ng-hide=\"disableSeconds\" style=\"width:50px;\" class=\"form-group\" ng-class=\"{'has-error': invalidSeconds}\"><input type=\"text\" ng-model=\"seconds\" ng-change=\"updateSeconds()\" class=\"form-control text-center\" ng-readonly=\"readonlyInput\" maxlength=\"2\">" +
     "</td>" +
     "<td ng-show=\"showMeridian\">" +
         "<button type=\"button\" class=\"btn btn-default text-center\" ng-click=\"toggleMeridian()\">{{meridian}}</button>" +
     "</td>" +
    "</tr>" +
    "<tr class=\"text-center\">" +
        "<td>" +
            "<a ng-click=\"decrementHours()\" class=\"btn btn-link\">" +
                "<span class=\"glyphicon glyphicon-chevron-down\"></span>" +
            "</a>" +
        "</td>" +
        "<td ng-hide=\"disableMinutes\">&nbsp;</td>" +
        "<td ng-hide=\"disableMinutes\">" +
            "<a ng-click=\"decrementMinutes()\" class=\"btn btn-link\">" +
                "<span class=\"glyphicon glyphicon-chevron-down\"></span>" +
            "</a>" +
        "</td>" +
        "<td ng-hide=\"disableSeconds\">&nbsp;</td>" +
        "<td ng-hide=\"disableSeconds\">" +
            "<a ng-click=\"decrementSeconds()\" class=\"btn btn-link\"><span class=\"glyphicon glyphicon-chevron-down\"></span></a>" +
                "<td ng-show=\"showMeridian\"></td>" +
            "</tr>" +
        "</tbody>" +
    "</table>");
}]);