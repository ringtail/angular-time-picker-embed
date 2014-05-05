#angular-embed-timepicker

##Info
In ui-bootstrap, The timepicker directive can only set hours and minutes,and can't not only be used as hour selector
or minute selector,so I embed the timepicker.

##Settings

All settings can be provided as attributes in the <timepicker> or globally configured through the timepickerConfig.

    ng-model  : The Date object that provides the time state.

    hour-step  (Defaults: 1) : Number of hours to increase or decrease when using a button.

    minute-step  (Defaults: 1) : Number of minutes to increase or decrease when using a button.

    show-meridian  (Defaults: true) : Whether to display 12H or 24H mode.

    meridians (Defaults: null) : Meridian labels based on locale. To override you must supply an array like ['AM', 'PM'].

    readonly-input (Defaults: false) : Whether user can type inside the hours & minutes input.

    mousewheel (Defaults: true) : Whether user can scroll inside the hours & minutes input to increase or decrease it's values.

    disable-minutes (Defaults: false) : Whether user can use minute input.

    disable-seconds (Defaults: false): Whether user can use second input.

##Install from bower
```
    bower install angular-embed-timepicker
```
##How to use
demo like this:
```
    <!doctype html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Document</title>
        <link href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css" rel="stylesheet">
        <script src="bower_components/angular/angular.js"></script>
        <script src="src/angular-embed-timepicker/angular-embed-timepicker.js"></script>
    </head>
    <body ng-app="appModule">
    <script>
        var app = angular.module('appModule', ['angular.embed.timepicker']);
        app.controller('testController', ['$scope', function($scope) {
            $scope.mytime = new Date();
        }])
    </script>
    <div class="test-content" ng-controller="testController">
        <timepicker ng-model="$parent.mytime" ng-change="changed()"
                    show-meridian="ismeridian"></timepicker>
    </div>
    </body>
    </html>
```
##Enjoy it

any questions , <a href=mailto:zhongwei.lzw@alibaba-inc.com>mail me</a>